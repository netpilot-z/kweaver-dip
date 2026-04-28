# BKN Skills v2 — 能力矩阵 + Pipeline 架构

## 架构

```
用户输入 → bkn-creator(意图识别) → pipeline(流程编排) → skill(原子执行) → 产物
```

- **bkn-creator** 是唯一入口，注册到宿主平台的 skill 系统中（`.cursor/skills/bkn-creator/SKILL.md`）
- **internal/_pipelines/** 是流程编排定义，被 bkn-creator 按需读取
- **internal/bkn-*/** 是 13 个核心原子 skill，被 pipeline 按需读取
- **internal/_plugins/** 是 4 个可插拔原子 skill，开源版可删除
- **internal/_shared/** 是公约和规范，被所有文件引用

## 部署

### 宿主平台需要做的

1. 将 `bkn-creator` 注册为可自动触发的 skill
2. 确保 AI 能通过相对路径读取本目录下的所有文件

### Cursor 部署

```
.cursor/skills/bkn-creator/
├── SKILL.md              ← 桥接入口
└── internal/             ← 内部实现（私有，不会被 Cursor 扫描为 skill）
    ├── _shared/
    ├── _pipelines/
    ├── _plugins/         ← 可插拔能力（开源版删除此目录）
    └── bkn-*/            ← 13 个核心原子 skill
```

### 其他平台

只需将 `bkn-creator` 的触发机制适配到对应平台，
pipeline 和 skill 文件通过相对路径引用，无需修改。

## 目录结构

```
.cursor/skills/bkn-creator/
├── SKILL.md                  ← 意图路由（唯一入口）
└── internal/
    ├── _shared/              公约 + 显示规范 + 插件检测 + 推送前预检
    │   ├── contract.md
    │   ├── display.md
    │   ├── plugin-check.md   ← 插件可用性检测协议
    │   └── prepush-validation.md  ← 推送前关系映射完整性预检
    ├── _plugins/             可插拔能力（开源版删除此目录）
    │   ├── MANIFEST.md       ← 插件清单
    │   ├── bkn-rules/        业务规则提取（必执行）
    │   ├── bkn-test/         测试与验证（3 模式）
    │   ├── bkn-anchor/       Skill 锚定到网络
    │   └── bkn-distribute/   多平台分发
    ├── _pipelines/           8 条流程编排
    │   ├── create.md         创建（含闭环评审 + 业务规则沉淀）
    │   ├── extract.md        提取
    │   ├── read.md           查询
    │   ├── update.md         更新
    │   ├── delete.md         删除
    │   ├── copy.md           复制
    │   ├── skill-gen.md      能力补齐
    │   └── feedback.md       反馈巡检与持续改进
    ├── bkn-domain/           领域评分
    ├── bkn-extract/          对象关系提取
    ├── bkn-doctor/           建模诊断收敛
    ├── bkn-draft/            BKN 草案落盘
    ├── bkn-env/              环境检查 + 插件可用性检测
    ├── bkn-bind/             视图绑定
    ├── bkn-map/              属性映射
    ├── bkn-backfill/         .bkn 回填
    ├── bkn-review/           网络评审 + 质量评分（含插件降级逻辑）
    ├── bkn-skillgen/         能力缺口分析
    ├── bkn-kweaver/          KWeaver CLI 操作层（内化自 kweaver-core）
    ├── bkn-archive/          全局归档协议（内化自 archive-protocol）
    ├── bkn-report/           报告生成
    └── references/           引用规范
        └── patrol-standard.md
```

## 可插拔能力

`internal/_plugins/` 目录包含进阶能力，开源版本可删除此目录，核心流程将自动降级：

| 插件 | 功能 | 开源版降级行为 |
|------|------|---------------|
| `bkn-rules` | 从 PRD/对话/建模提取业务规则，生成可复用的 Skill 文件 | 阶段五跳过 → 无 Skill 文件 → bkn-review 规则覆盖率降级 → L3 无法验证 |
| `bkn-test` | 生成测试集与验证用例（model_review / rules_verification / qa_verify 三模式） | 阶段六/八跳过 → bkn-review 测试通过率降级 → 无 qa_verify |
| `bkn-anchor` | 将业务规则 Skill 锚定为 BKN 网络中的孤悬对象类 | 随 bkn-rules 一起跳过 |
| `bkn-distribute` | 将业务规则 Skill 分发到多个 AI 平台本地目录 | 随 bkn-rules 一起跳过 |

### 插件检测协议

Pipeline 启动时由 `bkn-env` 执行 `plugin-check.md` 协议，检测插件文件存在性，输出 `plugin_availability`：

```yaml
plugin_availability:
  rules: available | unavailable
  test: available | unavailable
plugin_mode: full | limited
```

后续阶段据此裁剪分支，详见 `_shared/plugin-check.md`。

### 安装/卸载

**安装（进阶版）**：
保留 `_plugins/` 目录即可，pipeline 自动检测并启用。

**卸载（开源版）**：
```bash
rm -rf internal/_plugins/
```
Pipeline 自动降级，不影响核心建模、绑定、推送功能。

## 外部依赖

无。bkn-creator 完全自包含，无需预装其他 skill。

> `data-semantic` 的 API 参考已内化在 `bkn-bind/references/semantic-guide.md` 中。

## 内化参考

以下 skill 已内化到 `internal/` 目录下，通过相对路径引用：

| 目录 | 功能 |
|------|------|
| `bkn-kweaver/` | KWeaver CLI 操作（内化自 kweaver-core） |
| `bkn-archive/` | 全局归档协议（内化自 archive-protocol） |

## 内化规范

以下规范已内化到对应 skill 的 `references/` 目录，供内部快速查阅：

| 目录 | 功能 |
|------|------|
| `bkn-kweaver/references/` | KWeaver CLI 完整参考（auth/bkn/agent/ds/dataview/skill/vega/config/context-loader/call/troubleshooting） |
| `bkn-draft/references/` | BKN 文件格式规范（SPECIFICATION.llm.md） |
| `bkn-bind/references/` | 绑定规则 + 语义服务参考（semantic-guide.md）