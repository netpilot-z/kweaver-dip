# execute-code-sync（代码同步执行子技能）

用于将结构化 `event` 数据传入运行时代码并同步返回结果，适合做 SQL 之外的轻量二次加工（聚合、派生字段、格式转换、结果拼接）。

## 使用场景

- 需要 Python/JavaScript/shell 逻辑处理数据，且 SQL 难以直接表达。
- 需要把多段上游结果合并后再输出统一结果。
- 需要生成可复核的中间计算结果（如占比、排名、分组汇总）。

## 输入要求

- 认证信息：`token`、`base_url`。
- 执行参数：`poll_interval`、`sync_timeout`、`timeout`。
- 代码与上下文：`language`、`code`（需包含 `handler(event)`）、`event`（结构化输入数据）。
- 可选：`session_id`、`stream`、`config`。

## 执行步骤

1. **准备配置**：读取 `../config.json` 中 `tools.execute_code_sync` 配置，拼接请求地址 `base_url + url_path`。
2. **准备请求体**：构造 `code`、`language`、`event`、`timeout` 与 `auth.token`。
3. **发起同步调用**：携带 Header `Authorization` 与 `x-business-domain`，提交执行请求。
4. **等待执行完成**：按 `poll_interval` 与 `sync_timeout` 等待执行状态。
5. **返回结果**：输出 `status`、`exit_code`、`return_value`、`stderr/stdout`。

## 关键约束

- `Authorization` 与 `body.auth.token` 必须一致。
- `code` 必须可执行，且 `handler(event)` 返回 JSON 可序列化结果。
- `event` 仅传必要字段，避免超大 payload。
- 超时或失败时必须保留原始错误信息，不得改写执行结果。

## 最小请求示例

```json
{
  "auth": { "token": "{token}" },
  "session_id": "sess-exec-sync-001",
  "code": "def handler(event):\n    rows = event.get('rows', [])\n    total = sum(float(r.get('amount', 0) or 0) for r in rows)\n    return {'total_amount': total}",
  "language": "python",
  "timeout": 120,
  "event": {
    "rows": [
      { "region_name": "华东", "amount": 1200000 },
      { "region_name": "华北", "amount": 800000 }
    ]
  },
  "stream": false
}
```

## 输出要求

1. 执行状态：`status`、`exit_code`
2. 业务结果：`return_value`
3. 调试信息：`stderr`、`stdout`（如有）
4. 最小执行口径：`language`、`timeout`、`poll_interval/sync_timeout`

## 不做事项

- 不替代找表、问数或图表子技能。
- 不输出主观业务解读与策略建议。
- 不在失败时伪造计算结果。

## 失败处理

- 明确返回失败原因（认证失败、代码异常、超时、参数缺失）。
- 提示可执行修复方向（补 token、缩小 event、修正 handler）。
- 保留原始错误日志，便于复现与排查。
