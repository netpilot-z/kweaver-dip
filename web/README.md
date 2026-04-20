# kweaver-web

A **pnpm + Turborepo** workspace for **Kweaver DIP** front-end apps, shared components, icons, i18n, request layer, and utilities.

[中文](README.zh_CN.md) | English

## Prerequisites

- **Node.js** `>= 20`
- **pnpm** `10.x`

## Goals

- Standard `apps/*` + `packages/*` monorepo layout
- Use `apps/dip` as the primary business app (DIP digital employee)
- Shared packages: `components`, `icons`, `i18n`, `request`, `utils`
- In `components`, use an `antd` + adapter component layering approach

## Repository structure

```text
.
├─ apps/                     # Business / tool front ends (runnable apps)
│  ├─ dip/                   # Main DIP app (digital employee, Rsbuild)
│  ├─ agent-web/             # Decision intelligence agent
│  ├─ operator-web/          # Execution factory
│  ├─ doc-audit-client/      # Audit backlog
│  ├─ model-manager/         # Model management
│  ├─ business-system/       # Business domain management
│  └─ dataflow-web/          # Data flow (nested workspace)
├─ packages/                 # Shared libraries (consumed by apps)
│  ├─ components/            # Shared components (antd adapter)
│  ├─ icons/                 # Shared icon package
│  ├─ i18n/                  # Shared i18n
│  ├─ request/               # Shared request layer
│  └─ utils/                 # Shared utilities
├─ tooling/
│  ├─ tsconfig/              # Shared TypeScript config
│  └─ tsup-config/           # Shared tsup config factory
├─ package.json
├─ pnpm-workspace.yaml
└─ turbo.json
```

| App path | Description |
|----------|-------------|
| `apps/dip` | Main DIP app (digital employee) |
| `apps/agent-web` | Decision intelligence agent |
| `apps/operator-web` | Execution factory |
| `apps/doc-audit-client` | Audit backlog |
| `apps/model-manager` | Model management |
| `apps/business-system` | Business domain management |
| `apps/dataflow-web` | Data flow |

## Shared packages (`@kweaver-web/*`)

| Package | Description |
|---------|-------------|
| `@kweaver-web/components` | Shared UI components (antd adapter) |
| `@kweaver-web/icons` | Icons |
| `@kweaver-web/i18n` | Internationalization |
| `@kweaver-web/request` | HTTP / request layer |
| `@kweaver-web/utils` | Utilities |

Apps reference these packages via `workspace:*` (see each `package.json`).

## Quick start

From the **`web/`** repository root:

```bash
pnpm install
```

Root scripts:

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run all `dev` tasks in parallel (Turborepo) |
| `pnpm dev:dip` | Start only the DIP app (`@kweaver-web/dip`) |
| `pnpm build` | Full build |
| `pnpm typecheck` | TypeScript check across the workspace |
| `pnpm lint` | Lint across the workspace |
| `pnpm test` | Tests across the workspace |

After cloning, run a full typecheck once:

```bash
pnpm typecheck
```

### Develop the main DIP app

```bash
pnpm dev:dip
```

Env vars, port, local debugging, and quality gates: [apps/dip/README.md](apps/dip/README.md).

For "Micro-app local integration debugging (local entry override)", see the corresponding section in `apps/dip/README.md`.

---

For more app-level documentation, see each app’s `README` (e.g. `apps/dip/README.md`, `apps/agent-web/README.md`).
