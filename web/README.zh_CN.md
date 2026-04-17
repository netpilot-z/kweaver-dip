# kweaver-web

用于统一管理 **Kweaver DIP** 相关前端应用、共享组件、图标、国际化、请求层与通用工具等的 **pnpm + Turborepo** 工作区。

中文 | [English](README.md)

## 前置要求

- **Node.js** `>= 20`
- **pnpm** `10.x`

## 目标

- 建立统一的 `apps/*` + `packages/*` monorepo 结构
- 以 `apps/dip` 为主业务应用（DIP 数字员工）
- 沉淀 `components`、`icons`、`i18n`、`request`、`utils` 等可复用包
- 在 `components` 中采用 `antd` + adapter 的组件分层方式

## 目录结构

```text
.
├─ apps/                     # 各业务/工具前端（独立可运行应用）
│  ├─ dip/                   # DIP 主应用（数字员工，Rsbuild）
│  ├─ agent-web/             # 决策智能体
│  ├─ operator-web/          # 执行工厂
│  ├─ doc-audit-client/      # 审核待办
│  ├─ model-manager/         # 模型管理
│  ├─ business-system/       # 业务域管理
│  └─ dataflow-web/          # 数据流（独立子 workspace，见下方说明）
├─ packages/                 # 共享库（供 apps 引用）
│  ├─ components/            # 基于 antd adapter 的通用组件包
│  ├─ icons/                 # 通用图标导出包
│  ├─ i18n/                  # 通用国际化   
│  ├─ request/               # 通用请求层
│  └─ utils/                 # 通用工具函数包
├─ tooling/
│  ├─ tsconfig/              # 共享 TypeScript 配置
│  └─ tsup-config/           # 共享 tsup 配置工厂
├─ package.json
├─ pnpm-workspace.yaml
└─ turbo.json
```

| 应用目录 | 说明 |
|----------|------|
| `apps/dip` | DIP 主应用（数字员工） |
| `apps/agent-web` | 决策智能体 |
| `apps/operator-web` | 执行工厂 |
| `apps/doc-audit-client` | 审核待办 |
| `apps/model-manager` | 模型管理 |
| `apps/business-system` | 业务域管理 |
| `apps/dataflow-web` | 数据流 |

## 共享包（`@kweaver-web/*`）

| 包名 | 说明 |
|------|------|
| `@kweaver-web/components` | 通用 UI 组件（antd adapter） |
| `@kweaver-web/icons` | 图标资源 |
| `@kweaver-web/i18n` | 国际化 |
| `@kweaver-web/request` | HTTP / 请求层 |
| `@kweaver-web/utils` | 工具函数 |

各应用通过 `workspace:*` 引用上述包（以各 `package.json` 为准）。

## 快速开始

在仓库 **`web/`** 根目录执行：

```bash
pnpm install
```

根目录常用脚本：

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 并行启动所有配置了 `dev` 的任务（Turborepo） |
| `pnpm dev:dip` | 仅启动 DIP 应用（`@kweaver-web/dip`） |
| `pnpm build` | 全量构建 |
| `pnpm typecheck` | 全量 TypeScript 检查 |
| `pnpm lint` | 全量 Lint |
| `pnpm test` | 全量测试 |

首次拉代码后建议执行一次：

```bash
pnpm typecheck
```

### 开发 DIP 主应用

```bash
pnpm dev:dip
```

环境变量、端口、本地调试与质量门禁等说明见：[apps/dip/README.md](apps/dip/README.md)。

---

更多应用级说明请查看对应目录下的 `README.md`（例如 `apps/dip/README.md`、`apps/agent-web/README.md` 等）。
