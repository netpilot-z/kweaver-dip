# 创建流程（Create）

从业务输入到可验证的 BKN 网络，含闭环评审与业务规则沉淀。

## Skill 路径索引

执行每一步时，读取对应 SKILL.md 并按其指令操作。

| skill | 路径（相对本文件） |
|-------|-------------------|
| bkn-domain | `../bkn-domain/SKILL.md` |
| bkn-extract | `../bkn-extract/SKILL.md` |
| bkn-doctor | `../bkn-doctor/SKILL.md` |
| bkn-draft | `../bkn-draft/SKILL.md` | 内部委托 archive-protocol 生成归档路径 |
| bkn-env | `../bkn-env/SKILL.md` |
| bkn-bind | `../bkn-bind/SKILL.md` |
| bkn-map | `../bkn-map/SKILL.md` |
| bkn-backfill | `../bkn-backfill/SKILL.md` |
| bkn-test | `../bkn-test/SKILL.md` |
| bkn-review | `../bkn-review/SKILL.md` |
| bkn-rules | `../bkn-rules/SKILL.md` |
| bkn-anchor | `../bkn-anchor/SKILL.md` |
| bkn-distribute | `../bkn-distribute/SKILL.md` |
| bkn-report | `../bkn-report/SKILL.md` |
| 公约 | `../_shared/contract.md` |
| 显示规范 | `../_shared/display.md` |

## 阶段总览

```
bkn-domain → bkn-extract → [bkn-doctor] → bkn-draft → bkn-env
  → bkn-bind（local 跳过，输出 view_schema_map）
  → bkn-map（local 跳过，属性名对齐+回灌）
  → bkn-backfill（local 跳过，级联修正关系/动作属性引用 + 写入前预检）
  → bkn-rules(full) → bkn-anchor → bkn-distribute → Skill注册
  → bkn-test(model_review) → bkn-review ─┐
       ↑                                │
       └──── 不达标（调整→重测）───────┘
                    │
                达标/接受
                    ↓
        bkn-rules(incremental) → 评审循环最终规则更新
                    ↓
        推送门禁(7条) → 预检修复循环 → 推送重试 → 回读
                    ↓
        bkn-test(qa_verify) → 巡检 → bkn-report
```

## 阶段一：建模

| 步骤 | 读取 | 分支条件 |
|------|------|---------|
| 策略确认 | （pipeline 自身，独占一轮，不执行提取） | — |
| 领域识别 | `../bkn-domain/SKILL.md` | normalized_top >= 70 直通；冲突请用户确认 |
| 对象关系提取 | `../bkn-extract/SKILL.md` | — |
| 质量检查 | （pipeline 判定） | pending >= 3 / 方向冲突 / 主键缺失 → bkn-doctor |
| 建模收敛 | `../bkn-doctor/SKILL.md` | 仅质量不达标时 |
| 清单确认 | 用户确认 | 确认后进入业务规则检查 |
| 业务规则检查 | `../bkn-extract/SKILL.md`（规则检查部分） | 关键规则（高风险）→ 用户必须确认"带风险继续" |

路径分类：
- **A（结构化文档）**：输入含明确定义 → 直接提取
- **A-fast（验证性提取）**：文档含汇总表 → 验证模式
- **B（部分信息）**：3+ 候选可识别 → 领域提取
- **C（不稳定）**：模糊/冲突/pending多 → bkn-doctor

## 阶段二：落盘

| 步骤 | 读取 |
|------|------|
| 生成 .bkn 文件 | `../bkn-draft/SKILL.md` |
| 结构校验 | 由 bkn-draft 委托 kweaver-core |
| 用户复核 | 确认步骤 |

## 阶段三：环境检查

| 步骤 | 读取 | 说明 |
|------|------|------|
| 就绪检查 | `../bkn-env/SKILL.md` | 输出 `bind_mode` 和 `env_capability_matrix` |
| bootstrap | 需搭建则暂停，完成后回检 | 仅 `bind_mode == full` 时 |

`bkn-env` 判定 `bind_mode: deferred`（无可用数据视图）时，阶段四整体跳过，直接进入阶段五。`env_capability_matrix` 写入 `pipeline_state.yaml`，供后续阶段裁剪分支。

## 阶段四：视图绑定

**前置条件**：`bind_mode == full`。若 `bind_mode == deferred`，本阶段跳过，在 `pipeline_state.yaml` 中记录 `stage4: skipped` 且 `map_completed: skipped`。

**`存储位置: local` 对象处理**：`bkn-bind`、`bkn-map`、`bkn-backfill` 均跳过 local 对象，仅对 `platform` 对象执行绑定/映射/回填。

| 步骤 | 读取 | local 对象处理 |
|------|------|----------------|
| 对象级绑定 | `../bkn-bind/SKILL.md` | 跳过，不参与视图匹配 |
| 属性级映射 | `../bkn-map/SKILL.md` | 跳过，无视图可映射 |
| 回填 .bkn | `../bkn-backfill/SKILL.md` | 跳过，无需回填 |
| 状态守卫 | （pipeline 直接执行） | 调用 bkn-backfill 前确认 `map_completed == true` 或 `skipped`，否则不执行 |
| 状态写入 | （pipeline 直接执行） | `bkn-map` 完成后将 `map_completed: true` 写入 `pipeline_state.yaml` |
| 用户确认 | 确认步骤 | — |

## 阶段五：业务规则沉淀（必执行）

| 步骤 | 读取 | 说明 |
|------|------|------|
| 提取业务规则 | `../bkn-rules/SKILL.md` | 生成 Skill 文件（必执行） |
| 规则确认 | 用户确认 | 确认规则 Skill 内容后进入锚定 |
| 锚定到网络 | `../bkn-anchor/SKILL.md` | 每个 Skill → 孤悬对象类 |
| 多平台分发 | `../bkn-distribute/SKILL.md` | 用户选择目标平台，安装到各平台 |
| 平台发布 Skill | （pipeline 直接执行） | 可选，注册到 KWeaver 市场，见下方说明 |

> 此阶段生成业务规则 Skill，供后续阶段六的 model_review 测试使用。

**Skill 消费与分发**：

业务规则 Skill 有不同的消费者，对应不同的安装路径：

| 消费者 | 加载路径 | 是否依赖平台注册 |
|--------|---------|-----------------|
| Cursor Agent | 读取 `.cursor/skills/{network_id}-rules/` 下的 SKILL.md | 不依赖 |
| Claude Agent | 读取 `.claude/skills/{network_id}-rules/` 下的 SKILL.md | 不依赖 |
| OpenClaw Agent | 读取 `openclaw/skills/{network_id}-rules/` 下的 SKILL.md | 不依赖 |
| KWeaver Decision Agent | 读取 KN schema 的 Description 字段（推送后可用） | 不依赖 |
| 其他用户/团队 | 从 OpenClaw 市场搜索并安装 | 依赖 |

> 命名统一使用 `network_id` 标识，不使用网络名。详见 `contract.md` Skill 生命周期规范。

**多平台分发（必须）**：

bkn-anchor 完成后，委托 `bkn-distribute` 将业务规则 Skill 安装到用户选择的一个或多个 AI 平台本地目录中。

执行步骤（委托 `bkn-distribute`）：
1. 扫描工作区根目录，检测已知平台（`.cursor/`、`.claude/`、`openclaw/` 等）
2. 向用户展示平台选择菜单，列出已检测到的平台及可新增的平台
3. 用户选择后，将 Skill 文件复制到对应平台的 `skills/{network_id}-rules/` 目录
4. 回读校验：确认每个目标路径下文件存在且内容非空
5. 分发结果写入信封

若用户选择跳过（选 N），分发状态记为 `skipped`，不阻断后续流程。

**平台发布（可选）**：

多平台分发完成后，询问用户是否将 Skill 发布到 KWeaver/OpenClaw 市场：

```
业务规则 Skill 已安装到本地平台。
是否同时发布到 KWeaver 市场，供其他用户搜索和安装？

  A. 是，发布到市场
  B. 否，仅本地使用
```

选 A 时：
1. 检查 `env_capability_matrix.skill_module`
   - `available` → 执行 `kweaver skill register --content-file <path>`，成功后 `kweaver skill list` 回读确认
   - `unavailable` → 提示"Skill 模块在当前环境不可用"，在 `{network_dir}/skills/` 下生成 `PUBLISH_MANUAL.md`（含手动发布命令）
2. 发布结果写入信封（`published` / `publish_failed` / `publish_unavailable`）

选 B 则跳过，报告中注明"仅本地安装，未发布到市场"。

## 阶段六：BKN 模型审查 + 评审循环

| 步骤 | 读取 | 说明 |
|------|------|------|
| 生成测试集 | `../bkn-test/SKILL.md`（model_review 模式） | 结构 + 规则 + 绑定 + 风险 |
| 评审 | `../bkn-review/SKILL.md` | 质量评分 + 调整分发（规则覆盖率包含 Skill 文件质量子项） |
| 达标? | pipeline 判定 | >= 80 通过；< 80 进入调整 |
| 调整 | 按 bkn-review 建议回调对应 skill | 模型→doctor，绑定→bind/map/backfill |
| 重测 | 回到 bkn-test（重新生成测试集，基于调整后的模型和规则） | 最多循环 3 轮 |
| 规则更新 | `../bkn-rules/SKILL.md`（incremental 模式） | 评审循环结束后（达标或用户接受现状），基于最终调整结果增量更新规则 Skill 文件 |

用户可主动说"跳过审查"或"接受现状推送"退出循环。

## 阶段七：推送

**硬前置门禁**：推送前必须满足以下条件，否则 BLOCKED：
1. 阶段四已执行完毕且 `backfill_status == success`；**若 `bind_mode == deferred`，此条豁免**
2. 所有 `.bkn` 文件中不存在 `待绑定` / `TBD` / 空 `view_id` 占位符；**若 `bind_mode == deferred` 且 `.bkn` 中无 Data Source 段，此条豁免**
3. 所有 Data Properties 的 Type 列值在合法类型列表内（无 `number`）
4. 所有 Action Type 的 Bound Object 表 Action Type 列值为 `add`/`modify`/`delete`（无 `create`/`update`/`query`）
5. 所有对象的 Display Key 非空
6. **`存储位置: local` 的对象**：不参与门禁 1（视图绑定）、门禁 2（Data Source 占位符）检查，但仍需满足门禁 3（Type 合法性）、门禁 5（Display Key 非空）
7. **关系映射完整性预检**（`_shared/prepush-validation.md`）通过：所有 relation_types 的 Source/Target Property 存在、所有 action_types 的 Parameter Binding 属性存在、Concept Group 成员存在、Network Overview 一致

### 7.1 门禁自检

扫描 .bkn 目录，逐项校验门禁 1-6（根据 `bind_mode` 和 `存储位置` 应用豁免）。门禁 1-6 任一不满足则 BLOCKED。门禁 7（关系映射预检）统一在 7.2 执行。

### 7.2 关系映射预检 + 修复循环

1. **执行预检**：调用 `_shared/prepush-validation.md`，输入 `network_dir`，获取预检结果
2. **`status: pass`** → 进入 7.3
3. **`status: fail`** → 按 `_shared/prepush-validation.md` 中的错误修复指引执行修复，修复后重新预检，**最多循环 3 次**

**修复执行规则**：
- 涉及 `.bkn` 文件修改的修复（属性名修正、Overview 同步等），必须委托 `bkn-backfill` 执行，pipeline 不直接写 `.bkn` 文件（遵循 `contract.md` 约定）
- 只修**确定性错误**（拼写不一致、引用错位、遗漏/过期），不做语义判断
- 每次修复后必须**重新执行预检**确认修复效果
- 循环 3 次仍有错误 → 列出全部剩余错误和 `push_retry_log.yaml` 修复记录，**阻断推送**，提示用户手动修复
  - 用户手动修复完成后，**回到 7.1 重新执行门禁自检**（从 7.1 → 7.2 → 7.3 完整走一遍）
- 所有修复动作记录到 `{network_dir}/push_retry_log.yaml`，可追溯

### 7.3 推送准备

| 步骤 | 行为 |
|------|------|
| 检查同名网络 | 委托 kweaver-core |
| 同名冲突处理 | 若存在同名网络，展示选项：A. 自动加版本后缀 `_v{n}` / B. 用户手动命名 / C. 覆盖推送（需二次确认"确认覆盖"） |
| 用户确认推送 | 确认步骤 |

### 7.4 推送执行 + 重试

| 步骤 | 行为 |
|------|------|
| 推送 | `kweaver bkn create` + `push --branch main`（委托 kweaver-core） |
| 推送成功 | 进入 7.5 |
| 推送失败 | 解析平台返回的错误信息，按错误类型分类处理（见下方重试策略），修复后重试，**最多 3 次** |

**推送重试策略**：

| 平台错误类型 | 处理策略 |
|------------|---------|
| 属性不存在/无效 | 回到 7.2 预检修复流程，修正后重新预检 → 7.3 → 7.4 |
| 数据资源类型无效 | 检查 local 对象是否误生成了 Data Source，委托 bkn-backfill 修正后回到 7.2 重新预检 → 7.3 → 7.4 |
| 网络结构冲突 | 分析冲突详情，判断是否需回退到阶段六调整 |
| 网络/权限/服务端错误 | 不重试，直接报错，提示用户检查平台状态 |

重试 3 次仍失败 → 输出完整错误日志和修复记录，**阻断推送**，提示用户介入或进入 `bkn-doctor` 诊断。

### 7.5 完整性检查

回读验证：`kweaver bkn get <kn_id> --stats` 确认对象/关系/动作数量与本地一致。

### 7.6 规则最终更新

推送完成后，执行 `../bkn-rules/SKILL.md`（`incremental` 模式），基于最终推送确认的网络结构更新业务规则 Skill 文件。增量更新自动执行版本递增和旧版本归档（详见 `bkn-rules` 归档机制）。

## 阶段八：Q&A 验证 + 巡检 + 报告

| 步骤 | 读取 | 说明 |
|------|------|------|
| 验收引导 + Q&A 验证 | `../bkn-test/SKILL.md`（qa_verify 模式） | 生成分级问题 → 呈现验收引导卡 → 询问用户选择验证方式 |
| 巡检配置 | `../references/patrol-standard.md` | 读取巡检指标和标准 |
| 巡检任务创建 | 读取 `pipeline_state.yaml` 中的 `env_capability_matrix.patrol_cron` | 能力检测决定自动创建或降级 |
| 报告 | `../bkn-report/SKILL.md` | 最终归档报告 |

> 此阶段基于阶段五已生成的业务规则 Skill，在已推送网络上做实际验证。

**qa_verify 不依赖平台发布**。qa_verify 验证的是 KN schema（已推送到平台）和本地 SKILL.md（阶段五已分发），两者都不需要平台注册。

**qa_verify 执行说明**：
- 引导卡为必出产物，无论用户选哪种验证方式
- L1-L3 验证基于 KN schema（`kweaver context-loader` / `kweaver bkn search`）
- **L3 级问题必须基于 `skills/{network_id}-rules.md` 业务规则 Skill 文件生成**（见 `bkn-test` qa_verify L3 规则验证）
- L4 推理验证基于 Agent 加载本地 SKILL.md 的能力（如当前工作区已分发），或 KWeaver Agent chat（如可用）
- L4 推理题的最终判定，始终需要用户确认
- 有 fail 项不阻断报告生成，在报告中标记并提示可进入 update pipeline 修复

**巡检任务创建（P1-5/P1-6）**：

读取 `env_capability_matrix.patrol_cron` 决定巡检创建策略：

**路径 A：定时任务可用 → 自动创建巡检任务**

读取 `pipeline_state.yaml` 中的 `env_capability_matrix.patrol_cron` 确认为 `available` 后：

```
检测到 OpenClaw 定时任务能力可用，将为「{network_name}」创建自动巡检任务。

巡检配置：
  · 网络：{network_name}（{network_id}）
  · 执行频率：{weekly | every_3_days | daily}（根据对象数量自动判定）
  · 分析指标：结构完整性（L1-L3）+ 问答准确性（详见 patrol-standard.md）
  · 触发动作：异常时自动生成 feedback_brief → 触发 feedback pipeline 修复

请确认：
  A. 确认创建，按上述配置
  B. 调整配置（可修改频率、指标阈值）
  C. 跳过，仅生成 Prompt 模板
```

选 A/B 时：
1. 读取 `../references/patrol-standard.md` 中的指标定义和阈值
2. 根据网络对象数量自动判定推荐频率（≤10 → 每周，11-30 → 每3天，>30 → 每日）
3. 尝试创建巡检任务（委托 kweaver-core 调用 OpenClaw 调度 API；如 API 不可用则降级为输出 PATROL_CONFIG.md 供手动配置）
4. 输出 `PATROL_CONFIG.md` 到 `{network_dir}/`，包含：
   - 任务 ID 和执行配置（如自动创建成功）或手动配置指令
   - 巡检指标和阈值
   - 触发条件和触发动作
   - 手动触发和查询指令
5. 报告中记录巡检任务配置路径

选 C 或 API 不可用时降级为路径 B。

**路径 B：不可用或用户选择跳过 → 生成 Prompt 模板（v1 降级方案）**

```
当前环境不支持自动创建巡检任务，将生成 Prompt 模板。
模板可手动配置到定时任务系统，定期分析 Agent 对话质量并触发改进建议。

  A. 生成模板
  B. 跳过
```

选 A 后，在 `{network_dir}/PATROL_PROMPT.md` 中输出：
1. 巡检 prompt 模板（包含 network_id、Agent ID、分析指令）
2. 推荐执行频率（周/日）
3. 异常信号判定标准（无法回答 / 检索得分低 / 用户追问或纠正 / 会话极短）
4. 触发 feedback_review pipeline 的指令模板（含 `feedback_brief` 格式）

报告中记录巡检模板路径。选 B 则跳过，报告中注明"未生成巡检模板，如需启用请手动触发 feedback_review"。
