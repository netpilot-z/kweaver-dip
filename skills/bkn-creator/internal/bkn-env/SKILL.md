---
name: bkn-env
description: BKN 执行前环境就绪检查与 bootstrap 判定。
---

# 环境检查

公约：`../_shared/contract.md`

## 做什么

在绑定/推送前，检查环境是否就绪。如果缺少必要资源，判定是否需要搭建。

## 输入

- `network_dir`：BKN 草案目录
- `network_context`：网络名称、领域
- `goal`：validate / push / update / copy

## 检查清单

| 检查项 | 方法 | 失败结果 |
|--------|------|---------|
| 草案目录 | `network_dir` 存在 + `network.bkn` 齐备 | blocked |
| CLI | `kweaver --version` | blocked |
| 平台连通性 | `kweaver config show` | blocked |
| 业务域 | 配置是否匹配 | warning |
| 同名网络 | `kweaver bkn list` | 记录冲突 |
| 资源就绪 | 数据源 + 数据视图是否存在 | 触发 bind_mode 判定 |
| Skill 模块 | `kweaver skill list --limit 1` | warning（记入 capability_matrix） |
| Agent 工厂 | `kweaver agent list --limit 1` | warning（记入 capability_matrix） |
| 定时任务（巡检用） | OpenClaw 调度 API 可用性 | warning（记入 capability_matrix） |

所有 CLI 操作委托 `kweaver-core`。

### 定时任务能力检测

在检查清单末尾，检测 OpenClaw 定时任务能力（P1-5/P1-6 巡检自动创建）：

1. 检测 OpenClaw 是否已安装且可访问（委托 `kweaver-core` 检查环境）
2. 检测 OpenClaw 调度 API 是否可用（`openclaw cron list` 或等价命令）
3. 结果写入 `env_capability_matrix.patrol_cron`：`available` | `unavailable`
4. 不可用时不阻塞流程，pipeline 阶段八降级为 Prompt 模板输出

## 数据视图可用性检查

在资源就绪检查阶段，获取平台可用数据视图列表（仅元数据），供后续绑定阶段使用：

1. 执行 `kweaver dataview list` 获取平台全部可用数据视图
   - **必须获取全部视图**：优先使用 `--all` 参数；如不支持则使用 `--page-size` 分页循环获取，直到获取数量等于平台返回的总数
   - 如平台未返回总数且 CLI 不支持分页参数，执行 `kweaver dataview list --limit 9999` 作为降级方案
2. 输出 `dataview_availability`（仅含视图元数据，不做对象-视图匹配推荐）
3. 对象-视图匹配的决策权交由 `bkn-bind`
4. **视图字段 schema 由 `bkn-bind` 按需获取**（`bkn-bind` 执行 `kweaver dataview get` 获取已匹配视图的完整字段 schema）

```yaml
dataview_availability:
  total_views: 0
  fetched_views: 0        # 实际获取的视图数量
  truncated: false        # true 表示平台有截断风险，bkn-bind 应 warn 用户
  available_views: [{view_id, view_name, datasource_id, field_count}]
```

## Bootstrap 与 bind_mode 判定

| 资源状态 | bootstrap_level | result_status | bind_mode |
|---------|----------------|---------------|-----------|
| 数据源+视图都有 | none | ready | full |
| 仅有其一 | soft | need_user_confirm | full |
| 都没有 | none | ready | deferred |

`bind_mode: deferred` 表示当前环境无可用数据视图，pipeline 将跳过视图绑定阶段（阶段四），推送门禁中的绑定相关条件自动豁免。网络以 schema-only 模式推送，数据视图可后续通过 update pipeline 补绑。

## 输出

```yaml
environment_status: ready | blocked | warning
bootstrap_required: true | false
bootstrap_level: soft | none
bind_mode: full | deferred
check_summary: {cli, connectivity, domain, draft, resource_readiness}
blocking_issues: [{issue, reason, suggested_fix}]
bootstrap_plan: {steps, estimated_effort}
dataview_availability: {total_views, fetched_views, truncated, available_views}
env_capability_matrix:
  cli: available | unavailable
  platform: available | unavailable
  skill_module: available | unavailable
  agent_factory: available | unavailable
  dataview: available | unavailable
  context_loader: available | unavailable
  patrol_cron: available | unavailable  # P1-5/P1-6 巡检自动创建
```

`env_capability_matrix` 写入 `pipeline_state.yaml`，后续阶段据此裁剪分支（如 Skill 注册降级、Agent QA 降级）。

## 约束

- 仅检查不修改 .bkn
- 不执行 push/delete/update
- bootstrap 前需用户确认
