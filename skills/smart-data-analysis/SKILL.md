---
name: smart-data-analysis
version: "1.0.0"
user-invocable: true
description: >-
  数据分析员工（Data Analyst Agent）的唯一总入口：凡与数据资产、取数、指标、表/视图、
  治理职责、知识网络等相关的问题，必须先经本 skill 做编排与路由，再进入找表或问数等子流程。
  其中「问数」在本仓库中**仅**指 text2sql 查询返数；**解读性分析、出图、代码二次计算不通过问数交付**（见 SOUL.md 与 smart-ask-data）。
  负责 kn 分域、上下文注入（token、base_url、user_id、date）及与 smart-search-tables、smart-ask-data、kweaver-core 的交接。
  当用户提出任何数据类自然语言任务、或需在多条业务 KN 间切换时使用；知识网络来源强制以 SOUL.md 配置为准。
  首轮必须完成环境检测（KWeaver CLI 可用、auth 状态有效），全部通过后才进入编排与子 skill。
metadata:
  openclaw:
    skillKey: smart-data-analysis
allowed-tools: Bash(kweaver *), Bash(npx kweaver *)
argument-hint: [自然语言指令或带 kn 上下文的任务描述]
---

# Smart Data Analysis（总编排）

本 skill 是 **数据分析员工角色的总入口**：在 OpenClaw / KWeaver 数据技能栈中，**所有数据相关问题必须先经过本 skill**，完成 **KN 与上下文对齐、意图路由** 后，再委派至 **找表** 或 **问数**（或其它数据子 skill），**禁止**在未做编排判断时直接跳到 `smart-search-tables`、`smart-ask-data` 或零散工具调用（紧急纯 CLI 运维除外且须在推理中注明例外理由）。

**OpenClaw**：`metadata.openclaw.skillKey` 为 `smart-data-analysis`。与其它 skill 并存时，**数据类意图优先匹配并应用本 skill**；子 skill 作为 **执行层**，承接本编排给出的分支与约束。

## 总入口原则（必须遵守）

1. **先编排，后执行**：识别用户问题是否属于「数据域」（资产/表/视图/指标/SQL/图表/职责/元数据/多 KN 等）；若是，**先走本节下方「编排总流程」与「路由识别」**，再打开对应子 skill 或工具链。
2. **单一前门**：同一轮对话中新增的数据子任务，仍应 **回到本 skill 的编排逻辑** 决定是延续当前分支还是切换找表/问数。
3. **按最终意图路由**：先判断用户最终想要的是“定位数据资产（表/视图）”还是“**用 SQL 拿到查询结果（明细/汇总均可，但必须能落成 gen_exec）**”。前者走找表；后者走问数，必要时在问数流程内用 `show_ds` 收敛表字段。若用户**主诉求**为业务解读、图表、归因建议等且不能收敛为单次（或明确多条）查询 → **不得**指望 `smart-ask-data` 交付，应在编排层说明「问数仅返数」，由对话其它方式处理或请用户收窄为可查询问题。
4. **交接清晰**：转入 [smart-search-tables](../smart-search-tables/SKILL.md) 或 [smart-ask-data](../smart-ask-data/SKILL.md) 时，在内部上下文中保留已解析的 **`kn_id_*`、时间口径**，避免子 skill 重复猜 KN。
5. **非数据问题**：与数据无关时 **不必** 强行套用本 skill；若用户一句话里混有数据与非数据，**数据部分**仍按上述原则经本 skill 编排（可分段回答）。
6. **禁止交叉兜底**：本轮路由为 **问数** 时，若问数走不通，**禁止**改走 **找表** 分支代替交付；路由为 **找表** 时，若找表走不通，**禁止**改走 **问数** 分支代替交付。两种情况下均应 **直接输出走不通的原因**（缺 KN、token、无命中、平台错误等）及用户侧可采取的修复条件。细则见下方「分支走不通时的处理（禁止交叉兜底）」。
7. **数据分析类但超出找表/问数（须告知并终止）**：若问题属于 **广义数据分析 / 数据域**（例如解读性分析、图表可视化、预测与建模、归因与归因建议、分析报告撰写、依赖 `execute_code_sync` / `json2plot` 的加工与出图、无法收敛为可执行 SQL 的多轮探索等），但 **最终无法** 落成 **找表** 交付（元数据检索下的资产/职责定位，见 `smart-search-tables`）也 **无法** 落成 **问数** 交付（`show_ds` → `gen_exec` 可表达的明细或汇总，见 `smart-ask-data`）→ **必须在本 skill 终止流程**：向用户 **明确说明** 当前数据分析员工在本仓库中 **仅** 通过 **找表/找数** 与 **问数** 两类子流程交付；该需求 **不在上述能力范围内**；**不得** 继续调用 `smart-search-tables` 或 `smart-ask-data` 「凑答案」；可提示用户将问题 **收窄** 为「查哪张表/谁负责」或「一条（或多条）可用 SQL 表达的取数」。细则见下方「数据域内但不在找表/问数范围」。

## 入口门禁（防跑偏，必须先判定）

- **Front Gate 0（环境检测，本 skill 第一步）**：凡经本 skill 处理的数据域请求，**必须先完成**下方「第一步：环境检测（必选门禁）」两项且**全部通过**，方可进入「编排总流程」步骤 1 及后续子 skill。**任一不通过**：向用户说明缺项与修复方式（安装 CLI、`kweaver auth login` 等），**停止**找表/问数及一切依赖 KWeaver 的执行。**说明**：此处使用 `kweaver auth status` 等为**总入口门禁**；与 [kweaver-core](../kweaver-core/SKILL.md) 中「日常平台操作不经 `auth status` 预检、直接执行业务命令」的约定不冲突——本步**不替代**后续具体业务命令，仅做环境就绪判定。
- **Front Gate A（是否数据任务）**：仅当请求属于数据域（资产/指标/SQL/图表/治理/KN）时进入本 skill；非数据任务直接走通用对话，不得强行套流程。
- **Front Gate B（是否已过总入口）**：若将进入 `smart-ask-data` 或 `smart-search-tables`，必须先在本 skill 完成 KN 与路由判定；除非用户显式 `/smart-ask-data` 或 `/smart-search-tables` 强制调用。
- **Front Gate C（路由唯一性）**：同一轮仅保留一个最终交付分支（找表或问数）；前置步骤可复用，但最终交付不允许双分支并行混答。
- **Front Gate D（失败处理）**：目标分支走不通时，仅输出失败原因和修复条件，不得切换到另一分支兜底生成“近似答案”。
- **Front Gate E（能力边界：数据域内但无找表/问数落点）**：已进入本 skill 且确认为数据域，但经「路由识别」后 **不能** 有效归入 **找表** 或 **问数** 任一终态交付（含用户拒绝将问题收窄为可交付形式）→ **停止** `smart-search-tables` / `smart-ask-data` 及等价执行，仅输出 **能力边界说明** 与 **可收窄建议**；**禁止** 用通用长文、虚构取数或无关检索冒充交付。

## SOUL.md 知识网络来源（强约束）

- 知识网络列表 **必须**来自仓库中的 `SOUL.md`（单一事实来源）。
- 若 `SOUL.md` 不存在、未配置知识网络、或无法解析出可用 KN，必须先提醒用户配置 `SOUL.md`，并暂停找表/问数执行。
- 交接给 `smart-ask-data` 与 `smart-search-tables` 的 `kn_id`，必须取自 `SOUL.md` 已配置的知识网络；禁止使用未在 `SOUL.md` 声明的 KN。
- **禁止**在本 skill 中通过 `kweaver` 获取知识网络列表或做 KN 选择。

## 第一步：环境检测（必选门禁）

**位置**：在「编排总流程」任一步、以及 `smart-search-tables` / `smart-ask-data` / 依赖 `kweaver` 的调用**之前**。**必须执行**；**未全部通过不得进入下一步**。

| 序号 | 检测项 | 做法（须实际执行） | 通过标准 |
|------|--------|-------------------|----------|
| 1 | **KWeaver CLI（kweaver-dip / kweaver-core 依赖）是否可用** | 在 shell 中执行 `kweaver --version`（或 `kweaver -V` / `kweaver version`）；若 `kweaver` 不存在，再试 `npx kweaver --version` | 命令成功且输出版本号；**失败**（未找到命令、非 0 退出）→ 提示安装全局包：`npm install -g @kweaver-ai/kweaver-sdk`（需 Node.js 22+），或说明可用 `npx kweaver` 作为临时入口 |
| 2 | **认证（auth）状态** | 执行 `kweaver auth status`；多平台时可加当前 `KWEAVER_BASE_URL` 对应 URL 或 `kweaver auth list` 中的 **alias**（见 [kweaver-core/references/auth.md](../kweaver-core/references/auth.md)） | 输出表明**当前平台已登录**且 token **有效或未过期可刷新**（含 refresh_token 场景）；若提示未登录、无凭证、已过期且无法刷新、或明确错误 → **不通过**，提示用户 `kweaver auth login <url>`（或 `kweaver auth use <alias>` 后再 `auth status` 确认） |
**执行记录（对内）**：环境检测完成后，在推理上下文中简要记录两项结果（通过/失败及原因），**勿**在通过前启动编排步骤 1 或子 skill。

## 与其它技能的分工

| 能力 | 本 skill（编排） | 专用 skill（执行细节） |
|------|------------------|------------------------|
| 路由、kn 切换、上下文注入 | ✅ 主责 | 配合 |
| 找表 / 定位 / 职责 / 澄清 | 定义路由与交接 | [smart-search-tables/SKILL.md](../smart-search-tables/SKILL.md) |
| 问数（仅 text2sql 查询返数） | 定义路由与交接 | [smart-ask-data/SKILL.md](../smart-ask-data/SKILL.md) |
| 平台 CLI、认证、BKN 全量手册 | 按需引用 | [kweaver-core/SKILL.md](../kweaver-core/SKILL.md) |

## 职能矩阵（谁做什么）

| 角色/技能 | 负责（Do） | 不负责（Don't） | 典型输出 |
|-----------|------------|-----------------|----------|
| `smart-data-analysis`（总编排） | 识别主意图；确定 `kn_id_search_tables` / `kn_id_ask_data`；组织 token/date 上下文；决定先找表还是先问数；对 **数据域内但超出找表/问数** 的请求 **告知并终止** | 不直接做对象检索细节；不直接做 SQL 生成与执行；不替代子 skill 结果；**不**在超范围场景下强行启动子 skill | 路由决策、执行顺序、交接约束；超范围时的边界说明 |
| `smart-search-tables`（找表执行） | 基于给定 KN 做对象实例检索；返回候选表/视图；补充职责归属与澄清问题 | 不直接给最终指标结果；不做复杂统计分析结论 | 候选表清单、优先级、归属说明 |
| `smart-ask-data`（问数执行） | **Step 1** 确认 `base_url`/`user_id`/`token`/`inner_llm.name` → 基于给定 KN 做 **text2sql**（show_ds → gen_exec）；附与 SQL 一致的最小口径 | 不承担跨流程总路由；**不做**业务分析结论、**不出图**、**不使用** execute_code_sync；实体不明确时不应盲算 | 原样 SQL、原样结果集、最小口径与 KN/表依据 |
| `kweaver-core`（平台能力） | 提供认证与平台操作参考；承载底层 CLI 能力说明 | 不替代业务编排判断；不直接定义问数口径；不作为 KN 列表来源 | **`token` / `base_url` / `user_id` 等平台连接信息**（见下文「上下文注入」与 kweaver-core）、平台操作依据 |

若仅有顶层编排而无子 skill 正文：**仍须按下方路由规则执行**；找表/问数细节分别以 [smart-search-tables](../smart-search-tables/SKILL.md)、[smart-ask-data](../smart-ask-data/SKILL.md) 为准；CLI 与 BKN 以 `kweaver-core` 的 `references/*.md` 为准（尤其 `bkn.md`）。

## 编排总流程（必须按序）

复制并勾选（建议优先用「标准卡片样式」对外回显）：

```text
编排进度：
- [ ] 0. 环境检测（见「第一步：环境检测」）：CLI 可用、auth 通过 — **须全部通过**，否则停止
- [ ] 1. 解析任务中的 KN / 业务域，并注入公共上下文（见「知识网络分域」「上下文注入」）
- [ ] 2. 意图路由：找表 / 问数 / **超范围终止**（见「路由识别」；数据域内若无法落成找表或问数则走「数据域内但不在找表/问数范围」）
- [ ] 3. 进入对应分支清单并完成，按固定结构输出：结论 + 依据（表/视图/KN）+ 下一步可选动作；歧义时先澄清；若已判定超范围则 **不进入** 步骤 3 的子 skill，且仅输出边界说明 + 收窄建议
```

### 进度展示样式（更直观）

状态图例（统一三态）：

- `[✓]` 已完成
- `[ ]` 待执行
- `[✗]` 已失败并终止

`minimal`（多轮对话、用户仅要结果）：

```text
总编排进度：0✓ -> 1✓ -> 2✓(问数分支) -> 3✓
```

`standard`（默认，推荐）：

```text
### 总编排进度
- [✓] 0 环境检测：CLI 可用，auth 已通过
- [✓] 1 上下文注入：kn_id_* / token / base_url / user_id / date 已确认
- [✓] 2 意图路由：命中「问数」分支
- [ ] 3 分支执行：待进入 smart-ask-data
```

展示约束：

- 每完成一步立即回显一次，禁止积压到结尾再批量补报。
- 第 2 步必须写清路由结果（找表 / 问数 / 超范围终止）与原因短句。
- 若第 0~2 任一步失败，直接输出 `[✗]` 并终止，禁止继续显示后续步骤为已完成。

## 分支衔接（主从关系）

`smart-data-analysis` 是**唯一主流程**；`smart-ask-data` 与 `smart-search-tables` 不是并行主流程，而是 **步骤 3 的后续分支流程**：

| 在本 skill 的位置 | 后续执行 skill | 关系定义 |
|---|---|---|
| 步骤 3（问数分支） | [smart-ask-data/SKILL.md](../smart-ask-data/SKILL.md) | `smart-ask-data` 的编排流程 = `smart-data-analysis` 选中「问数」后的后续执行链路 |
| 步骤 3（找表分支） | [smart-search-tables/SKILL.md](../smart-search-tables/SKILL.md) | `smart-search-tables` 的编排流程 = `smart-data-analysis` 选中「找表」后的后续执行链路 |
| 步骤 2（超范围终止） | 无 | 不进入任一子 skill，仅输出边界说明与收窄建议 |

**约束**：同一轮只保留一个最终交付分支；禁止把 `smart-ask-data` 与 `smart-search-tables` 当作两个并行主流程同时交付。

## 编排前自检（按步骤门禁，必须为“是”）

- **进入步骤 1 前**：环境检测两项是否已全部通过（见「第一步：环境检测」）？未通过则不得进入步骤 1 及后续步骤。
- **进入步骤 2 前**：是否确认本请求属于数据任务？若属于数据任务，是否已从 `SOUL.md` 获得并校验可用 KN，并完成 `kn_id_search_tables` / `kn_id_ask_data` 与时间口径记录？
- **进入步骤 2 前**：Step 1 注入的公共上下文与关键约束是否已写入记忆区，并可被后续步骤/子 skill 读取？
- **进入步骤 2 前**：若属于数据任务，是否已排除「仅广义数据分析、**无**找表/问数可交付落点」？若属于该类，是否已 **告知用户并终止**，且 **未**调用 `smart-search-tables` / `smart-ask-data`？
- **进入步骤 3 前**：是否已确定本轮最终交付分支（找表或问数）？
- **进入步骤 3 前**：是否明确失败时只报错不交叉兜底？
- **步骤 3 输出前**：若步骤 3 执行失败，是否仅输出失败原因与修复条件，而未切换另一分支兜底？

## 知识网络分域

用户或系统可能为 **不同能力** 指定不同知识网络，约定占位名如下（实际值必须来自 `SOUL.md` 配置，或用户明确指定且在 `SOUL.md` 中存在）：

| 占位 | 典型用途 |
|------|----------|
| `kn_id_search_tables` | 找表、数据视图定位、目录/语义归属 |
| `kn_id_ask_data` | 问数：业务数据 **SQL 查询**（自然语言→gen_exec），非广义「分析」 |

**切换规则**

- 用户明确说「用 XX 知识网络问数 / 找表」→ 仅当该 KN 已在 `SOUL.md` 配置中声明时，才更新对应 `kn_*` 并进入对应子流程执行。
- 仅给出一个 `kn_id` 而未区分能力 → **二者默认沿用同一 `kn_id`**，除非历史消息已拆分为不同值。
- 路由到子流程前，确认本轮内部上下文中的 `kn_id` 与用户选择一致。
- 若 `SOUL.md` 缺失或未配置 KN：必须先提醒用户在 `SOUL.md` 配置知识网络，未完成前不进入子流程执行。

## 上下文注入

在调用检索或问数工具前，尽量在推理上下文中 **显式整理**（不必向用户冗长展示）：

| 键 | 含义 |
|----|------|
| `token` | 访问令牌；**KWeaver CLI**（[kweaver-core/SKILL.md](../kweaver-core/SKILL.md)）可通过 `kweaver token`、环境变量 `KWEAVER_TOKEN` 或与 `~/.kweaver/` 凭据联动的自动刷新取得。仅当获取连续失败 **>3 次**（命令报错/无有效 token/仍返回 401）时，才提示用户 `kweaver auth login <url>` 或仅在对话中提供 token（仅 token，不要密码）；随后注入后续调用 |
| `base_url` | 平台网关根地址（与各工具 `url_path` 拼接）。**KWeaver** 侧可通过环境变量 `KWEAVER_BASE_URL`、登录写入的凭据中的平台 URL，或 `kweaver config show` 等输出的平台地址取得，供问数/HTTP 样例脚本与 [smart-ask-data](../smart-ask-data/SKILL.md) 的 `TEXT2SQL_BASE_URL` / `--base-url` 等对齐 |
| `user_id` | 平台用户标识（如 text2sql 请求体 `data_source.user_id` 常用 UUID）。**KWeaver** 与平台账号上下文可确定或导出该值；亦可经环境变量 `TEXT2SQL_USER_ID`、命令行 `--user-id` 等与 [smart-ask-data/references/text2sql.md](../smart-ask-data/references/text2sql.md)「网关根地址与用户 ID」的解析链衔接 |
| `date` | 用户问题中的时间范围、默认「当前日期」与对比周期（同比/环比） |
将上述与当前 `kn_id_*` 一并作为后续工具调用的隐含约束，减少跨 KN 误查。

### Step 1（注入公共上下文）强约束

1. **总入口优先**：`smart-data-analysis` 是总入口，数据需求必须第一个经过 `smart-data-analysis`，再进入后续分支。
2. **kweaver-core 仅 token 能力**：在本数字员工场景中，`kweaver-core` 仅用于 token 获取、刷新与注入后续调用所需认证；禁止将 `kweaver-core` 当作通用平台能力直接做问数、找表。
3. **结果真实性**：数据展示与获取必须基于工具返回结果输出，禁止捏造、编造、篡改。
4. **流程门禁**：编排的每个流程完成后必须展示阶段结果；若当前流程失败，不得进入下一个流程。

#### KWeaver 与 `token` / `base_url` / `user_id`（配合 kweaver-core）

- **默认**：三类信息优先通过 **KWeaver CLI** 与 [kweaver-core](../kweaver-core/SKILL.md) 文档中的认证优先级（`KWEAVER_TOKEN` + `KWEAVER_BASE_URL`、`kweaver auth login`、`kweaver token` 等）取得，再映射到子 skill 约定的环境变量或脚本参数。
- **token** 获取连续失败 **>3 次**：停止自动获取，转人工模式，要求用户 `kweaver auth login <url>` 或仅在对话中提供 token（仅 token，不要密码）。

## 路由识别

按优先级匹配用户**最终意图**（一句可多标签，取最终要交付给用户的结果）：

### 走「找表（找数）」分支（最终目标是定位资产）

触发词或场景示例：表在哪、哪个视图、字段在哪个模型、主题域/部门职责、资产目录、「有没有叫…的表」、**仅**定位不做指标计算。

**严格限定（找数场景）**

- **必须限定元数据知识网络**：凡进入找表（找数）分支，`kn_id_search_tables` 只能使用元数据知识网络。
- **无元数据 KN 先确认后执行**：若当前上下文不存在元数据知识网络，或 `kn_id_search_tables` 无法确认属于元数据网，必须先向用户确认「请提供或确认元数据知识网络 kn_id」，确认前不得进入 `smart-search-tables` 执行检索。
- **冲突先停再问**：若用户显式指定了非元数据用途的 KN 来找数，先提示冲突并二次确认；未确认前停止找数执行。

**分支清单**

```text
找表进度：
- [ ] 确认 `kn_id_search_tables` 为元数据知识网络；若无则先向用户确认
- [ ] 将任务交给 `smart-search-tables` 执行检索与职责查询（本 skill 不直接用 `kweaver` 做检索）
- [ ] 需要实例或归属时：按需 `query-object-instance`（限制 limit、写好 condition）
- [ ] 意图不清：结构化反问（业务主题？系统？表名片段？）
- [ ] 输出：候选表/视图列表 + 推荐优先级 + 若用户下一步要统计则引导进入问数
```

推荐回显（standard）：

```text
### 找表分支进度
- [✓] A1 KN 校验：`kn_id_search_tables` 已确认为元数据网
- [✓] A2 分支交接：已进入 smart-search-tables
- [ ] A3 结果输出：待返回候选表/视图与职责
```

### 走「问数」分支（最终目标是 **SQL 查询结果**）

触发词或场景：查**多少**、**列**、**明细**、**汇总**、可 SQL 表达的 **TopN/占比**（结果由 gen_exec 直接返回）、「把…查出来」等。**不**包括：纯解读「分析一下」、要 **图表**、要 **代码再算**、要 **结论建议**（这些不由 `smart-ask-data` 完成）。

**分支清单**

```text
问数进度：
- [ ] 进入 `smart-ask-data` 前：确认 **`base_url`、`user_id`、`token`、`inner_llm.name`**（大模型名优先记忆区、无则用户确认），见 [smart-ask-data/SKILL.md](../smart-ask-data/SKILL.md) Step 1
- [ ] 确认 `kn_id_ask_data`
- [ ] 若表未就绪：在问数流程内用 `show_ds`（或必要时 `smart-search-tables`）收敛表字段后再继续
- [ ] 明确与 SQL 可落地的指标口径、时间、维度与过滤条件
- [ ] 仅使用 text2sql（show_ds → gen_exec）；细则见 [smart-ask-data/SKILL.md](../smart-ask-data/SKILL.md)
- [ ] 输出：**原样 SQL + 原样结果** + 最小口径（KN/表）；**不承诺** 分析结论或图表
```

推荐回显（standard）：

```text
### 问数分支进度
- [✓] B1 运行时上下文：base_url / user_id / token / inner_llm.name 已确认
- [✓] B2 KN 校验：`kn_id_ask_data` 已确认可用
- [✓] B3 执行链路：show_ds -> gen_exec
- [ ] B4 结果输出：待返回 SQL + 数据 + 最小口径
```

### 歧义与复合请求（按最终意图收敛）

- **找表 + 问数** 同句出现：最终目标若是“**查数/出表**”，则归入**问数分支**，找表仅作前置。
- **仅**「分析一下」且无**可查询**落点：先澄清能否收窄为具体问题（要查哪些字段、什么条件）；**不得**用问数分支伪造「分析长文」。
- **跨 KN**：分别切换 `kn_id_search_tables` / `kn_id_ask_data` 完成各自步骤，禁止混用未声明的 KN。
- 示例：`查询企业相关信息` 若用户期望返回企业数据内容/统计结果，归入**问数**（必要时先找企业相关表/视图，再生成 SQL 查询）。

### 数据域内但不在找表/问数范围（须告知并终止）

**适用**：已满足 **Front Gate A**（问题属于数据域 / 广义数据分析），但经归纳后 **既不** 属于「找表（找数）」终态（见 `smart-search-tables`：资产/表/视图/职责定位），**也** 不属于「问数」终态（见 `smart-ask-data`：可经 `show_ds` → `gen_exec` 表达的取数）。

**典型情形（非穷举）**

- 只要解读、结论、建议、归因、异常诊断，**拒绝**或 **无法** 收窄为「查哪些字段、什么条件、是否要汇总」等可 SQL 问题。
- 明确要 **图表 / 看板 / 交互探索**，且不接受改为「先给一条可 SQL 查询」。
- 要求 **代码二次计算**、统计建模、预测、ETL 开发、数据质量全表扫描等，且与本仓库问数/找表能力无关。
- 多维对比、叙事性分析报告等，**无法** 分解为有限条、边界清晰的 `gen_exec` 查询。

**必须动作（MUST）**

1. **停止流程**：**不** 进入 `smart-search-tables`；**不** 进入 `smart-ask-data`；**不** 用 `kweaver`/零散调用 **伪造** 取数或检索结果。
2. **告知用户**：说明本数字员工路径下 **仅支持**「找表/找数」（资产与职责定位）与「问数」（text2sql 返数）；当前需求 **不在上述范围内**。
3. **可选收窄**：邀请用户改提 **可定位资产** 或 **可用 SQL 表达** 的具体问题（与仓库根目录 [SOUL.md](../../SOUL.md) 配置一致时再执行）。

**与「歧义先澄清」的区分**：可先 **一轮** 澄清能否收窄为找表或问数；若用户 **明确不收窄** 或澄清后仍无落点，则按本节 **终止**，不再重试子 skill。

### 分支走不通时的处理（禁止交叉兜底）

- **问数走不通**：例如 `SOUL.md` 未配置或未授权问数 KN、text2sql/show_ds/gen_exec 失败、无可用数据源、token 无效等 → **只向用户说明具体原因与补齐条件**，**不得**为给出「类似答案」而切换到 **找表**（元数据检索）分支；找表结果不能替代用户要的指标或明细取数。
- **找表走不通**：例如无元数据 KN、元数据检索无命中、职责查询不可用等 → **只向用户说明具体原因**，**不得**切换到 **问数** 分支用 text2sql 猜测表名、编造资产位置或虚构明细。
- **与「问数内前置找表」的区分**：在 **问数分支** 内，按 [smart-ask-data](../smart-ask-data/SKILL.md) 在生成 SQL 前做的 Schema/表发现（含按需调用 `smart-search-tables` 或等价步骤）属于 **同一问数任务的固定子步骤**，**不属于**「问数失败后的交叉兜底」。

## 输出格式建议

对用户回复推荐结构：

1. **结论**（一两句）
2. **依据**（用了哪个 KN、哪些表/视图或取数路径）
3. **数据或列表**（表格或要点）
4. **可选下一步**（例如：是否再提一条**可 SQL 表达**的查询；同比/环比需用户明确时间口径）

## 调用示例（slash / 指令）

```text
/smart-data-analysis 在当前找表用的 kn 里查有没有订单相关宽表
/smart-data-analysis 用问数 kn 查出上月与上上月销售额（两条可 SQL 落地的查询）
/smart-data-analysis 找表 kn 用 A，问数 kn 用 B：先找「库存」视图再查周转相关明细或汇总
```

## 注意事项

- **不要**在未确认 `kn_id` 的情况下假设当前知识网络已正确。
- **不要**默认对纯 SQL 视图源使用 `match` 全文操作符；文本模糊优先 `like`。
- 专用 skill 中的 `references/tool-examples.md` 若存在，**在执行层优先遵循**；本文件只负责 **路由与编排约束**。
