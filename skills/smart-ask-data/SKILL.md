---
name: smart-ask-data
version: "1.0.0"
user-invocable: true
description: >-
  问数端到端编排（能力范围仅限查询数据）：**第 1 步**先确认 `base_url`、`user_id`、`token`、`inner_llm.name`（大模型名称：优先 OpenClaw/宿主 Agent **记忆区**，无则须用户传入或确认）；其后若已指定 KN 或仅一个候选 KN 则直接使用，否则 `kn_select` 选定知识网络，再用 text2sql 的 show_ds → gen_exec 取数；**gen_exec** 若首次「成功但无数据行」，可按正文 **空结果重试** 总结问题后**最多再试 2 次**（单轮合计 ≤3 次），仍无行则停止并报告「未查询到相关数据」；
  回复中仅原样展示 SQL 与结果，并附与 SQL 一致的最小口径说明；**交付**中的「候选表」区块 **不是** `show_ds` 返回的全量表列表，须按 **表/字段描述（comment、DDL 列注释等）** 与用户问题筛入相关表后，若筛入 **≥2** 张再 **另列「候选表」（B′）**，且表路径/标识与接口 **逐字一致**（见正文「交付用候选表（B′）」）。
  不执行 execute_code_sync、不执行 json2plot；不对结果做业务解读、对比结论、趋势判断或外延「分析」。
  当用户需要列表/明细/可 SQL 表达的汇总（查询数据）时使用。
metadata:
  openclaw:
    skillKey: smart-ask-data
argument-hint: [中文问数问题；可选已有 kn_id 或候选 kn 列表]
---

# Smart Ask Data（问数）

本 skill 定义 **固定先后顺序** 的问数工具链；各工具的参数细节、Header/Body 与配置文件路径以 **同名子 skill** 为准，本仓库在 `references/` 中为每一步提供 **编排说明 + 跳转链接**。

**OpenClaw**：`metadata.openclaw.skillKey` 为 `smart-ask-data`。编排元数据与流水线声明见 [config.json](config.json)。

在数据分析员工体系中，本 skill **必须由** [smart-data-analysis](../smart-data-analysis/SKILL.md) **总入口完成意图与 KN 编排后再进入执行**；仅当用户明确使用 `/smart-ask-data` 强制调用时可直接进入。

**临时脚本来源（说明）**：本 skill 调度 text2sql / kn_select 等 HTTP 调用时，在本机使用的 **临时脚本**（文件名通常 `_tmp_*`，后缀 `.py`/`.sh`/`.ps1`）**必须是** 仓库内对应 **`*_request_example*` 样例脚本的整文件复制件**（仅重命名、不改源码逻辑），通过命令行与环境变量传入本轮参数；**禁止**从零新建空脚本或摘抄片段自行拼装。**样例原件**随 skill 提供（如 [scripts/text2sql_request_example.py](scripts/text2sql_request_example.py)、`kn_select` 等价样例等），与 [references/text2sql.md](references/text2sql.md) 等 reference 中的「请求方式」一致。清理与安全边界见下文「临时脚本与临时数据清理（Step 7）」。

## 能力边界（ MUST ）

- **在本 skill 内只做「查询数据」**：**Step 1** 确认 **`base_url`、`user_id`、`token`、`inner_llm.name`** 就绪 → `kn_select`（如需）→ `text2sql show_ds` → `text2sql gen_exec`（**空结果时**可按 **「`gen_exec` 空结果重试」** 至多 **3** 次累计调用），交付 **SQL + 结果集** 及 **与 SQL 一致的最小口径**（时间、主体、过滤维度等）。Step 6 的 **B′ 候选表** 须按 **「交付用候选表（B′）」** 从 `show_ds` 中 **筛选** 后再列出，**不得**把 `show_ds` 返回的无关表一并写入 B′。
- **禁止**：`execute_code_sync`（代码二次计算）、`json2plot`（出图）；即使用户要图或要「再算一遍」，也须说明 **问数链路不提供**，可请用户改问「直接可用 SQL 表达的查询」或在对话外处理。
- **禁止**：基于查询结果撰写「分析结论」「谁好谁坏」「趋势如何」「建议」等——除非同一句话仅复述结果中的数字与分组（不作解读）。用户意图以「分析」为主且无法落成单条查询时，应终止问数并说明超出本 skill 范围。

## 必读 references（按步骤）

| 步骤 | 说明 | Reference |
|------|------|-----------|
| 1 | **运行时可调用上下文**：确认 `base_url`、`user_id`、`token`、`inner_llm.name`（大模型名称）；与 KWeaver / 环境变量 / 临时脚本参数的衔接 | [references/text2sql.md](references/text2sql.md)（`kweaver auth whoami`、网关与用户 ID、`token`、`inner_llm.name`）、[kweaver-core/SKILL.md](../kweaver-core/SKILL.md) |
| 2 | 知识网络选择（条件执行 `kn_select`） | [references/kn-select.md](references/kn-select.md) |
| 3 | `text2sql` → `show_ds`（候选表/结构） | [references/text2sql.md](references/text2sql.md)（临时 Python 须与样例同构、单文件无外部依赖，见文内「临时 text2sql Python 脚本规范」） |
| 4 | `text2sql` → `gen_exec`（SQL + 数据） | 同上；**每次 `gen_exec` 必须参考** [references/text2sql-background-knowledge.md](references/text2sql-background-knowledge.md)：在 `show_ds` 摘要之后按该文「索引：意图 → 章节」做核对，命中则合并对应 `##` 节进 `config.background`，未命中则仅核对索引、**禁止**整文件预读（细则见该文文首 MUST 与 [references/text2sql.md](references/text2sql.md)「gen_exec 背景知识」） |
| — | ~~`execute_code_sync`~~ **本 skill 不使用** | （参考文档保留仅作能力说明，编排不得调用） |
| — | ~~`json2plot`~~ **本 skill 不使用** | 同上 |
| 6 | 交付：原样 SQL + 原样结果 + **最小口径**（KN/表/时间/过滤）；经描述筛入的相关表 **≥2** 时另列 **B′ 候选表**；**无**图表说明、**无**业务分析结论 | 下文 **「Step 6 最终交付版式（用户可见）」**、**「交付用候选表（B′）」**；兼阅「阶段门禁」「注意事项」「最终回复前自检」 |
| 7 | 清理临时脚本与临时数据（成功后） | 同文档章节「临时脚本与临时数据清理（Step 7）」 |
| — | 端到端顺序示例 | [references/tool-examples.md](references/tool-examples.md) |

## 关键调用方式（重点）

- **KWeaver 与连接凭据**：编排 HTTP / 临时脚本前，**`token`、`base_url`、`user_id`** 等可由 **KWeaver CLI**（[kweaver-core/SKILL.md](../kweaver-core/SKILL.md)）取得或与平台上下文对齐。**`base_url`（网关根地址）与 `user_id`（`data_source.user_id`）** 还可通过命令 **`kweaver auth whoami`** 从当前登录上下文读取（须先 **`kweaver auth login`**），再写入 **`TEXT2SQL_BASE_URL`** / **`TEXT2SQL_USER_ID`** 或传入样例 **`--base-url` / `--user-id`**。**`token`** 另可通过 **`kweaver token`**、`KWEAVER_TOKEN` 等获取；**`base_url`** 亦可来自 **`KWEAVER_BASE_URL`**、凭据中的平台根地址或 **`kweaver config show`** 中的 Platform。填入方式与优先级仍以 [references/text2sql.md](references/text2sql.md)「`kweaver auth whoami`」「网关根地址与用户 ID」及样例脚本为准；**最终回复禁止向用户暴露 token**（见下文注意事项 / Step 6）。
- **临时脚本**：即 **复制自** `*_request_example*` **样例后的** `_tmp_*` 副本；详见上文「临时脚本来源（说明）」与 [references/text2sql.md](references/text2sql.md)「请求方式」。
- `text2sql show_ds`：用于发现候选表与关键字段（问数 **Step 3**）。
- `text2sql gen_exec`：用于生成并执行 SQL，返回 SQL 与结果数据（问数 **Step 5**）。
- 这两个调用方式的请求结构、必填参数、Header/Body、临时脚本规范与异常口径，**详情统一以** [references/text2sql.md](references/text2sql.md) **为准**。


## 主流程（必须按序；可选步骤注明）

### Step 1：运行时可调用上下文确认（`runtime_ready`，必须有）

在进入 `kn_select` / `text2sql` **之前**，须逐项 **确认可用**（解析来源可多种，但结论必须明确写入本轮执行环境或脚本参数）：

| 项 | 含义 | 优先顺序（编排侧） |
|----|------|-------------------|
| `base_url` | 网关根地址（与 `url_path` 拼接前） | `kweaver auth whoami` / `KWEAVER_BASE_URL` / [text2sql.md](references/text2sql.md) 命令行与 `TEXT2SQL_BASE_URL` 等 |
| `user_id` | `data_source.user_id` | `kweaver auth whoami` / `TEXT2SQL_USER_ID` / `--user-id` 等（见 text2sql.md） |
| `token` | `auth.token` 与 `Authorization` | `kweaver token` / `KWEAVER_TOKEN` / `TEXT2SQL_TOKEN` 等（见 text2sql.md）；**不得**在对外交付中暴露完整 token |
| `inner_llm.name` | 请求体中大模型名称 | **① OpenClaw / 宿主 Agent「记忆区」** 中已保存的本轮或历史 **`inner_llm.name` / 等价键**；**② 若记忆区无可靠记录**，须 **由用户在本轮明确传入或确认**（例如用户指定模型名）；**③ 禁止**在尚未完成 ① 或 ② 时，仅依赖样例脚本内的 `DEFAULT_INNER_LLM["name"]` 静默继续后续步骤 |

四项 **任一项无法确认** → 按门禁终止，提示补足方式（含记忆区写入或用户口头/参数确认），**不得**跳步进入 Step 2。

### 编排步骤元数据（实现侧 / 回显侧共用）

| id | 键 | 何时出现在进度里 | 说明 |
|----|-----|------------------|------|
| 1 | `runtime_ready` | 总是 | 已确认 `base_url`、`user_id`、`token`、`inner_llm.name`（见上节） |
| 2 | `kn_resolve` | **自适应**：未直用 KN 时独占一行；已直用则压缩（见下） | 多候选时 `kn_select`；否则注明 `kn_id` 来源（直传/唯一候选） |
| 3 | `show_ds` | 总是 | `text2sql show_ds` → background 表字段摘要 |
| 4 | `bg_knowledge` | 总是（可与 Step 5 合并为一行 **紧凑模式**） | 索引核对 + 按需合并 `##` 节；见 background-knowledge reference |
| 5 | `gen_exec` | 总是 | `text2sql gen_exec` → SQL + 数据；**单轮累计 ≤3 次**（含「成功但无行」时的重试，见 **「`gen_exec` 空结果重试」**） |
| — | `disabled_tools` | **不出现在勾选列表**；仅在 **完整模式** 末尾用一行脚注 | 禁止 `execute_code_sync` / `json2plot` |
| 6 | `deliver` | 总是（成功路径） | 原样 SQL + 结果 + 最小口径；筛后相关表 ≥2 时含 **B′ 候选表** |
| 7 | `cleanup` | 成功且执行 Step 7 时；异常则不展示为待办 | 删除本轮 `_tmp_*` 脚本与临时数据 |

### 编排进度输出格式（自适应）

**目标**：同一套步骤顺序不变，**展示长度与条目随本轮路径自动收缩**，避免在多轮对话或窄上下文中刷屏；**不得**用自适应展示掩盖跳步或未通过的 Gate。

状态图例（建议固定展示）：

- `[✓]` 已完成
- `[ ]` 待执行
- `[✗]` 失败并终止
- `[−]` 跳过（仅规则允许时）

推荐标题：`### 问数执行进度`（保持三技能标题风格一致）

**密度等级**（由 Agent 按上下文选一；默认 **标准**）：

| 密度 | 适用 | 规则 |
|------|------|------|
| `minimal` | 用户仅需结果、或已多轮展示过流程 | 单行：`问数进度：1→2→3→4→5→6→7`（完成用 `✓`，终止用 `✗@StepX`；跳过 `kn_select` 时在 **Step 2** 处写 `2(直用)`） |
| `standard` | 默认 | 每步一行：**状态前缀** + **id** + **一句摘要**；Step 4 单独一行或与 5 合并为 `4–5. 背景已核对 → gen_exec（紧凑）` |
| `full` | 首轮/排障/用户明确要求「展开步骤」 | 沿用下列「完整 checklist」块，含回显要点括号说明；**禁用工具**不占 `- [ ]` 行，仅在块末脚注 |

`standard` 推荐示例（可直接套用）：

```text
### 问数执行进度
- [✓] 1 runtime_ready：base_url / user_id / token / inner_llm.name 已确认
- [✓] 2 kn_resolve：直用 kn_id=<id>（未触发 kn_select）
- [✓] 3 show_ds：候选表与关键字段已就绪
- [✓] 4 bg_knowledge：索引已核对（命中/未命中已记录）
- [ ] 5 gen_exec：待执行
- [ ] 6 deliver：待输出 SQL + 结果 + 最小口径
- [ ] 7 cleanup：待清理临时脚本与临时数据
```

**自适应压缩规则（MUST）**：

1. **Step 1**：`runtime_ready` **不得省略**；`minimal` 至少体现 `1✓` 或单行中的 `1`。**不得**在未完成四项确认时压缩掉 Step 1。
2. **Step 2**：若未调用 `kn_select`，**不得**占两行说明文档字符串；应写为 `[✓] 2 kn_resolve：直用 kn_id=<id>（未触发 kn_select）` 或并入 `minimal` 的 `2(直用)`。
3. **Step 4 + 5**：在 `standard` 下允许合并为一行：`[✓] 4–5 show_ds 摘要已就绪；索引已核对（命中 §x / 未命中）；gen_exec 已完成`——**仅当**不损失 Gate 信息（已核对、是否命中）时。
4. **execute_code_sync / json2plot**：**禁止**以可勾选子项形式展开；用户侧如需说明，在 Step 6 用不超过一行交代「问数仅返数、不出图、不二次计算」。
5. **异常终止**：仅列出**已达成的步骤**（`[✓]`）+ **失败步骤**（`[✗]`）+ 引用「异常终止回执模板」；**不得**为未开始的步骤输出 `[ ]` 占位刷屏。
6. **Step 7**：成功路径可在 `minimal` 中写作 `7✓`；失败或用户保留脚本时写作 `7跳过` 或省略（与 Step 7 章节一致，不向用户罗列删文件清单）。

**行格式（standard / full 共用）**：

```text
[状态] <id>. <简称>: <本轮事实一句>（可选：回显/异常提要）
```

- `状态`：`[ ]` 未执行 | `[✓]` 成功 | `[✗]` 失败 | `[−]` 跳过（仅 Step 2 未触发 kn_select 类）
- `id`：`1` | `2` | `3` | `4` | `5` | `6` | `7`（**禁止**为 `execute_code_sync` / `json2plot` 分配可勾选 `[ ]` 行）

### 阶段进度汇报（新增硬约束）

- **每个阶段结束后必须汇报**：Step 1~7 中任一已执行阶段完成后，必须立即输出该阶段进度行（见上文行格式），禁止把多个阶段累积到最后一次性补报。
- **失败也要汇报**：任一步失败时，先输出该阶段 `[✗]` 进度行，再给出「异常终止回执模板」；禁止仅报错不报进度。
- **重试也要汇报**：Step 5 的每次 `gen_exec` 重试都算阶段回合，必须逐次回显 SQL/结果并更新 Step 5 进度状态。
- **最小模式不豁免**：`minimal` 仅可压缩展示长度，不可省略“阶段结束即汇报”动作。
- **流程门禁**：编排的每个流程（Step 1~7 中**已执行**的阶段；Step 5 内受控的「`gen_exec` 空结果重试」仍属 Step 5 内回合）完成后必须先向用户展示该阶段结果/进度，再进入下一阶段；**除 Step 5 受控重试外**，任一阶段失败则终止，不得进入后续阶段。

**完整 checklist（full 密度复制用）**：

```text
问数进度：
- [ ] 1. **运行时可调用上下文**：确认 `base_url`、`user_id`、`token`、`inner_llm.name` 已就绪；`inner_llm.name` 优先 **记忆区**，无则须用户传入或确认（不得静默仅依赖脚本默认值）；详见上文「Step 1：运行时可调用上下文确认」
      （回显：四项已就绪的摘要；**不**向用户展示完整 token）
- [ ] 2. 解析 kn_id：若已指定或仅 1 个候选 KN 则直用；仅当候选 KN > 1 时调用 kn_select（见 kn-select reference）
      （回显结果：selected kn_id 及匹配依据/置信度；异常则终止）
- [ ] 3. text2sql show_ds：候选表与字段 → 整理为 gen_exec 的 background 的「表/字段摘要」部分（**宜**按表/字段描述筛后与用户问题相关，不必机械抄入 show_ds 全部表；细则见「交付用候选表（B′）」）
      （回显结果：`text2sql show_ds` 的候选表/关键字段摘要；异常则终止）
- [ ] 4. **背景知识核对（进入 gen_exec 前必做）**：打开 [references/text2sql-background-knowledge.md](references/text2sql-background-knowledge.md) 的索引表，按用户问题做意图匹配；**命中**则只读对应单一 `##` 节并拼入 `config.background`；**均未命中**则确认不拼接额外章节（不得跳过索引核对、不得整文件塞进 background）
- [ ] 5. text2sql gen_exec：`config.background` = Step 3 摘要 + Step 4 命中章节（若有）+ 既有口径模板（如「注册资金单位为万」）；生成 SQL、取数；保留 tool_result_cache_key（若有）；**若成功但无数据行**，按 **「`gen_exec` 空结果重试」** 最多再试 2 次（单轮合计 ≤3 次），用尽仍无行则终止并报告「未查询到相关数据」
      （回显结果：**每次** `text2sql gen_exec` 的 SQL + 结果数据摘要，含空数组；**技术异常**仍立即终止，不进行「空结果重试」）
（本 skill 禁用 execute_code_sync / json2plot。）
- [ ] 6. 交付：原样 SQL + 原样结果数据 + 最小口径（与 SQL 一致）+ 所用 KN/表依据；若经 **表/字段描述筛选** 后的相关表 **≥2**，须按版式列出 **B′ 候选表**（筛入项、接口标识逐字一致）；**不写**分析解读、对比结论、趋势或建议
- [ ] 7. 清理：在已向用户输出最终回复后，按「临时脚本与临时数据清理（Step 7）」删除本轮临时脚本（`.py`/`.sh`/`.ps1`）与临时数据（`_tmp_*.json`/`.ndjson`）；异常提前终止则跳过清理；用户明确要求保留时跳过对应清理
```

## 阶段门禁（Stage Gates，必须全部通过）

- **Gate 0（进入 Step 2 前）**：必须已完成 **Step 1**，即 **`base_url`、`user_id`、`token`、`inner_llm.name`** 均已确认可用并映射到环境变量或脚本参数（细则见「Step 1：运行时可调用上下文确认」）。**`inner_llm.name`**：**须**来自 **记忆区** 的有效记录，**或**用户在本轮 **显式传入/确认**；**禁止**在未满足前两者时仅凭样例 `DEFAULT_INNER_LLM["name"]` 进入 kn/text2sql。
- **Gate 1（进入 Step 3 `show_ds` 前）**：必须已获得有效 `kn_id`，且 `kn_id` 不在 `forbidden_ask_data_kn_ids` 列表中。
- **Gate 2（进入 Step 4 / Step 5 前）**：子工具 `text2sql show_ds` 必须返回可用候选表与关键字段摘要；候选为空视为失败。
- **Gate 3（进入 Step 5 `text2sql gen_exec` 前）**：必须已按 [references/text2sql-background-knowledge.md](references/text2sql-background-knowledge.md) 完成「索引：意图 → 章节」核对。凡与用户问题匹配的索引行，**必须**将对应章节的可执行要点并入本轮 `config.background`（与 `show_ds` 摘要同段拼接）；凡无匹配行，**不得**加载或拼接未命中章节，也**不得**整文件预读；**禁止**在未做索引核对的情况下直接发起 `gen_exec`。
- **Gate 4（本 skill 已收窄）**：`execute_code_sync` / `json2plot` 已禁用；`text2sql gen_exec`（Step 5）在**取得非空数据行**后直接进入 Step 6，**不**要求 `tool_result_cache_key`。
- **Gate 5（进入 Step 6 成功交付前）**：在遵守下文 **「`gen_exec` 空结果重试（Step 5，至多 3 次）」** 前提下，**最终一次** `text2sql gen_exec` 若返回非空数据，最终答复必须同时包含**该次**原样 SQL 与原样结果数据。
- **Gate 5a（空结果重试耗尽）**：若同一轮问数内已累计 **3 次** `text2sql gen_exec`，且**每次**均为「接口成功、`sql` 已返回，但结构化结果无数据行」，**不得**发起第 4 次 `gen_exec`，**不得**按 Step 6 成功版式交付；须按「异常终止回执模板」结束，结论文案为 **「未查询到相关数据」**；**宜**原样列出各次尝试的 `sql` 供复核，**禁止**编造行数据。
- **Gate 6（进入 Step 6 前）**：总结阶段用于抽取企业名称/实体名称的依据，必须只来自 `text2sql gen_exec` 的结构化结果字段（例如 `result.data` / `data` / rows 中的字段值）；不得从 **Step 5** 回显中的 `title` / `message` / `explanation` / 任意“展示字符串”里抽取、映射或猜测企业名称。若在结构化字段值中检测到明显“乱码特征”（如 `�`），则跳过该字段并改用同一条 rows 中其它“名称类”字段（如 key 含 `name` / `entname` / `企业` 且含 `名称`）。
- 任一 Gate 不通过（**含触发 Gate 5a**）：立即终止流程，使用「异常终止回执模板」返回，不得跳步或改走其他分支兜底。

### `gen_exec` 空结果重试（Step 5，至多 3 次）

**适用（“空结果”）**：单次 `text2sql gen_exec` **调用成功**（HTTP 与接口业务状态正常），`sql` 已返回，但结构化结果中 **无数据行**（如 `result.data` / `data` 为空数组，或 `return_records_num` / `real_records_num` 为 0，或平台等价口径）。

**不适用（不得按本节重试，仍立即异常终止）**：无 `sql`、响应缺少关键字段、HTTP 失败、超时、鉴权失败等——任何 **技术/协议层面异常** 均 **不** 消耗「空结果重试上限」，也 **不** 通过编造 `sql` 凑重试次数。

**流程（MUST）**：

1. **次数上限**：同一轮问数任务内，`text2sql gen_exec` **累计调用不得超过 3 次**（第 1 次 + 至多 **2** 次针对空结果的追加调用）。
2. **第 1 次无行后**：仅用**简短陈述**归纳可能原因，依据限于已返回的 `sql`、`explanation`（若有）及 Step 3 `show_ds` 可见的表/字段描述；据此调整下一轮 **`input`** 与/或在 **`config.background`** 末尾追加可执行提示（如条件过严、枚举写法、是否需 `LIKE` 等）。**禁止**虚构表中不存在的字段或未经接口证实的数据取值；**禁止**输出长篇业务分析。
3. **每次追加调用前**：仍须满足 **Gate 3**（对 [text2sql-background-knowledge.md](references/text2sql-background-knowledge.md) 做索引核对；可在 `background` 中写明「第 N 次重试的调整点」）。**不必**仅为重试重复 `show_ds`，除非候选表/字段已不足以支撑新 SQL。
4. **仍无行**：触发 **Gate 5a**，停止 `gen_exec`，向用户明确 **「未查询到相关数据」**。

**成功路径**：任一次 `gen_exec` 返回非空行即结束 Step 5 重试循环；Step 6 仅以 **最终成功那次** 的 `sql` 与结果集做成功交付（前序空结果若需留痕，**可**在进度或简短附注中说明尝试次数，**不**强制罗列全部历史 SQL）。

**与「异常终止回执模板」**：Gate 5a 情形下，「异常原因」须写清 **已进行 3 次 `gen_exec` 均无数据行**；「下一步」可提示用户收窄/放宽条件、核对枚举或换问数 KN（按需）。

## 每步回显与异常中止（硬约束）

本 skill 必须在每个已执行的步骤结束后，把该步骤的关键输出回显给用户；**Step 5** 内按 **「`gen_exec` 空结果重试」** 发起的**追加** `gen_exec` **不**算跳步——**每一次** `gen_exec`（含重试）结束后仍须原样回显该次 `sql` 与结果（含空数组）。**除上述受控重试外**，一旦任一步骤结果“异常”，必须立刻终止流程，不再执行后续步骤（包括可选步骤），并输出异常原因。

### 异常判定口径（通用）
- 工具调用失败（接口返回非成功状态、或关键字段缺失）视为异常。
- 缺失“下一步所需的关键字段/输入条件”视为异常（例如：Step 1 四项未齐、或 `kn_id` 缺失导致无法进入 `show_ds`）。**本 skill 不执行 json2plot**，不得以缺少 `tool_result_cache_key` 作为问数失败理由。
- 当用户 **仅**要求生成图表、且拒绝改为「可 SQL 查询的取数」时：在 Step 5 完成后于 Step 6 **终止式说明**「问数不包含出图」，**不**视为禁用工具链路的“技术异常”；不得伪造图表。

### 步骤回显模板（text2sql show_ds / text2sql gen_exec 必须原样返回）
1. **Step 1（runtime_ready）回显**：**确认摘要**——`base_url`（可给主机/路径前缀级，**避免**贴完整带 query 的调试 URL）、`user_id`（可截断或非敏感形式）、**`inner_llm.name` 最终采用值**、token **仅**用「已配置/已注入」等状态描述，**禁止**输出完整 token 字符串。
2. **Step 2（kn_select 完成后，若执行）回显**：输出 `selected kn_id` + 匹配依据/置信度（若接口返回）；并明确说明是否命中问数允许网络。
3. **Step 3（text2sql show_ds 完成后）回显**：对 `text2sql show_ds` 结果做原样回显（不得脱敏、不得改写、不得省略关键字段）；可附最小必要的结构化整理说明。
4. **Step 5（text2sql gen_exec 完成后）回显**：对**本轮**每一次 `text2sql gen_exec` 返回的 `sql` 与结果数据做原样回显（不得脱敏、不得改写、不得省略；**含空结果重试的各次**）；如存在 `tool_result_cache_key`，按接口原值回显。
5. **execute_code_sync / json2plot**：本 skill **不执行**，无回显。
6. **Step 6（交付）**：在 Step 5 已原样回显 SQL 与结果的前提下，按 **「Step 6 最终交付版式（用户可见）」** 汇总为面向用户的定版结构（进度可选、依据 +（筛后相关表 ≥2 时）**B′ 候选表** + SQL 围栏 + 结果表/围栏 + 口径）；**不得**单独输出大段业务分析或结论解读。
7. **Step 7（清理完成后）**：不向用户罗列已删文件清单；仅当删除脚本或临时数据失败（权限、占用路径等）时用一行说明原因即可。

### Step 7 阶段完成总览（新增硬约束）

Step 7 完成后，**必须**展示一次“各阶段任务完成情况总览”（即使 `minimal` 模式也不可省略）。推荐固定为以下模板并按本轮实际状态填充：

```text
### 阶段完成情况总览
- [<状态>] 1 runtime_ready: <一句话结果>
- [<状态>] 2 kn_resolve: <一句话结果>
- [<状态>] 3 show_ds: <一句话结果>
- [<状态>] 4 bg_knowledge: <一句话结果>
- [<状态>] 5 gen_exec: <一句话结果>
- [<状态>] 6 deliver: <一句话结果>
- [<状态>] 7 cleanup: <一句话结果>
```

其中 `<状态>` 仅允许 `[✓]` / `[✗]` / `[−]`；若流程提前终止，未执行阶段统一标记 `[−]` 并写“未执行（流程已终止）”。

### 异常终止回执模板（必须在终止时使用）
```text
### 流程终止（异常 | <Step X>）
异常原因：
- <一句话原因，必须对应具体步骤的缺失/空结果/错误状态>
下一步：
- <给用户可执行修复条件，例如：补充时间范围/口径、换用/确认问数 KN、重试触发条件等>
```

## 临时脚本与临时数据清理（Step 7）

本 skill 在调用子能力时，允许在“本机任务目录”创建 **临时脚本**（用于组织请求 JSON/发起 HTTP）及 **临时数据文件**（如 `text2sql` 的 `--out` 落盘、脚本默认的 `gen_exec` 结果 JSON 等）。**临时脚本与样例的关系**：临时脚本 **=** 子能力 **`*_request_example*` 样例的整文件复制** + 仅改文件名为 `_tmp_*`；**执行的是副本**，仓库中的样例原件 **永远不当作本轮任务入口**。**临时脚本的创建**：须从 [text2sql.md](references/text2sql.md)、[kn-select.md](references/kn-select.md)、[json2plot.md](references/json2plot.md)、[execute-code-sync.md](references/execute-code-sync.md) 所指向的样例路径 **复制** 后再执行；**禁止**从零新建空脚本再拼贴片段。**MUST NOT** 将临时脚本落在仓库 **`skills/`** 及其任意子目录下，若仓库内另有 **`.claude/skills/`** 等 skill 同步树亦同。**宜** 使用工作区根目录、系统临时目录等与上述路径隔离的位置。为减少磁盘残留，本 skill 约定如下门禁：

**执行顺序**：Step 7 在 **Step 6 总结已向用户完整输出之后** 执行；无需向用户罗列已删文件清单（删除脚本或临时数据失败时再简短说明）。清理失败 **不改变** 已成功交付的问数结论，仅需按需一行说明。

**临时脚本（与 [references/text2sql.md](references/text2sql.md) 命名约定一致）**

- MUST：当且仅当本轮流程成功完成到 Step 6 并输出最终回复后，删除 **本轮创建** 的临时脚本文件。
- MUST：仅删除满足以下规则的文件名模式：以 `_tmp_` 开头，后缀为 `.py` / `.sh` / `.ps1`（大小写不敏感也视为匹配）。
- MUST：绝对不删除仓库中的任何 `*_request_example*` 样例脚本，或用户非本轮创建的临时文件。

**临时数据**

- MUST：当且仅当本轮流程成功完成到 Step 6 并输出最终回复后，删除 **本轮创建** 的临时数据文件——即文件名以 `_tmp_` 开头、后缀为 `.json` / `.ndjson`（大小写不敏感）的落盘。典型来源：`text2sql_request_example.py` 的 `--out`、默认 `_tmp_t2s_gen_exec_result_<session_id>.json`、自建 `_tmp_show_ds_*.json` 等。
- MUST：不得删除不以 `_tmp_` 开头的文件；不得删除用户提供的业务数据、仓库内正式配置/用例，或无法确认为本轮创建的文件（存疑则保留）。

**异常与人工保留**

- MUST：若流程在任一步骤发生异常并提前终止，则 **不删除** 临时脚本与临时数据（保留用于排查）；在异常回执中可提示“临时文件已保留”。
- MUST：若用户明确要求「保留临时脚本 / 保留调试入口」，则 Step 7 跳过删除临时脚本；若用户明确要求「保留临时数据 / 导出调试数据」，则 Step 7 跳过删除临时数据。
- SHOULD：若用户明确要求仅保留/删除指定 `_tmp_*.json` / `_tmp_*.ndjson`，可按路径精确处理，避免误删非本轮文件。

### 知识网络约束（问数）

- **来源强约束**：问数使用的 `kn_id`（含直传 `kn_id`、候选 `kn_ids`、最终写入 `text2sql.data_source.kn` 的网络）必须来自 `SOUL.md` 已配置知识网络。
- **缺失处理**：若 `SOUL.md` 缺失或未配置可用知识网络，必须先提醒用户配置 `SOUL.md`，并暂停 `text2sql show_ds` / `text2sql gen_exec` 执行。
- **禁止元数据知识网络**：问数链路（`kn_select` 候选、`text2sql` 的 `data_source.kn`）**不得**使用元数据类 KN（用于目录/对象检索，非业务事实取数）。当前平台示例中元数据 KN 的 id 为 `idrm_metadata_kn_object_lbb`，与 [config.json](config.json) → `tools.kn_select.forbidden_ask_data_kn_ids` 对齐。
- **配置与调用**：默认 `tools.kn_select.kn_ids` **已排除**上述 id；若调用方自行传入候选 `kn_ids`，须先 **剔除** `forbidden_ask_data_kn_ids` 中的全部项再调用 `kn_select`。
- **结果校验**：若 `kn_select` 返回的 `kn_id` 仍落在禁止列表中，**不得**继续 `text2sql show_ds` / `text2sql gen_exec`，应改候选或引导用户指定业务 KN。

### 步骤约束（摘要）

0. **运行时可调用上下文（Step 1）**：**须先于** `kn_select` / `text2sql` 完成 **`base_url`、`user_id`、`token`、`inner_llm.name`** 确认；`inner_llm.name` 规则见「Step 1：运行时可调用上下文确认」与 **Gate 0**。
1. **KN 解析（条件路由，Step 2）**：
   - 已明确传入 `kn_id`：仅当该值在 `SOUL.md` 已配置网络中时可直接使用（且仍需校验不在 `forbidden_ask_data_kn_ids` 中）。
   - 未传 `kn_id` 但候选 `kn_ids` 仅 1 个：仅当该候选属于 `SOUL.md` 配置网络时可直接使用（且仍需校验）。
   - 候选 `kn_ids` > 1：仅在 `SOUL.md` 配置网络集合内调用 `kn_select` 选定后再继续。
   - **不得**在未知 KN 上直接 text2sql。
   - **异常中止**：若 `kn_select` 返回的 `kn_id` 缺失或落在 forbidden 列表中，则终止并输出异常原因。
2. **text2sql show_ds 先于 text2sql gen_exec（Step 3 → Step 5）**：先缩小表与字段空间，再把摘要写入 `background`，降低 SQL 幻觉；摘要 **宜** 与「交付用候选表（B′）」同一套筛入逻辑（相关表与关键列），**不必**纳入 show_ds 中明显无关的表。
   - **异常中止**：若 `text2sql show_ds` 未返回候选表/关键字段摘要（背景为空或候选为空），则终止并输出“text2sql show_ds 候选为空/不匹配”的异常原因。
3. **`gen_exec` 前背景知识（强制，Step 4）**：`config.background` 在发起 `text2sql gen_exec` 前，**必须**在 `show_ds` 摘要基础上，按 [references/text2sql-background-knowledge.md](references/text2sql-background-knowledge.md) 完成渐进式加载（先索引匹配，再按需仅合并命中的单个 `##` 节）。详见 [references/text2sql.md](references/text2sql.md)「第 3 步」与「gen_exec 背景知识」。
4. **text2sql gen_exec（Step 5）**：`input` 中文；`kn_id` 与 **Step 2** 一致，且 **非**元数据 KN；`inner_llm.name` 与 **Step 1** 确认值一致；`config.background` 须已含 `show_ds` 摘要及 Step 4 要求片段；结果用于 **直接展示**，**不得**再经代码加工或出图。
   - **异常中止（技术类）**：若 `text2sql gen_exec` 返回缺失 `sql`、响应结构异常或调用失败，立即终止并输出异常原因（**不**进入「空结果重试」）。
   - **空结果与重试**：若调用成功、`sql` 已返回，但结果集无行，按 **「`gen_exec` 空结果重试（Step 5，至多 3 次）」** 处理；**用尽 3 次仍无行**则终止并报告 **「未查询到相关数据」**（触发 **Gate 5a**），不得以单句“未查询到符合条件的数据”提前终止于第 1 次空结果。
5. ~~**execute_code_sync**~~：本 skill **禁止**调用。
6. ~~**json2plot**~~：本 skill **禁止**调用。
7. **结果展示硬约束**：若 `text2sql gen_exec` 返回非空数据（如有行记录/聚合结果），最终回复中**必须同时展示**：
   - 生成并执行的 SQL（原样展示，不可脱敏，不可省略）；
   - 结果数据（原样展示，不可仅给口头结论）。
   - **B′ 候选表（筛入后）**：若按 **表/字段描述** 与用户问题筛入的相关表 **≥2**，最终回复**必须**包含 **B′** 列表（逐项：`table_path` / `path` / 表名等 **与 `show_ds` 逐字一致**）；筛入 **恰 1** 张时可不单独建「候选表」标题。**不得**因 `show_ds` 原始条数 ≥2 就将无关表列入 B′。
8. **最小口径说明**：明确与 SQL 一致的时间范围、过滤条件、分组字段；不暴露 token 与完整调试 URL。**禁止**输出「分析」「结论」「建议」等超出查询结果外推的段落。涉及企业名称/实体名称的内容，只能从 `text2sql gen_exec` 的结构化结果字段提取，禁止从 **Step 5** 回显的文本字符串（即使“看起来像中文”）里抽取。

## 注意事项（必须遵守）

1. 所有信息**必须完全来自查询结果**，不允许添加任何结果中不存在的内容。
2. 不允许猜测、推断、脑补、编造数据。
3. 不允许改写、美化、夸张、虚构企业信息。
4. 不使用不确定词汇，如“可能”“大概”“应该”“据悉”。
5. 若**已用尽「空结果重试」上限（3 次 `gen_exec` 均无行）**，说明 **「未查询到相关数据」**（或等价表述），并作为异常终止原因（后续可选步骤跳过），不得自行编造数据行。若尚有余重试次数，**不得**用本句提前终止。
6. 只做结构化整理、排序、计数、分段展示（对**已有查询结果**），不做逻辑外扩；**不做**「分析任务」式的归纳、对比解读或预测。
7. 严格按原始数据呈现，不修改数字、名称、顺序。
8. 对 `text2sql show_ds` / `text2sql gen_exec` 的返回，必须原样返回；禁止生成、补造、篡改任何数据或字段。
9. 若 Step 5 的“显示层”出现乱码，允许在总结中忽略该回显文本的字符表现，但总结依据仍必须以结构化 `gen_exec` 结果中的字段值为准；禁止用乱码回显文本抽取企业名称/实体名称。

## Step 6 最终交付版式（用户可见）

**目的**：在 **不改动** `text2sql gen_exec` 返回的 SQL 字符串与结果集 **单元格原值**（数字精度、空值、字符串逐字）的前提下，用 **固定顺序、可扫读** 的 Markdown 组织最终回复。此处「版式」仅指标题层级与围栏类型；**不是**对业务数据做润色、归纳或「好看改写」（与上文注意事项第 2–3、7–8 条一致）。

### 交付用候选表（B′）：按表/字段描述筛选

**B′ 不是** 将 `text2sql show_ds` 返回的表/视图 **无差别全量** 展示给用户；必须在 **仅用本轮 `show_ds` 载荷中已有信息**（不得编造表）的前提下，按与用户问题的相关性 **筛入** 后再列 B′。

| 规则 | 说明 |
|------|------|
| **筛入依据** | 对照用户本轮中文问题，读取接口中的 **表级** `comment`、`name`（及 `data_summary` 等价字段）、**字段级** `ddl` 内各列 `comment`（或平台等价描述）。表名/路径本身无语义时，以 **注释与列说明** 为主。 |
| **必须纳入** | `gen_exec` 最终 **SQL 中出现的每一张业务表**（FROM / JOIN）均须纳入筛入集并在 B 或 B′ 中有体现；多表 JOIN 时 B′ 应 **至少包含这些表**（它们视为与问题相关）。 |
| **标识原样** | B′ 每条中的 `table_path`、`path`、`name`、`comment` 等 **与 `show_ds` 返回值逐字一致**，不得改写、缩略路径或合并多表为一句口语。 |
| **何时出现 B′** | **筛入后相关表 ≥2**：**须**设区块 B′，**仅列筛入项**。**筛入后恰 1**：**省略** B′，仅在 **B** 写明该主表（**不再**因 `show_ds` 原始返回条数 ≥2 而强制 B′）。 |
| **与 Step 3 回显的关系** | Step 3 对 **`show_ds` HTTP 响应** 仍 **原样回显**（见「步骤回显模板」）；B′ 仅作用于 **Step 6 面向用户的定版**，二者职责分离。 |
| **与 background 的关系** | 写入 `gen_exec` 的 `config.background` 时，**宜**采用与 B′ 一致的筛入范围：以相关表及关键列摘要为主，**不必**把 show_ds 中明显无关的表逐张写入。 |

### 推荐结构（自上而下）

处理规则（**B′**）：按上表从 `show_ds` **筛入**后的相关表 **计数**；**≥2** 时须在区块 **B′** 列出全部筛入项（bullet 或表格均可）；**=1** 时省略 B′，仅在区块 **B** 写清该主表即可。

| 顺序 | 区块标题（`###`） | 内容要点 |
|------|-------------------|----------|
| A | （可选）问数进度 | 与上文「编排进度输出格式」同规则；用户仅需结果且已多轮展示过时可用 `minimal` 单行或省略 |
| B | 知识网络与数据依据 | 1–3 行：`kn_id`；**本次 SQL 实际使用**的主要表/视图名（来自 `gen_exec` / `show_ds`，不臆造）；若存在 `tool_result_cache_key` 可原样附在段末 |
| B′ | 候选表（筛入后多表时） | **必填**当且仅当 **筛入** 的相关表 **≥2**：逐条列出筛入表的标识（如 `table_path`、`path`、表名等，**与接口返回逐字一致**）；**不得**列入已判定为无关的 show_ds 表 |
| C | 生成 SQL | 使用 `sql` 代码围栏，**围栏内全文**与接口返回的 `sql` 字段 **逐字符一致**（不缩进改写、不省略） |
| D | 查询结果 | 见下方「结果展示」 |
| E | 查询口径 | 与 SQL 一致的短列表（时间、主体/维度、过滤、分组/排序）；**不写**分析、对比结论、趋势或建议 |

### 美观直观模板（Step 6 可直接套用）

在不改变数据内容的前提下，建议使用下面的固定版式，提升扫读速度：

```markdown
### 查询结论
`<一句话结果状态：已查到 N 行 / 未查到相关数据>`

### 核心信息卡
| 项 | 值 |
|---|---|
| 知识网络 | `<kn_id>` |
| 主要数据表 | `<table_path 或 path，逐字一致>` |
| 返回行数 | `<real_records_num>` |
| 结果缓存键 | `<result_cache_key；无则写无>` |

### 候选表（仅筛入后 >=2 时出现）
- `<table_path/path 逐字一致>`
- `<table_path/path 逐字一致>`

### 生成 SQL（原样）
```sql
<sql 原文，逐字符一致>
```

### 查询结果（原样）
| <列1> | <列2> |
|---|---|
| <值1> | <值2> |

### 查询口径
- 时间范围：`<与 SQL 一致>`
- 主体/维度：`<与 SQL 一致>`
- 过滤条件：`<与 SQL 一致>`
- 分组/排序：`<与 SQL 一致，若无写无>`
```

版式约束：

- 「查询结论」只写事实，不做业务分析（例如不写“增长明显”“表现较好”）。
- 「核心信息卡」字段顺序固定，避免每次样式漂移。
- 「生成 SQL」「查询结果」标题建议保留，便于用户快速定位。
- 结果为 0 行时仍保留 SQL 与结果区块，并在结果区块明确 `[]` 或“空表（0 行）”。

### 结果展示（区块 D）

1. **表格优先**：列名为结果集中的字段名（中英文保持接口原样）；每行每列 **原样填入**，不得用「约」「合计口径已调整」等覆盖数值。
2. **行数很多**：可先表头 + 前若干行，并 **基于真实总行数** 注明「共 N 行，以下展示前 M 行」；**禁止**捏造 N、M 或合并行掩盖原始粒度。
3. **非行式/嵌套结构**：用 `json` 围栏展示接口侧结构化片段时，**字符串值仍须与接口一致**；若只能给原始字符串，可用 `text` 围栏整段原样粘贴。
4. **禁止**仅用加粗一句话或摘要 **替代** 完整结果表/围栏；禁止用装饰性符号包裹后改动单元格内容。

### 自检（版式相关，与「最终回复前自检」一并满足）

- 区块 C、D 是否满足「SQL 与数据均曾以代码块/表格形式完整出现」？
- 若 **筛入** 的相关表 **≥2**，是否已包含区块 **B′** 且仅含筛入项、标识与接口 **逐字一致**？
- 表格或 JSON 中的值是否与 `gen_exec` 结构化结果 **逐字段一致**（未做数值/文案美化）？

## 最终回复前自检（必须全部为“是”）

- 是否严格按 `1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7` 顺序执行（**未**调用本 skill 禁用的 execute_code_sync / json2plot）？（Step 7 仅在 Step 6 对外输出完成之后执行）
- 是否每个已执行步骤都完成了关键回显？（Step 7 无面向用户的业务回显要求）
- 是否在任一步骤异常时立刻终止且未跳步？
- Step 1 是否已确认 **`base_url`、`user_id`、`token`、`inner_llm.name`**（且 `inner_llm.name` 来自记忆区或用户确认，非静默默认）？
- 若 `text2sql gen_exec` 有结果，是否原样展示 SQL 与结果数据，且版式符合 **「Step 6 最终交付版式（用户可见）」**（含：**筛入** 相关表 **≥2** 时 **B′ 候选表**）？若曾空结果重试，是否在 **未超过 3 次** 前未误报「未查询到相关数据」？若已耗尽 3 次，是否已触发 **Gate 5a** 并报告「未查询到相关数据」？
- 发起 `gen_exec` 前是否已按 [references/text2sql-background-knowledge.md](references/text2sql-background-knowledge.md) 做索引核对并正确拼入（或确认未命中）背景章节？
- 是否 **未**调用 `execute_code_sync` / `json2plot`？
- 是否全程仅使用 `SOUL.md` 允许且非 forbidden 的问数 KN？
- 若本轮成功结束且用户未要求保留调试文件，是否已按 Step 7 删除本轮 `_tmp_*` 临时脚本（`.py`/`.sh`/`.ps1`）与 `_tmp_*` 临时数据（`.json`/`.ndjson`）？

## 与 smart-data-analysis 的关系

由 [smart-data-analysis](../smart-data-analysis/SKILL.md) 做顶层路由时，进入本 skill 表示用户 **主意图为问数**；若上下文已含 `kn_id_ask_data`，优先直接使用；仅当存在多个候选 KN 且未明确时再用 kn_select 对齐（最终以业务规则确认为准）。

## 配置

- 本 skill **统一默认配置**：[config.json](config.json)
  - 运行时的 **`token` / `base_url` / `user_id`** 可与 **KWeaver**（[kweaver-core](../kweaver-core/SKILL.md)）输出及环境变量对齐；其中 **`base_url`、`user_id` 可用 `kweaver auth whoami` 取得**（见 [references/text2sql.md](references/text2sql.md) 专节）。`config.json` 中的占位与下述键主要用于文档与部署默认值，**执行临时脚本时以样例解析链与环境为准**（同上 reference）。
  - **`defaults`**：全链路共享的 **`user_id`**、HTTP Header **`x_business_domain`**（与 department_duty_query / 各子 skill 对齐；生产环境可改为平台真实业务域）。
  - **`base_url`**：平台网关域名（与各工具的 `url_path` 拼接得到完整请求地址）。
  - **`tools`**：按工具聚合的默认 **`url_path`**（相对路径）、**`user_id`**，以及 **`kn_select.kn_ids`**、**`kn_select.forbidden_ask_data_kn_ids`**（问数禁止使用的元数据等 KN）、**`text2sql.kn_id`**（问数默认 KN；当已指定或仅一个候选 KN 时可直接使用，若多候选经 `kn_select` 选定后应覆盖传入）、**`execute_code_sync` / `json2plot` 的 `kn_id`**（可为空字符串）。
  - **`pipeline`**：每步通过 **`defaults_key`** 指向 `tools` 中对应键，便于实现侧一次读取本文件完成装配；子目录 `skills/<tool>/config.json` 仍可单独覆盖或与 `tools` 保持同步（部署时建议二选一为主，避免漂移）。

## 调用示例

```text
/smart-ask-data 上个月各区域销售额及各区域销售额占合计的比例（请用一条 SQL 查出结果表）
/smart-ask-data 在候选知识网络里自动选 KN，查某 SKU 在过去 7 天的出入库明细（仅返数）
```
