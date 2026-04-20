# BKN Skills v2 — 能力矩阵 + Pipeline 架构

## 架构

```
用户输入 → bkn-creator(意图识别) → pipeline(流程编排) → skill(原子执行) → 产物
```

- **bkn-creator** 是唯一入口，注册到宿主平台的 skill 系统中（`.cursor/skills/bkn-creator/SKILL.md`）
- **internal/_pipelines/** 是流程编排定义，被 bkn-creator 按需读取
- **internal/bkn-*/** 是 15 个原子 skill，被 pipeline 按需读取
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
    └── bkn-*/            ← 15 个原子 skill
```

### 其他平台

只需将 `bkn-creator` 的触发机制适配到对应平台，
pipeline 和 skill 文件通过相对路径引用，无需修改。

## 目录结构

```
.cursor/skills/bkn-creator/
├── SKILL.md                  ← 意图路由（唯一入口）
└── internal/
    ├── _shared/              公约 + 显示规范
    │   ├── contract.md
    │   └── display.md
    ├── _pipelines/           7 条流程编排
    │   ├── create.md         创建（含闭环评审 + 业务规则沉淀）
    │   ├── extract.md        提取
    │   ├── read.md           查询
    │   ├── update.md         更新
    │   ├── delete.md         删除
    │   ├── copy.md           复制
    │   └── skill-gen.md      能力补齐
    ├── bkn-domain/           领域评分
    ├── bkn-extract/          对象关系提取
    ├── bkn-doctor/           建模诊断收敛
    ├── bkn-rules/            业务规则提取（必执行）
    ├── bkn-draft/            BKN 草案落盘
    ├── bkn-env/              环境检查
    ├── bkn-bind/             视图绑定
    ├── bkn-map/              属性映射
    ├── bkn-backfill/         .bkn 回填
    ├── bkn-test/             测试与验证（3 模式）
    ├── bkn-review/           网络评审 + 质量评分
    ├── bkn-anchor/           Skill 锚定到网络
    ├── bkn-distribute/       多平台分发
    ├── bkn-skillgen/         能力缺口分析
    └── bkn-report/           报告生成
```

## 外部依赖

以下 skill 通过 skill name 调用，不在本目录内：

| skill name | 功能 |
|------------|------|
| `create-bkn` | BKN 文件生成 |
| `kweaver-core` | KWeaver CLI/平台操作 |
| `data-semantic` | 数据语义服务 |
| `archive-protocol` | 全局归档协议 |