---
- name: docker-entrypoint
- description: OpenClaw + Studio 服务容器运行脚本
---

# OpenClaw 容器运行脚本

本脚本用于在 Docker 容器中同时启动 OpenClaw Gateway 以及 DIP Studio 服务。

## 执行要求

1. 服务启动时，首先检测 USE_EXTERNAL_OPENCLAW 变量：如果为 true，则不启动 OpenClaw Gateway，并且将 DIP Studio 服务作为主进程。
2. 如果为 false，则：
  - OpenClaw Gateway 服务必须为容器主进程，在 OpenClaw 服务异常时能够自动重启。
  - 首次启动 OpenClaw Gateway 服务时，由于尚未执行 OpenClaw 的初始化操作，因此缺少必要的 `openclaw.json` 配置，这会导致 OpenClaw Gateway 启动失败并不断重启容器。因此在启动 OpenClaw Gateway 时需要附带 `--allow-unconfigured` 参数。