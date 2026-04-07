# GBKN

**Global Business Knowledge Network** — a Go monorepo for services that turn enterprise data and semantics into structured **business knowledge** (objects, relationships, and governed meaning across systems).

[![Go Version](https://img.shields.io/badge/Go-1.25+-00ADD8?style=flat&logo=go)](https://golang.org)
[![Framework](https://img.shields.io/badge/Framework-Go--Zero-blue)](https://go-zero.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Overview

`gbkn` is the implementation workspace for the GBKN platform. Today it ships **one production-facing capability**: **data-semantic** (semantic understanding of schema / form-view data and AI-assisted business object identification). Additional services will be added here over time; new domains should follow the same layout (API modules under `api/doc/`, logic under `api/internal/logic/<domain>/`, shared clients under `internal/pkg/`).

### Services in this repository

| Service | Role | API prefix (current) |
|--------|------|----------------------|
| **Platform / health** | Liveness and future cross-cutting routes | `/api/gbkn/v1` |
| **data-semantic** | Table & field semantics, business objects, understanding workflow | `/api/data-semantic/v1` |

The HTTP process is a **single Go-Zero API binary** (`api/api.go`) that hosts multiple route groups. Kafka-backed work runs in **`consumer/`** (asynchronous AI / pipeline steps).

### data-semantic (current capability)

- **AI-assisted semantic analysis** of tables and fields  
- **Business object identification** with user edit and confirmation  
- **Versioning / re-generation** of understanding results  
- **Kafka** for asynchronous processing  
- **Stateful workflow** for understanding lifecycle (see model constants in `model/form_view/vars.go`)

## Architecture

```
                    ┌─────────────────────────────────────┐
                    │  gbkn API (Go-Zero)                 │
                    │  /api/gbkn/v1/*  …  platform        │
                    │  /api/data-semantic/v1/* … service  │
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
                                                │ AI / external   │
                                                │ services        │
                                                └─────────────────┘
```

## Technology stack

| Component | Technology | Notes |
|-----------|------------|--------|
| Language | Go | 1.25+ (`go.mod`) |
| Framework | go-zero | v1.10+ |
| Database | MySQL / MariaDB | Migrations under `migrations/` |
| Cache | Redis | Optional; see `api/etc/api.yaml` |
| Messaging | Kafka | API + `consumer/` |
| Module | `github.com/kweaver-dip/gbkn` | — |

### Key dependencies

- `github.com/zeromicro/go-zero` — service framework  
- `github.com/IBM/sarama` — Kafka client  
- `github.com/jinguoxing/idrm-go-base` — shared error / utilities  
- `github.com/stretchr/testify` — tests  
- `github.com/google/uuid` — identifiers  

## Project structure

```
gbkn/
├── api/                         # HTTP API (all current route groups)
│   ├── doc/                     # goctl .api specs (modular imports)
│   │   ├── api.api              # Root service + health
│   │   ├── base.api
│   │   └── data_semantic/       # data-semantic module
│   ├── etc/                     # api.yaml
│   └── internal/
│       ├── handler/             # Handlers per domain
│       ├── logic/               # Business logic per domain
│       ├── middleware/
│       └── types/
├── consumer/                    # Kafka consumer process
├── internal/pkg/                # Shared clients (AI, Hydra, agents, …)
├── model/                       # Data access / SQL models
├── migrations/                  # DB migrations (e.g. mariadb, dm8)
├── deploy/                      # Docker, K8s, Helm
├── helm/data-semantic/          # Helm chart for current rollout
├── Makefile
└── go.mod
```

## Getting started

### Prerequisites

- Go 1.25+  
- MySQL (or compatible) — see `migrations/`  
- Redis (optional)  
- Kafka — for full data-semantic flows  
- Docker (optional) — see `deploy/docker/`  

### Installation

```bash
git clone https://github.com/kweaver-dip/gbkn.git
cd gbkn
go mod download
```

### Configuration

Edit `api/etc/api.yaml`. The file uses nested `DB.Default`, `Auth`, `Kafka`, `AIService`, etc. Align values with your environment (database name, brokers, secrets, downstream URLs).

### Run

```bash
go run api/api.go
# or
make run
```

Default listen address: `http://localhost:8888` (see `Host` / `Port` in `api/etc/api.yaml`).

### Consumer (optional)

Run the Kafka consumer when you need asynchronous processing (see `consumer/main.go` and `consumer/etc/consumer.yaml`).

## API documentation

### Base URLs

| Area | Prefix | Auth |
|------|--------|------|
| Health | `/api/gbkn/v1` | Public (`GET /health`) |
| data-semantic | `/api/data-semantic/v1` | JWT (`JWTAuth` middleware) |

### Authentication

data-semantic routes expect:

```http
Authorization: Bearer <jwt-token>
```

### data-semantic endpoints

Full paths are `http://localhost:8888` + prefix + path (replace `{id}` with a form view UUID).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/:id/status` | Understanding status |
| POST | `/:id/generate` | Generate understanding |
| GET | `/:id/fields` | Field semantic data |
| PUT | `/:id/semantic-info` | Save semantic info |
| GET | `/:id/business-objects` | Business objects |
| PUT | `/:id/business-objects` | Save business objects |
| PUT | `/:id/business-objects/attributes/move` | Move attribute |
| POST | `/:id/business-objects/regenerate` | Regenerate objects |
| POST | `/:id/submit` | Submit / confirm |
| DELETE | `/:id/business-objects` | Delete results |
| POST | `/batch-object-match` | Batch object match |

### Understanding status (form view)

| Value | Constant (approx.) | Description |
|-------|-------------------|-------------|
| 0 | Not understanding | Initial |
| 1 | Understanding | In progress |
| 2 | Pending confirm | Awaiting user |
| 3 | Completed | Confirmed |
| 4 | Published | Published |
| 5 | Failed | Failed |

Source of truth: `model/form_view/vars.go`.

### Example

```bash
curl -X POST "http://localhost:8888/api/data-semantic/v1/{id}/generate" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### Swagger

- OpenAPI-style spec: [api/doc/swagger/swagger.json](api/doc/swagger/swagger.json)  
- Import into [Swagger UI](https://petstore.swagger.io/) or your IDE.

Regenerate after `.api` changes:

```bash
make swagger
```

## Development

```bash
make api       # goctl from api/doc/api.api
make swagger   # refresh swagger under api/doc/swagger/
make gen       # api + swagger
make test
make fmt
make lint
make build     # output: bin/data-semantic (see Makefile PROJECT_NAME)
```

## Deployment

```bash
make docker-build
make docker-run
make k8s-deploy-dev
make k8s-deploy-prod
```

Helm: `helm/data-semantic/`. Raw manifests: `deploy/k8s/`.

## Extending GBKN with a new service

1. Add `api/doc/<your_service>/<your_service>.api` and types; import it from `api/doc/api.api`.  
2. Add `@server` with a dedicated `prefix` (e.g. `/api/<your-service>/v1`) and middleware as needed.  
3. Implement `handler` / `logic` / `types` under `api/internal/`.  
4. Register routes via goctl (`make api`).  
5. Document the service in this README table and, if needed, add a separate consumer or binary.

## Spec-driven workflow

This repo can use **Spec-Driven Development** (`.specify/`, `specs/`). See [.specify/memory/constitution.md](.specify/memory/constitution.md) and the Spec Kit commands referenced in your editor setup.

## Coding standards

Layering: **HTTP → Handler → Logic → Model → DB**. Keep handlers thin, logic focused, and data access in `model/`. Match existing naming (`snake_case` files, idiomatic Go packages).

## Documentation

- [README.zh.md](README.zh.md) — Chinese version  
- [specs/](specs/) — feature specs (if present)  
- [.specify/memory/constitution.md](.specify/memory/constitution.md) — project constitution  

## License

MIT (add a `LICENSE` file at repo root if not present yet).

## Contributing

1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/your-feature`)  
3. Commit with clear messages  
4. Push and open a Pull Request  
