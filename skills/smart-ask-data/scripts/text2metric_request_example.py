#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
text2metric 并列子能力串联调用示例：
1) 先调用 metric_search 检索候选指标
2) 再调用 text2metric 执行指标查询

使用方式（Windows PowerShell）:
  $env:TEXT2METRIC_BASE_URL="https://your-gateway-host"
  $env:TEXT2METRIC_TOKEN="<token>"
  $env:TEXT2METRIC_USER_ID="<user_id>"
  python skills/smart-ask-data/scripts/text2metric_request_example.py ^
    --query "查询最近3个月华东区域销售额趋势" ^
    --inner-llm-name "deepseek_v3"
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from typing import Any, Dict, List, Tuple
from uuid import uuid4


DEFAULT_METRIC_SEARCH_PATH = "/api/af-sailor-agent/v1/assistant/tools/metric_search"
DEFAULT_TEXT2METRIC_PATH = "/api/af-sailor-agent/v1/assistant/tools/text2metric"
DEFAULT_X_BUSINESS_DOMAIN = "bd_public"


def _clean_token(raw: str) -> str:
    token = (raw or "").strip()
    if token.lower().startswith("bearer "):
        return token
    return token


def _resolve_required(name: str, cli_value: str, env_key: str) -> str:
    value = (cli_value or "").strip() or os.environ.get(env_key, "").strip()
    if value:
        return value
    raise ValueError(f"缺少 {name}，请传入参数或设置环境变量 {env_key}")


def _post_json(url: str, payload: Dict[str, Any], headers: Dict[str, str], timeout: int) -> Dict[str, Any]:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(url=url, data=body, method="POST", headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {e.code} {e.reason}: {error_body}") from e
    except urllib.error.URLError as e:
        raise RuntimeError(f"请求失败: {e.reason}") from e

    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise RuntimeError(f"响应不是合法 JSON: {raw}") from e


def _extract_metric_ids(metric_search_result: Dict[str, Any], top_k: int) -> List[str]:
    metric_ids: List[str] = []
    candidates = metric_search_result.get("metric_summary") or metric_search_result.get("metrics") or []
    for item in candidates:
        if not isinstance(item, dict):
            continue
        metric_id = str(item.get("id") or "").strip()
        if not metric_id:
            continue
        metric_ids.append(metric_id)
        if top_k > 0 and len(metric_ids) >= top_k:
            break
    return metric_ids


def build_metric_search_payload(query: str, token: str, candidate_limit: int, page_size: int) -> Dict[str, Any]:
    return {
        "auth": {
            "token": token,
        },
        "config": {
            "data_source_num_limit": candidate_limit,
            "page_size": page_size,
        },
        "action": "filter",
        "query": query,
    }


def build_text2metric_payload(
    query: str,
    metric_ids: List[str],
    base_url: str,
    token: str,
    user_id: str,
    account_type: str,
    inner_llm_name: str,
    session_type: str,
) -> Dict[str, Any]:
    return {
        "input": query,
        "action": "query",
        "data_source": {
            "metric_list": metric_ids,
            "base_url": base_url,
            "token": token,
            "user_id": user_id,
            "account_type": account_type,
        },
        "inner_llm": {
            "name": inner_llm_name,
        },
        "config": {
            "session_type": session_type,
            "session_id": f"text2metric-demo-{uuid4()}",
            "recall_top_k": max(len(metric_ids), 1),
            "dimension_num_limit": 10,
            "return_record_limit": 50,
            "return_data_limit": 5000,
        },
        "infos": {
            "extra_info": "",
            "knowledge_enhanced_information": {},
        },
    }


def run_pipeline(args: argparse.Namespace) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    base_url = _resolve_required("base_url", args.base_url, "TEXT2METRIC_BASE_URL").rstrip("/")
    token = _clean_token(_resolve_required("token", args.token, "TEXT2METRIC_TOKEN"))
    user_id = _resolve_required("user_id", args.user_id, "TEXT2METRIC_USER_ID")

    headers = {
        "Content-Type": "application/json; charset=utf-8",
        "x-business-domain": args.x_business_domain or DEFAULT_X_BUSINESS_DOMAIN,
        "Authorization": token,
    }

    metric_search_url = base_url + args.metric_search_path
    text2metric_url = base_url + args.text2metric_path

    metric_search_payload = build_metric_search_payload(
        query=args.query,
        token=token,
        candidate_limit=args.candidate_limit,
        page_size=args.page_size,
    )
    metric_search_resp = _post_json(
        url=metric_search_url,
        payload=metric_search_payload,
        headers=headers,
        timeout=args.timeout,
    )

    # api_tool_decorator 返回格式一般为 {"result": {...}, ...}
    metric_search_result = metric_search_resp.get("result", metric_search_resp)
    matched_count = int(metric_search_result.get("matched_count") or 0)
    metric_ids = _extract_metric_ids(metric_search_result, top_k=args.top_k)
    if matched_count <= 0 or not metric_ids:
        raise RuntimeError("metric_search 未检索到可用指标，流程终止")

    text2metric_payload = build_text2metric_payload(
        query=args.query,
        metric_ids=metric_ids,
        base_url=base_url,
        token=token,
        user_id=user_id,
        account_type=args.account_type,
        inner_llm_name=args.inner_llm_name,
        session_type=args.session_type,
    )
    text2metric_resp = _post_json(
        url=text2metric_url,
        payload=text2metric_payload,
        headers=headers,
        timeout=args.timeout,
    )
    return metric_search_resp, text2metric_resp


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="metric_search -> text2metric 两阶段串联调用示例")
    parser.add_argument("--query", required=True, help="用户指标查询问题")
    parser.add_argument("--base-url", default="", help="网关根地址；也可用 TEXT2METRIC_BASE_URL")
    parser.add_argument("--token", default="", help="认证 token；也可用 TEXT2METRIC_TOKEN")
    parser.add_argument("--user-id", default="", help="用户 ID；也可用 TEXT2METRIC_USER_ID")
    parser.add_argument("--inner-llm-name", default="deepseek_v3", help="text2metric 内部模型名")
    parser.add_argument("--account-type", default="user", choices=["user", "app", "anonymous"])
    parser.add_argument("--session-type", default="redis", choices=["redis", "in_memory"])
    parser.add_argument("--candidate-limit", type=int, default=10, help="metric_search 候选召回上限")
    parser.add_argument("--page-size", type=int, default=200, help="metric_search 分页大小")
    parser.add_argument("--top-k", type=int, default=5, help="传给 text2metric 的候选 metric_id 数量")
    parser.add_argument("--timeout", type=int, default=120, help="HTTP 请求超时秒数")
    parser.add_argument("--x-business-domain", default=DEFAULT_X_BUSINESS_DOMAIN)
    parser.add_argument("--metric-search-path", default=DEFAULT_METRIC_SEARCH_PATH)
    parser.add_argument("--text2metric-path", default=DEFAULT_TEXT2METRIC_PATH)
    parser.add_argument("--out", default="", help="可选：输出文件路径，写入完整 JSON 结果")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        metric_search_resp, text2metric_resp = run_pipeline(args)
    except Exception as e:
        print(f"[ERROR] {e}", file=sys.stderr)
        return 1

    out = {
        "metric_search_response": metric_search_resp,
        "text2metric_response": text2metric_resp,
    }
    print(json.dumps(out, ensure_ascii=False, indent=2))

    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"[INFO] saved to {args.out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
