# 子能力：Text2SQL（候选表/表结构 + 生成 SQL 取数）

在 **问数主流程第 2～3 步** 调用：同一工具、不同 `action`。

## 第 2 步：候选表与表结构（`show_ds`）

- **目的**：在已解析的 `kn_id` 下，拉取可访问的数据源、候选表及字段信息，缩小生成 SQL 时的幻觉空间。
- **调用**：`action`: **`show_ds`**；`input` 建议用中文概括用户想查的业务与维度；**必须传入第 1 步得到的 `kn_id`**（`data_source.kn`）及配置中的 `user_id` 等。
- **产出**：用于下一步 `gen_exec` 的 **background**：表名、关键字段、过滤维度等摘要。**background 宜按表级/字段级描述（`comment`、`ddl` 列注释等）与用户问题筛入相关表**，不必把 `show_ds` 返回的全部表机械写入（与 [smart-ask-data/SKILL.md](../SKILL.md)「交付用候选表（B′）」同一套相关性原则，避免无关表干扰 SQL 生成）。
- **与最终回复的区别**：问数 **Step 6** 中面向用户的 **「候选表」（B′）** 同样 **不是** `show_ds` 全量枚举，而须按上述描述筛选后再列出；Step 3 对 `show_ds` **响应本身的回显** 仍可按编排要求 **原样**。

## 第 3 步：生成并执行 SQL（`gen_exec`）

- **目的**：基于用户问题 + `show_ds` 结论，生成 SQL 并执行，返回数据与（若平台返回）**结果缓存键** `tool_result_cache_key`，供 `json2plot` 使用。
- **调用**：`action`: **`gen_exec`**；`input` 为完整中文问句；**同上 `kn_id`**；`config.background` **必须**在发起请求前按下方「`gen_exec` 背景知识」组装：`show_ds` 结构化摘要 +（若索引命中）`text2sql-background-knowledge.md` 对应章节要点 + 既有业务口径模板（如「注册资金单位为万」）；不得仅用默认占位句代替真实 `show_ds` 结论。
- **会话说明**：`session_id` 用于状态/缓存对齐；是否复用前一步的 `session_id` 由调用方按平台约定决定。
- **产出**：表格数据/记录；若需画图，保留返回中的 **`tool_result_cache_key`**（名称以实际 API 为准）。

### `gen_exec` 背景知识：渐进式加载（单独文件，**每次 gen_exec 须参考**）

可复用的 SQL 模式（如前 X%、多表地址歧义、「个体工商户不是企业」主体口径等）**不内联在本文件**，统一维护在 **[text2sql-background-knowledge.md](text2sql-background-knowledge.md)**。**凡是 `gen_exec`，编排 MUST 以该文件为补充来源**，并完成索引核对，不得跳过。

**加载方式（MUST，与 smart-ask-data Gate 2b 对齐）**：

1. 先完成 **`show_ds`**，形成表/字段摘要写入 `background` 的首段（含业务口径，如「注册资金单位为万」）。
2. **再打开** `text2sql-background-knowledge.md`，阅读 **「索引：意图 → 章节」** 表并与用户问题匹配；**命中某一类时，仅打开对应的单个 `##` 章节**，将该节原则与模板文字并入同一段 `config.background`（追加在摘要之后，不替换摘要）。
3. **未命中**任何已登记意图时：**不得**整文件预读或拼接其它 `##` 节；确认「已核对索引、无适用章节」后，仅用 `show_ds` 摘要 + 口径模板发 `gen_exec`。

细则以 `text2sql-background-knowledge.md` 文首「渐进式加载规则」为准。

## 知识网络来源（强约束）

- **唯一事实来源**：问数链路中允许使用的 **业务知识网络**（写入 `data_source.kn`、以及 `kn_select` 的候选集合）**仅以仓库根目录 [`SOUL.md`](../../../SOUL.md) 为准**。
- **没有其他配置**：**不得**将 [config.json](../config.json) 里的 `tools.text2sql.kn_id`、`tools.kn_select.kn_ids`，或样例脚本中的 **`DEFAULT_KN_ID`** 等，当作「已授权的问数 KN」依据；它们至多只是本地联调占位。**执行 `show_ds` / `gen_exec` 前**，须确认 **`SOUL.md` 已声明问数用网络**（例如 `knowledge_networks.ask_data` 下的 `kn_ids` / `default_kn_id`，以该文件实际结构为准）。
- **缺失或不适合即中断**：若 **`SOUL.md` 未配置**可用的问数知识网络、或 **当前任务在已声明列表中找不到合适**的业务 KN（例如只有元数据 KN、或问数段落缺失）：**立即停止**本任务，**不要**调用 `show_ds` / `gen_exec`，**不要**改用未在 `SOUL.md` 声明的 KN 或编造结果；须明确提醒用户在 **`SOUL.md` 中补充或调整适合的知识网络**后再重试。

## 与本流程的衔接

- **`kn_id`**：写入 `data_source.kn`（数组，通常单元素）的 id **必须落在 `SOUL.md` 已为问数声明的知识网络范围内**（见上文「知识网络来源」）；具体值通常来自上游 `kn_select` 或编排解析的 `kn_id_ask_data`。**禁止**使用元数据知识网络（与 [config.json](../config.json) → `tools.kn_select.forbidden_ask_data_kn_ids` 一致，当前示例含 `idrm_metadata_kn_object_lbb`）：`show_ds` / `gen_exec` 的 `data_source.kn` **不得**包含上述任一等价 id。
- **`user_id` / `base_url` / 完整 URL**：HTTP 侧须正确填写 `data_source.user_id`，请求地址为 `base_url` + `tools.text2sql.url_path`。**`base_url` 与 `user_id` 可通过 KWeaver CLI 的 `kweaver auth whoami` 从当前登录上下文取得**（见下 **[「网关根地址与用户 ID 获取方式」](#text2sql-base-url-user-id)**），再写入环境变量或 `--base-url` / `--user-id` 与 [`text2sql_request_example.py`](../scripts/text2sql_request_example.py) 对齐。编排文档中的 [config.json](../config.json) → `defaults.user_id` / `base_url` 仅作参考，**运行示例脚本时不依赖其中的固定 UUID 或写死网关**。
- **`inner_llm.name`（大模型名称）**：解析顺序见 **[「inner_llm.name（大模型名称）」](#text2sql-inner-llm-name)**；与 [`text2sql_request_example.py`](../scripts/text2sql_request_example.py) 一致，**不得**与 `kn_id` 的 `SOUL.md` 约束混用。
- **凭证与 Header**：`Authorization` 与 `auth.token` 为同一 token；`x-business-domain` 与 [config.json](../config.json) → `defaults.x_business_domain` 对齐（如 `bd_public`）。

<a id="text2sql-base-url-user-id"></a>

## 网关根地址与用户 ID 获取方式（`text2sql_request_example.py`）

下列顺序适用于通过 **[`text2sql_request_example.py`](../scripts/text2sql_request_example.py)**（及其 **同构临时脚本** `_tmp_t2s_*.py`）发起 `show_ds` / `gen_exec` 时，**拼装请求 URL** 与 **`data_source.user_id`**。脚本**不在代码内写死默认 `base_url`**；须按下述优先级解析。

### `kweaver auth whoami`（获取 `base_url` 与 `user_id`）

在已 **`kweaver auth login`** 且本机可使用 KWeaver CLI（[kweaver-core/SKILL.md](../../kweaver-core/SKILL.md)）时，执行 **`kweaver auth whoami`** 可从当前认证上下文得到 **平台根地址**（用作本节的 **`base_url`**，即与 `url_path` 拼接前的网关根、不含具体 API 路径）与 **用户标识**（用作 **`data_source.user_id`**，一般为 UUID）。**推荐**：将命令输出中的对应值导出为 **`TEXT2SQL_BASE_URL`**、**`TEXT2SQL_USER_ID`**，或作为 **`--base-url` / `-b`**、**`--user-id` / `-u`** 传入样例脚本，从而命中下方两表的第 1～2 优先级，避免非 TTY 下因缺省而报错。

**约束**：[`text2sql_request_example.py`](../scripts/text2sql_request_example.py) **不会**在代码内调用 `whoami`；须由编排 Agent 或用户在运行脚本**之前**执行该命令并完成注入。字段键名与打印格式以 **当前安装** CLI 的 `kweaver auth whoami --help` 与实际输出为准。

### `base_url`（网关根地址，不含 `url_path`）

| 优先级 | 来源 | 说明 |
|--------|------|------|
| 1 | 命令行 **`--base-url` / `-b`** | 显式传入，末尾 `/` 会被去掉后再与 `url_path` 拼接。 |
| 2 | 环境变量 **`TEXT2SQL_BASE_URL`** | 同上，去首尾空白与末尾 `/`。 |
| 3 | **标准输入（交互）** | 若以上皆空且 stdin 为 TTY：先向 **stderr** 提示缺省，再 **`input` 让用户手动输入** `base_url`。 |
| — | **失败** | 若仍无值（例如 **非 TTY** 且未配置前两项），**报错退出**；非交互场景须预先设置 **`TEXT2SQL_BASE_URL`** 或传入 **`-b`**。 |

### `user_id`（`data_source.user_id`）

| 优先级 | 来源 | 说明 |
|--------|------|------|
| 1 | 命令行 **`--user-id` / `-u`** | 显式 UUID。 |
| 2 | 环境变量 **`TEXT2SQL_USER_ID`** | |
| 3 | **标准输入（交互）** | 若以上皆空且 stdin 为 TTY：`input` 提示输入 UUID。 |
| — | **失败** | **非 TTY** 且无前两项则 **报错退出**；非交互场景须预先设置 **`TEXT2SQL_USER_ID`** 或传入 **`-u`**。 |

### `token`（简述）

- **`--token` / `-t`** → 环境变量 **`TEXT2SQL_TOKEN`** → **`KN_SELECT_TOKEN`**；写入 `auth.token` 与 Header `Authorization`，并经 `_clean_token` 处理（避免非 ASCII 污染 HTTP 头）。细则见脚本文档字符串与 [windows-http-troubleshooting.md](windows-http-troubleshooting.md)。

<a id="text2sql-inner-llm-name"></a>

## `inner_llm.name`（大模型名称）

本节约定 **`body.inner_llm` 中 `name` 字段（大模型名称）** 的解析顺序；适用于 Agent 编排、[`text2sql_request_example.py`](../scripts/text2sql_request_example.py) 及与其 **同构** 的 `_tmp_t2s_*.py`。`inner_llm` 的 **`temperature`、`top_k` 等其余键** 默认同样例脚本内建 `DEFAULT_INNER_LLM` 一致；**请求体不再使用 `inner_llm.id`**。

### 读取优先级（`name`）

在 **拼出最终 HTTP 请求** 前，按序 **谁先命中用谁**（与 [`text2sql_request_example.py`](../scripts/text2sql_request_example.py) 对齐）：

1. 命令行 **`--inner-llm-name`**
2. 环境变量 **`TEXT2SQL_INNER_LLM_NAME`**
3. 脚本内 **`DEFAULT_INNER_LLM["name"]`**（如 `deepseek_v3`）

无需 OpenClaw 记忆区、`inner_llm.txt` 等持久化；CLI / 环境变量仅为本次调用覆盖。

### 临时脚本同构要求

**`_tmp_t2s_*.py`** 须为 [`text2sql_request_example.py`](../scripts/text2sql_request_example.py) 的 **整文件复制件**（仅文件名不同）；其 **`inner_llm.name` 的解析**（`_resolve_inner_llm_name_for_request`）与样例 **自动同构**。**禁止**另起空文件手写一套互斥逻辑。

## 完整参数与约束

[../config.json](../config.json) 中 `tools.text2sql`、`defaults` 等仅作 **网关地址、`inner_llm`、`user_id` 等调用面默认值**；**问数用 `kn_id` 不以 config 为权威来源**，须以 **[`SOUL.md`](../../../SOUL.md)** 为准（见「知识网络来源」）。

**请求体为直传 JSON**：须包含 **`config`**、**`data_source`**、**`inner_llm`**、**`input`**、**`action`**、**`timeout`**、**`auth`**，层级与下方样例一致；布尔值为 JSON **`false`**（非字符串）。**不再**传递顶层 **`query`**（如 `stream` / `mode`）对象。

**子技能调用约束**：

- **请求参数结构不可变动**：上述块均须存在，子字段与样例同构（`inner_llm` 等按样例传递）。
- **仅允许变动以下参数值**（及与业务相关的合理数值）：
  - `action`：`show_ds` 或 `gen_exec`
  - `input`（中文）
  - `config.background`（`gen_exec` 必填；`show_ds` 可为空字符串）
  - `config.session_id`（可选；如需复用缓存可保持两步一致）
  - `config.return_data_limit`、`config.return_record_limit`
  - `data_source.kn`、`data_source.user_id`（其中 **`data_source.kn` 不得为** `forbidden_ask_data_kn_ids` 中的元数据等 KN）
  - `timeout`
  - `auth.token`
  - `inner_llm` 各字段（若平台要求切换模型时）
- **HTTP 层 Header**：
  - `Content-Type: application/json`
  - `x-business-domain`：如 `bd_public`
  - `Authorization`：与 `auth.token` 为同一凭证

## 请求方式（复制样例脚本并重命名，再执行临时脚本）

**执行顺序（强约束）**：

1. **先** 将仓库内 **对应样例脚本整文件复制** 到本机任务目录，并把副本 **重命名** 为带 `_tmp_` 前缀的文件名（例如 `_tmp_t2s_show_<主题>_<YYYYMMDD_HHMMSS>.py`、`_tmp_t2s_exec_<主题>_<YYYYMMDD_HHMMSS>.py`，shell 则复制 `text2sql_request_example.sh` 同理）。**不要**覆盖、修改仓库中的 `text2sql_request_example*` 原文件；**禁止**在空白文件上从零手写临时脚本（避免与样例漂移）。
2. **仅执行副本**：按本文 **「样例 A / 样例 B」** 的 **请求体结构**，通过 **命令行参数与环境变量**（`-a`、`show_ds`/`gen_exec`、`-i`、`-g`、`TEXT2SQL_TOKEN` 等）传入本轮参数，由副本内逻辑 POST 至 `base_url` + `tools.text2sql.url_path`。副本源码 **应与样例逐行一致**，通常 **无需编辑副本**。
3. **再** 在终端 **只运行该重命名后的副本**（**禁止**把仓库内 `*_request_example*` 路径当作本轮任务入口）。

**禁止**：

- **禁止**在仓库 **`skills/`** 及其任意子目录下创建临时脚本；若仓库内另有 **`.claude/skills/`** 等 skill 同步树，**同样禁止** 在其下创建。**宜** 使用工作区根目录、系统临时目录（如 `/tmp`、`%TEMP%`）等与上述路径隔离的位置。
- **禁止**直接执行 `text2sql_request_example.py` / `text2sql_request_example.sh` / `text2sql_request_example.ps1` 等 **样例文件** 作为任务入口。
- **禁止**凭记忆删减字段或脱离样例手写零散 `curl`。

**必须**以本文 **样例 A、样例 B** 为 **唯一结构蓝本**。

### 编写临时脚本的要点

- **创建方式（必须）**：临时脚本 = **复制** [`text2sql_request_example.py`](../scripts/text2sql_request_example.py)（或 `.sh`）→ **重命名** 为 `_tmp_t2s_*`；不得用空文件 + 片段粘贴代替。
- **会话**：`session_id` 可由调用方生成并按需复用（用于状态/缓存对齐）或分别生成。
- **background**：将 `show_ds` 返回中的表/字段要点整理为纯文本，原样写入 `gen_exec` 的 `config.background`。
- **实现参考**：见下方「结构参考文件」；HTTP 与解析逻辑已在样例中，**落在副本内、通常不改代码**。

### 临时 text2sql Python 脚本规范（与样例同构，强约束）

**`_tmp_t2s_*.py`** 必须 **由复制** [`text2sql_request_example.py`](../scripts/text2sql_request_example.py) **得到**（仅改输出路径/文件名），并满足：

1. **与源样例一致**  
   - 同一套：`import`（标准库即可）、文件头编码声明、**`DEFAULT_*` 常量**（**不含写死 `base_url`**；`url_path`、`inner_llm` 默认值（含 **`name`**，无 **`id`**）、`x_business_domain` 等与样例内联一致）、**`_resolve_base_url` / `_resolve_user_id` / `_resolve_inner_llm_name_for_request`**（或与其逐段同构的解析逻辑）、**`_clean_token`**、**`_token_from_env`**、**`_build_payload`**、**`urllib` 请求与错误处理**、响应 **`json.dumps(..., indent=2)`** 输出。`base_url` / `user_id` 与 **`inner_llm.name`** 的优先级分别与 [「网关根地址与用户 ID」](#text2sql-base-url-user-id)、[「inner_llm.name（大模型名称）」](#text2sql-inner-llm-name) **一致**。  
   - **禁止**：`open(...config.json...)`、`import` 本仓库其它 `.py` 作为依赖、删减或改写请求体字段层级（须与样例 A/B 及 `_build_payload` 同构）。

2. **不依赖其它文件**  
   - 临时脚本须 **单文件自包含**；环境差异只允许在本文件内改 **常量** 或保留与样例相同的 **argparse**（`--base-url`、`--kn-id` 等），**不得**把默认逻辑改成「运行时加载外部 JSON」。

3. **按任务变动的量（为主）**  
   下列映射到 HTTP body / 调用时按实际情况填写，**其余与样例保持相同默认值与结构**：

   | 概念 | JSON / 行为 |
   |------|----------------|
   | `action` | `show_ds` 或 `gen_exec` |
   | `token` | `auth.token` 与 Header `Authorization`；优先环境变量 `TEXT2SQL_TOKEN` / `KN_SELECT_TOKEN` 或 `--token`，经 `_clean_token` 再发送 |
   | `input` | 中文 `input` |
   | `background` | `config.background`：`show_ds` 为 `""`；`gen_exec` 为 show_ds 摘要 |
   | `session_id` | `config.session_id`：可自行填写（两步不要求一致） |
   | `kn_id` | `data_source.kn[0]` |
   | `base_url` | 请求 URL 前缀；**不写死在常量**：`-b` → `TEXT2SQL_BASE_URL` → 交互输入；见 [「网关根地址与用户 ID 获取方式」](#text2sql-base-url-user-id) |
   | `user_id` | `data_source.user_id`：`-u` → `TEXT2SQL_USER_ID` → 交互输入（同上节） |
   | `inner_llm.name` | 见 [「inner_llm.name（大模型名称）」](#text2sql-inner-llm-name)；样例脚本为 `--inner-llm-name` → `TEXT2SQL_INNER_LLM_NAME` → `DEFAULT_INNER_LLM["name"]` |

4. **复制与命名（执行准入）**  
   - **必须**：使用 `cp` / `copy` / `Copy-Item` 等将 **整份** `text2sql_request_example.py`（或本轮选用的 `.sh`）复制到任务目录，并命名为 `_tmp_t2s_<动作>_<主题>_<YYYYMMDD_HHMMSS>.py`（动作建议 `show` / `exec`）。  
   - 建议命名示例：`_tmp_t2s_show_sales_region_20260402_153045.py`、`_tmp_t2s_exec_sales_region_20260402_153052.py`（同一轮 show/exec 建议使用不同时间戳，避免覆盖）。  
  - 本轮参数一律通过 `-a`、`-t`、`-i`、`-g`、`-k`、`-u` 与环境变量传入，**优先保持副本与样例文件内容完全一致**；若确需改常量，**只改副本**。  
   - **禁止**写成精简版 `requests` 片段、缺字段的 `curl` 生成器，或空白文件拼贴。

### 结构参考文件（临时脚本的复制源，不得当执行入口）

**临时脚本** = 将下表 **推荐 / 备选** 对应文件 **整份复制** 到任务目录后 **重命名** 为 `_tmp_t2s_*`（下文「执行示例」中的 `path/to/_tmp_t2s_*.py` 均指该副本，**非**仓库内 `*_request_example*` 原路径）。

| 类型 | 参考文件 | 说明 |
|------|----------|------|
| **推荐（跨平台）** | [`../scripts/text2sql_request_example.py`](../scripts/text2sql_request_example.py) | **单文件自包含**（不读 `config.json`）；`-a show_ds` / `gen_exec`、`-g background`；标准库 `urllib`；`--insecure` 跳过 TLS。**`base_url` / `user_id`** 见 [「网关根地址与用户 ID」](#text2sql-base-url-user-id)；**`inner_llm.name`** 见 [「inner_llm.name（大模型名称）」](#text2sql-inner-llm-name)。**`TEXT2SQL_TOKEN`**，未设时回退 **`KN_SELECT_TOKEN`**。 |
| **备选（curl）** | [`../scripts/text2sql_request_example.sh`](../scripts/text2sql_request_example.sh) | 同上参数语义；依赖 **python3** 组装 JSON；`-K` 跳过 TLS。 |
| **遗留对照** | [`../scripts/text2sql_request_example.ps1`](../scripts/text2sql_request_example.ps1) | 仅作 Windows PowerShell / `Invoke-RestMethod` 对照，**非**推荐入口。 |
| **Windows 排错** | [windows-http-troubleshooting.md](windows-http-troubleshooting.md) | Token 头 `latin-1` 报错、控制台中文乱码、PowerShell/CMD 混用、`npx` 子进程找不到等；与 Python `urllib` 示例配合查阅。 |

### 执行示例（仅执行复制并重命名后的临时脚本）

推荐用 **Python**（由 [`text2sql_request_example.py`](../scripts/text2sql_request_example.py) **复制** 得到的 `_tmp_t2s_*.py`；`session_id` 可复用也可分别生成）。

Linux/macOS（Bash）：

```bash
export TEXT2SQL_TOKEN="$(kweaver token | tr -d '\r\n')"
python path/to/_tmp_t2s_show.py --action show_ds --insecure \
  -i "销售域里区域、月份统计可能用到哪些表和字段"
python path/to/_tmp_t2s_exec.py --action gen_exec --insecure \
  -i "按区域汇总上月订单金额，并给出各区域占比" \
  -g "候选表：fact_sales_order（order_id, region, order_month, amount）；维度表 dim_region（region_id, region_name）。统计按 region_name、order_month。" \
  -R 50
```

Windows PowerShell：

```powershell
# 建议用 cmd 只取 stdout，避免 Out-String 混入 stderr 导致 Token 含非 ASCII、urllib 报 latin-1（详见下方「Windows 排错」链接）
$env:TEXT2SQL_TOKEN = (cmd /c "npx kweaver token 2>nul").Trim()
python path\to\_tmp_t2s_show.py -a show_ds --insecure -i "销售域里区域、月份统计可能用到哪些表和字段"
python path\to\_tmp_t2s_exec.py -a gen_exec --insecure `
  -i "按区域汇总上月订单金额，并给出各区域占比" `
  -g "候选表：fact_sales_order（order_id, region, order_month, amount）；维度表 dim_region（region_id, region_name）。统计按 region_name、order_month。" `
  -R 50
```

**注意**：提示符为 **`PS ...>`** 时是 **PowerShell**，**不要**用 CMD 的 `set TEXT2SQL_TOKEN=...`。请用 **`$env:TEXT2SQL_TOKEN = ...`**，或 **`python ... -t 'token'`**。

**Windows 排错**：若出现请求头编码错误、中文乱码、Shell 语法混用、`npx` 找不到等，见 **[windows-http-troubleshooting.md](windows-http-troubleshooting.md)**。

Windows CMD 示例（仅 **`cmd.exe`**）：

```cmd
set TEXT2SQL_TOKEN=<your-token>
python path\to\_tmp_t2s_show.py -a show_ds --insecure -i "销售域里区域、月份统计可能用到哪些表和字段"
python path\to\_tmp_t2s_exec.py -a gen_exec --insecure -i "按区域汇总上月订单金额，并给出各区域占比" -g "候选表：..." -R 50
```

**Bash + curl**（需 `python3` 组装 JSON；`-K` 跳过 TLS）：

```bash
TOKEN=$(kweaver token | tr -d '\r\n')
./path/to/_tmp_t2s_show.sh -a show_ds -t "$TOKEN" -i "销售域里区域、月份统计可能用到哪些表和字段" -K
./path/to/_tmp_t2s_exec.sh -a gen_exec -t "$TOKEN" \
  -i "按区域汇总上月订单金额，并给出各区域占比" \
  -g "候选表：fact_sales_order（order_id, region, order_month, amount）..." \
  -R 50 -K
```

（`python ... --insecure` 与样例 `.py` 一致；`-K` / `curl --insecure` 与 [`text2sql_request_example.sh`](../scripts/text2sql_request_example.sh) 一致。）

**无脚本环境**：用 Postman / `curl` 发送，**Body 与样例 A/B 字段层级完全一致**。

### 任务结束后的临时文件（与 smart-ask-data Step 7 对齐）

纳入 **[smart-ask-data](../SKILL.md)** 问数主流程并成功交付后：

- **删除**：本轮用于执行的 **临时脚本**（由本仓库 `text2sql_request_example*` 复制得到、文件名 `_tmp_` 前缀，后缀 `.py` / `.sh` / `.ps1`）。
- **保留**：通过 `--out` 或默认路径落盘等产生的 **`_tmp_*.json`、`_tmp_*.ndjson`** 等 **临时数据**，供复核；编排侧 **默认不删**，除非用户明确要求清理这些数据。

流程 **异常提前终止** 时：临时脚本与临时数据均保留，不执行 Step 7 删除脚本。

## 样例（assistant 工具网关）

以下 `token`、`kn`、`user_id`、`session_id`、`input`、`background` 由调用方替换；`inner_llm` 须含 **`name`**（大模型名称）及采样参数，可与 [config.json](../config.json) → `tools.text2sql.inner_llm` 中的 `name` 等对齐；**样例与 `text2sql_request_example.py` 的请求体不传 `inner_llm.id`**。

### 样例 A：`show_ds`（第 2 步）

**Header**

```http
Content-Type: application/json
x-business-domain: bd_public
Authorization: {token}
```

**Body**

```json
{
  "config": {
    "background": "",
    "return_data_limit": 2000,
    "return_record_limit": 20,
    "session_id": "{session_id}",
    "session_type": "redis"
  },
  "data_source": {
    "kn": ["{kn_id}"],
    "user_id": "{user_id}"
  },
  "inner_llm": {
    "name": "deepseek_v3",
    "temperature": 0.1,
    "top_k": 1,
    "top_p": 1,
    "frequency_penalty": 0,
    "presence_penalty": 0,
    "max_tokens": 20000
  },
  "input": "销售域里做区域、月份统计可能用到哪些事实表和维度字段，列出表名与关键列",
  "action": "show_ds",
  "timeout": 120,
  "auth": {
    "token": "{token}"
  }
}
```

**响应处理示意**：从返回中摘录「表名、主键/外键、时间字段、区域字段」等，拼成一段 **纯文本 background**，供样例 B 使用。

### 样例 B：`gen_exec`（第 3 步）

**Header**：同样例 A。

**Body**（`config.background` 承接 show_ds 摘要；`session_id` 按调用方填写）

```json
{
  "config": {
    "background": "候选表：fact_sales_order（order_id, region, order_month, amount）；维度表 dim_region（region_id, region_name）。统计按 region_name、order_month。",
    "return_data_limit": 2000,
    "return_record_limit": 50,
    "session_id": "{session_id}",
    "session_type": "redis"
  },
  "data_source": {
    "kn": ["{kn_id}"],
    "user_id": "{user_id}"
  },
  "inner_llm": {
    "name": "deepseek_v3",
    "temperature": 0.1,
    "top_k": 1,
    "top_p": 1,
    "frequency_penalty": 0,
    "presence_penalty": 0,
    "max_tokens": 20000
  },
  "input": "按区域汇总上月订单金额，并给出各区域占比",
  "action": "gen_exec",
  "timeout": 120,
  "auth": {
    "token": "{token}"
  }
}
```

**响应示意（字段以平台为准）**

```json
{
  "sql": "SELECT ...",
  "rows": [
    { "region_name": "华东", "amount": 1200000 },
    { "region_name": "华北", "amount": 800000 }
  ],
  "tool_result_cache_key": "t2sql_cache_01HZZZZZZZZZZZZZZZZZZZZZZ"
}
```

若需 **json2plot**，将 `tool_result_cache_key` 原样传入绘图工具。

## 输出硬约束（命中数据时）

- 当 `gen_exec` 返回非空结果（如 `rows` 非空、或存在明确聚合值）时，最终面向用户的回复必须同时包含：
  - `sql` 字段对应的 SQL 文本（必须原样返回，不可脱敏，不可省略）；
  - 至少一段结果数据展示（表格/关键行/聚合数值，必须原样返回，不可篡改），不可只给结论。
- `show_ds` 与 `gen_exec` 的工具返回，必须原样回传；禁止生成、补造、篡改任何数据或字段。
- 若未命中数据（空结果），需明确说明“未查到数据”，并给出下一步建议（如调整时间范围、口径或 KN）。

## 注意事项

- `input` 必须为中文。
- `return_data_limit` / `return_record_limit` 等按业务在 `config` 中设置，避免一次拉取过大。
- session_id：如需复用缓存/状态，可与 show_ds 保持一致；否则按平台约定处理。
- 若 `show_ds` 结果为空或明显不匹配：先澄清业务对象或换 `kn_id`，不要强行 `gen_exec`。
- **元数据 KN、问数 KN 与 `SOUL.md`（强约束）**：元数据知识网络仅用于目录/对象实例检索（见 smart-search-tables），**不是**业务事实数据源；**禁止**将 `idrm_metadata_kn_object_lbb` 等元数据 KN 写入 `data_source.kn` 并执行 `show_ds` / `gen_exec`。若 **`SOUL.md` 中无可用的问数知识网络**，或实际上下文**只能落到元数据 KN / 未声明 KN**：**立即停止本任务**，**不得**用 config、样例默认 `kn_id` 顶替，**不得**转入找表或其它路径「凑数」；须提醒用户仅在 **`SOUL.md` 配置适合的业务问数知识网络**后重试。具备合法问数 KN 后，再按需先找表再在业务 KN 上问数。
- **Windows 本机执行**：Token、终端编码、PowerShell/CMD 等问题见 [windows-http-troubleshooting.md](windows-http-troubleshooting.md)。
