# GBKN

**Global Business Knowledge Network（全局业务知识网络）** — 面向企业的 Go 单体仓库，用于把数据与语义沉淀为可治理的**业务知识**（业务对象、关系与跨系统语义）。

[![Go 版本](https://img.shields.io/badge/Go-1.25+-00ADD8?style=flat&logo=go)](https://golang.org)
[![框架](https://img.shields.io/badge/框架-Go--Zero-blue)](https://go-zero.dev)
[![许可证](https://img.shields.io/badge/许可证-MIT-green.svg)](LICENSE)

## 概述

`gbkn` 是 GBKN 平台的工程实现目录。当前已落地的能力主要是 **data-semantic（数据语义理解）**：对库表 / 表单视图进行语义理解，并由 AI 辅助识别业务对象，支持人工修订与确认。后续会在同一仓库内扩展更多服务；新增领域建议沿用现有约定（`api/doc/` 下按模块拆分 `.api`，`api/internal/logic/<领域>/` 实现逻辑，通用客户端放在 `internal/pkg/`）。

### 本仓库中的服务

| 服务 | 说明 | 当前 HTTP 前缀 |
|------|------|----------------|
| **平台 / 健康检查** | 存活检测及后续横切能力 | `/api/gbkn/v1` |
| **data-semantic** | 库表与字段语义、业务对象、理解流程 | `/api/data-semantic/v1` |

HTTP 侧目前是 **单一 Go-Zero 进程**（`api/api.go`），通过不同前缀挂载多组路由。需要异步流水线时运行 **`consumer/`** 中的 Kafka 消费者。

### data-semantic（当前能力）

- **AI 辅助**的库表、字段语义分析  
- **业务对象识别**，支持人工编辑与确认  
- **重新识别 / 版本演进**  
- **Kafka** 异步处理  
- **理解状态机**（常量见 `model/form_view/vars.go`）

## 架构

```
                    ┌─────────────────────────────────────┐
                    │  gbkn API（Go-Zero）                 │
                    │  /api/gbkn/v1/*        … 平台        │
                    │  /api/data-semantic/v1/* … 语义服务  │
                    └──────────────┬──────────────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          ▼                        ▼                        ▼
   ┌─────────────┐         ┌──────────────┐         ┌─────────────┐
   │   MySQL     │         │    Redis     │         │   Kafka     │
   └─────────────┘         └──────────────┘         └──────┬──────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │ gbkn consumer   │
                                                └────────┬────────┘
                                                         ▼
                                                ┌─────────────────┐
                                                │ AI / 外部服务    │
                                                └─────────────────┘
```

## 技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| 语言 | Go | 1.25+（见 `go.mod`） |
| 框架 | go-zero | v1.10+ |
| 数据库 | MySQL / MariaDB | 迁移脚本在 `migrations/` |
| 缓存 | Redis | 可选，见 `api/etc/api.yaml` |
| 消息 | Kafka | API + `consumer/` |
| 模块路径 | `github.com/kweaver-dip/gbkn` | — |

### 核心依赖

- `github.com/zeromicro/go-zero` — 微服务框架  
- `github.com/IBM/sarama` — Kafka 客户端  
- `github.com/jinguoxing/idrm-go-base` — 错误码与通用工具  
- `github.com/stretchr/testify` — 测试  
- `github.com/google/uuid` — ID  

## 项目结构

```
gbkn/
├── api/                         # HTTP API（当前所有路由组）
│   ├── doc/                     # goctl .api 定义（模块化 import）
│   │   ├── api.api              # 根服务 + 健康检查
│   │   ├── base.api
│   │   └── data_semantic/       # data-semantic 模块
│   ├── etc/                     # api.yaml
│   └── internal/
│       ├── handler/
│       ├── logic/
│       ├── middleware/
│       └── types/
├── consumer/                    # Kafka 消费者进程
├── internal/pkg/                # 共享客户端（AI、Hydra、Agent 等）
├── model/                       # 数据访问 / SQL 模型
├── migrations/                  # 数据库迁移（如 mariadb、dm8）
├── deploy/                      # Docker、K8s、Helm
├── helm/data-semantic/        # 当前发布用 Helm Chart
├── Makefile
└── go.mod
```

## 快速开始

### 前置要求

- Go 1.25+  
- MySQL（或兼容库）— 见 `migrations/`  
- Redis（可选）  
- Kafka — 完整语义流程需要  
- Docker（可选）— 见 `deploy/docker/`  

### 安装

```bash
git clone https://github.com/kweaver-dip/gbkn.git
cd gbkn
go mod download
```

### 配置

编辑 `api/etc/api.yaml`。实际结构为嵌套的 `DB.Default`、`Auth`、`Kafka`、`AIService` 等，请按环境修改库名、Broker、密钥与下游地址。

### 运行

```bash
go run api/api.go
# 或
make run
```

默认监听地址见 `api/etc/api.yaml` 中的 `Host` / `Port`（一般为 `http://localhost:8888`）。

### Consumer（可选）

需要异步处理时运行 Kafka 消费者（见 `consumer/main.go` 与 `consumer/etc/consumer.yaml`）。

## API 文档

### 基础 URL

| 区域 | 前缀 | 鉴权 |
|------|------|------|
| 健康检查 | `/api/gbkn/v1` | 公开（`GET /health`） |
| data-semantic | `/api/data-semantic/v1` | JWT（`JWTAuth` 中间件） |

### 认证

data-semantic 接口需要：

```http
Authorization: Bearer <jwt-token>
```

### data-semantic 接口

完整地址为 `http://localhost:8888` + 前缀 + 路径（`{id}` 为表单视图 UUID）。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/:id/status` | 查询理解状态 |
| POST | `/:id/generate` | 一键生成理解数据 |
| GET | `/:id/fields` | 查询字段语义数据 |
| PUT | `/:id/semantic-info` | 保存库表语义信息 |
| GET | `/:id/business-objects` | 查询业务对象 |
| PUT | `/:id/business-objects` | 保存业务对象及属性 |
| PUT | `/:id/business-objects/attributes/move` | 调整属性归属 |
| POST | `/:id/business-objects/regenerate` | 重新识别业务对象 |
| POST | `/:id/submit` | 提交确认 |
| DELETE | `/:id/business-objects` | 删除识别结果 |
| POST | `/batch-object-match` | 批量匹配业务对象 |

### 理解状态（form_view）

| 值 | 含义（对应常量） | 说明 |
|----|------------------|------|
| 0 | 未理解 | 初始 |
| 1 | 理解中 | 处理中 |
| 2 | 待确认 | 待人审 |
| 3 | 已完成 | 已确认 |
| 4 | 已发布 | 已发布 |
| 5 | 理解失败 | 失败 |

权威定义：`model/form_view/vars.go`。

### 示例

```bash
curl -X POST "http://localhost:8888/api/data-semantic/v1/{id}/generate" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### Swagger

- 规范文件：[api/doc/swagger/swagger.json](api/doc/swagger/swagger.json)  
- 可导入 [Swagger UI](https://petstore.swagger.io/) 或 IDE。

修改 `.api` 后重新生成：

```bash
make swagger
```

## 开发

```bash
make api       # 根据 api/doc/api.api 生成代码
make swagger   # 更新 api/doc/swagger/
make gen       # api + swagger
make test
make fmt
make lint
make build     # 输出 bin/data-semantic（由 Makefile 中 PROJECT_NAME 决定）
```

## 部署

```bash
make docker-build
make docker-run
make k8s-deploy-dev
make k8s-deploy-prod
```

Helm：`helm/data-semantic/`。原生清单：`deploy/k8s/`。

## 在 GBKN 中扩展新服务

1. 新增 `api/doc/<服务名>/<服务名>.api` 并在 `api/doc/api.api` 中 `import`。  
2. 使用独立 `@server` 配置前缀（例如 `/api/<服务名>/v1`）及所需中间件。  
3. 在 `api/internal/` 下实现 handler、logic、types。  
4. 执行 `make api` 注册路由。  
5. 在本 README 的「本仓库中的服务」表中补充说明；如有独立消费者或二进制，再增加对应目录/构建目标。

## 规范驱动开发

仓库支持 **SDD**（`.specify/`、`specs/`）。详见 [.specify/memory/constitution.md](.specify/memory/constitution.md) 与编辑器中的 Spec Kit 命令说明。

## 编码规范

分层：**HTTP → Handler → Logic → Model → 数据库**。Handler 保持轻薄，业务在 Logic，访问数据库在 `model/`。命名与现有代码保持一致（`snake_case` 文件名等）。

## 文档

- [README.md](README.md) — 英文版  
- [specs/](specs/) — 功能规格（如有）  
- [.specify/memory/constitution.md](.specify/memory/constitution.md) — 项目宪法  

## 许可证

MIT（若仓库根目录尚无 `LICENSE` 文件，可自行补充）。

## 贡献

1. Fork 本仓库  
2. 创建功能分支（`git checkout -b feature/你的功能`）  
3. 提交清晰 commit  
4. 推送并发起 Pull Request  
