# 找表编排：端到端示例（逻辑顺序）

以下为 **流程骨架**；**逐步可复制 Header/Body 样例** 见：

- 前置：**runtime_ready** — 确认 `base_url`、`user_id`、`token`；其中 **`base_url`、`user_id` 通过 `kweaver auth whoami` 获取**（Issuer / User ID），`token` 见 `kweaver token` 等（与 [SKILL.md](../SKILL.md)「Step 1」一致）
- [query-object-instance.md](query-object-instance.md)（第 2 步 · `query_object_instance`）
- [department-duty-query.md](department-duty-query.md)（第 3 步 · `department_duty_query`）

完整网关 URL 约定为 `base_url` + `tools.<tool>.url_path`；`kn_id`、`user_id` 以 [smart-search-tables/config.json](../config.json) 与各子 `config.json` 为准；两套 `kn_id`（**元数据** vs **职责**）勿混用。

说明：`custom_search_strategy` 与 `datasource_rerank` 为可选子工具（配置在 `tools` 中），但不加入本 skill 的默认 `pipeline`。

## 1. runtime_ready — 连接凭据（主流程 Step 1）

- 须先确认 **`base_url`、`user_id`（`x-account-id`）、`token`** 可用，再调用下方 HTTP 工具。
- **`base_url` 与 `user_id`**：执行 **`kweaver auth whoami`**（须先 `kweaver auth login`），从输出读取 **Issuer** → `base_url`，**User ID** → `user_id`。
- 完整门禁与兜底来源见 [SKILL.md](../SKILL.md)「Step 1：`runtime_ready`」。

## 2. query_object_instance — 找表/元数据对象

- URL 含 **`tool-box`** 时：POST 的 JSON 根级包含 **`body`**（`auth`、`limit`、`condition` 等）、**`query`**（**`kn_id`**、`ot_id`、`include_logic_params`/`include_type_info` 为布尔值）、**`header`**（`x-account-id`、`x-account-type`）。详见 [query-object-instance.md](query-object-instance.md)。

## 3. department_duty_query — 相关部门职责

- 根据上一步提炼的部门与主题，构造 `query`，`kn_id` 使用职责网默认值（如 `duty`）。

## 4. 总结（本 skill 主文档步骤）

- **表/视图结论**：候选列表 **仅** 收录 Step 2 检索结果中 **同时具备** 非空 **UUID**（如 `view_uuid`）、非空 **`technical_name`** 与非空 **`business_name`** 的条目；任一缺失则 **整行省略**；**禁止**用职责库、推测或「暂无」补造视图表项。细则见 [SKILL.md](../SKILL.md)「最终交付：视图/表清单真实性」。
- **职责结论**：相关部门在数据/指标上的职责要点；与表归属的对应关系（有则写，无则注明「未在职责库中直接关联」）。
- **下一步**：若用户需 **取数**，引导至 [smart-ask-data/SKILL.md](../../smart-ask-data/SKILL.md)；若需 **换 KN**，与 [smart-data-analysis/SKILL.md](../../smart-data-analysis/SKILL.md) 的 `kn_id_search_tables` 对齐。
