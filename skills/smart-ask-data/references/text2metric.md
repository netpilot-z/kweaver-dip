# 子能力编排：metric_search -> text2metric（并列能力，非主流程）

本子能力与 `text2sql` 并列维护，但默认不进入 `smart-ask-data` 的 Step 1~7 主流程。

固定两段式调用：

1. `metric_search` 按用户问题检索候选指标
2. `text2metric` 以候选指标列表执行自然语言指标查询

## Step 1：metric_search（筛指标）

- 路径：`/api/af-sailor-agent/v1/assistant/tools/metric_search`
- 方法：`POST`
- 关键参数：
  - `action`：`filter`
  - `query`：用户问题
  - `auth.token`：认证 token
  - `config.data_source_num_limit`：可选，控制候选条数

请求示例：

```json
{
  "auth": {
    "token": "<token>"
  },
  "config": {
    "data_source_num_limit": 10,
    "page_size": 200
  },
  "action": "filter",
  "query": "查询最近3个月华东区域销售额趋势"
}
```

输出重点字段：

- `matched_count`
- `metric_summary`（优先取 `id` 字段）
- `metrics`（完整候选指标信息）

当 `matched_count == 0` 时必须终止，不进入 Step 2。

## Step 2：text2metric（查指标）

- 路径：`/api/af-sailor-agent/v1/assistant/tools/text2metric`
- 方法：`POST`
- 关键参数：
  - `input`：用户问题
  - `action`：`query`
  - `data_source.metric_list`：Step 1 得到的候选指标 ID 数组
  - `data_source.base_url`、`data_source.token`、`data_source.user_id`
  - `inner_llm.name`：模型名

请求示例：

```json
{
  "input": "查询最近3个月华东区域销售额趋势",
  "action": "query",
  "data_source": {
    "metric_list": [
      "metric_sales_amount_monthly",
      "metric_sales_amount_region"
    ],
    "base_url": "https://your-gateway-host",
    "token": "<token>",
    "user_id": "<user_id>",
    "account_type": "user"
  },
  "inner_llm": {
    "name": "deepseek_v3"
  },
  "config": {
    "session_type": "redis",
    "session_id": "text2metric-demo-session",
    "recall_top_k": 10,
    "dimension_num_limit": 10,
    "return_record_limit": 50,
    "return_data_limit": 5000
  },
  "infos": {
    "extra_info": "",
    "knowledge_enhanced_information": {}
  }
}
```

输出重点字段：

- `metric_id`
- `query_params`
- `data` / `data_desc`
- `result_cache_key`（若返回）

## 最小交付建议

- 指标筛选结果：列出 Step 1 的 `metric_summary`（至少包含 `id`、`name`）
- 最终执行指标：`metric_id`
- 查询参数：`query_params`
- 返回数据与数据描述：`data`、`data_desc`
