# KWeaver DIP Deploy

中文 | [English](README.md)

一键将 **KWeaver DIP** 部署到单节点 Kubernetes 集群。

这个仓库里的 `deploy` 目录以 `kweaver-dip` 为默认入口来组织：执行 `kweaver-dip install` 时，会自动检查并补齐 `kweaver-core`、`isf`、Kubernetes 以及依赖数据服务。

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](../LICENSE.txt)

## 🚀 Quick Start

### OpenClaw 要求

DIP Studio 需要安装并运行 OpenClaw：

1. 先部署 [OpenClaw](https://openclaw.ai)。支持的版本是 `v2026.3.11`。你也可以参考 [studio/README.md](../studio/README.md) 中的准备说明。
2. 启动 OpenClaw Gateway。
3. 从 `openclaw.json` 复制 `gateway.auth.token`，然后运行 `openclaw gateway status` 并记录网关绑定地址和端口。
4. 确保运行 `deploy.sh` 的机器可以访问 OpenClaw 配置文件和工作空间目录。如果要预配置，请在 `deploy/conf/config.yaml` 或你的自定义配置文件中设置 `dipStudio.openClaw.configHostPath` 和 `dipStudio.openClaw.workspaceHostPath`。
5. 使用 lan 模式启动 OpenClaw：`openclaw gateway --bind lan`，监听 0.0.0.0:18789

### 主机前置条件

安装命令需要以 `root` 用户执行，或通过 `sudo` 执行。

```bash
# 1. 关闭防火墙
systemctl stop firewalld && systemctl disable firewalld

# 2. 关闭 Swap
swapoff -a && sed -i '/ swap / s/^/#/' /etc/fstab

# 3. 调整 SELinux（脚本可处理，但建议预先设为宽松）
setenforce 0

# 4. 安装 containerd.io
dnf install containerd.io
```

### 安装 KWeaver DIP

```bash
# 1. 克隆仓库
git clone https://github.com/kweaver-ai/kweaver-dip.git
cd kweaver-dip/deploy

# 2. （可选）自定义访问端口
# 默认情况下，ingress-nginx 使用 80/443 端口。如需使用其他端口（例如 8080/8443）：
export INGRESS_NGINX_HTTP_PORT=8080
export INGRESS_NGINX_HTTPS_PORT=8443

# 3. 安装 KWeaver DIP
bash ./deploy.sh kweaver-dip install

# 4. 安装 OpenClaw DIP 插件
openclaw plugins install ./openclaw-extensions/dip
```

### 授权

部署完成后，授权 OpenClaw 与 DIP Sutdio 进行链接：

1. 执行 `openclaw devices list`，找到如下的待授权设备：

```bash
Pending (1)
┌──────────────────────────────────────┬──────────────────────────────────────────────────┬──────────┬───────────────┬──────────┬────────┐
│ Request                              │ Device                                           │ Role     │ IP            │ Age      │ Flags  │
├──────────────────────────────────────┼──────────────────────────────────────────────────┼──────────┼───────────────┼──────────┼────────┤
│ 3ef1700e-cc91-4978-a980-4fb783925028 │ cc8d2143cf8fcd04161ade9e5161006c410a0bee65f835e2 │ operator │ 192.169.0.104 │ just now │        │
│                                      │ 629792aa584bb119                                 │          │               │          │        │
└──────────────────────────────────────┴──────────────────────────────────────────────────┴──────────┴───────────────┴──────────┴────────┘
```

2. 执行`openclaw devices approve <Request>` 进行授权。

当提示：

```bash
Approved cc8d2143cf8fcd04161ade9e5161006c410a0bee65f835e2629792aa584bb119 (3ef1700e-cc91-4978-a980-4fb783925028)
```
表示授权成功。


3. 授权完成后，可访问：

- `https://<节点IP>/dip-hub`：DIP Hub

默认账号：`admin`
初始密码：`eisoo.com`

## 📋 Prerequisites

### 系统要求

| 项目 | 最低配置 | 推荐配置 |
| --- | --- | --- |
| OS | CentOS 8+, OpenEuler 23+ | CentOS 8+ |
| CPU | 24 核 | 32 核 |
| 内存 | 48 GB | 64 GB |
| 磁盘 | 200 GB | 500 GB |

### 网络要求

部署脚本需要访问以下域名：

| 域名 | 用途 |
| --- | --- |
| `mirrors.aliyun.com` | RPM 软件包源 |
| `mirrors.tuna.tsinghua.edu.cn` | `containerd.io` RPM 源 |
| `registry.aliyuncs.com` | Kubernetes 组件镜像 |
| `swr.cn-east-3.myhuaweicloud.com` | KWeaver 应用镜像仓库 |
| `repo.huaweicloud.com` | Helm 二进制下载 |
| `kweaver-ai.github.io` | KWeaver Helm Chart 仓库 |

## 📦 部署模型

`kweaver-dip` 是这个 `deploy` 目录里的默认产品入口，安装链路如下：

1. 安装或补齐单节点 Kubernetes、local-path storage、ingress-nginx。
2. 安装或补齐数据服务：MariaDB、Redis、Kafka、ZooKeeper、OpenSearch。
3. 检查 `isf` 和 `kweaver-core` 是否已就绪，缺失时自动安装。
4. 部署 KWeaver DIP 应用层 chart。


补充说明：

- `kweaver-core` 仍可单独安装，适合只部署 Core 能力的场景。
- `isf` 也可单独安装，适合先铺底座再装应用的场景。
- 当前脚本自动补齐的数据服务中 **不包含 MongoDB**；如果业务需要 MongoDB，请在配置文件中手动填写外部连接信息。

## 🔧 Usage

### 推荐命令

```bash
# 安装 KWeaver DIP 当前最新版本
./deploy.sh kweaver-dip install

# 安装指定版本
./deploy.sh kweaver-dip install --version=0.5.0

# 查看 DIP 状态
./deploy.sh kweaver-dip status

# 卸载 DIP 应用层
./deploy.sh kweaver-dip uninstall

```

### 依赖层与补充命令

```bash
# 单独安装 Core
./deploy.sh kweaver-core install

# 单独安装 ISF
./deploy.sh isf install

```

## ⚙️ Configuration

默认运行时配置文件路径：

```text
~/.kweaver-ai/config.yaml
```

首次执行 `kweaver-dip install` 时，如果配置文件不存在，脚本会自动生成，并写入 `accessAddress`。你也可以先手动生成再修改。

常用配置示例：

```yaml
namespace: kweaver
env:
  language: en_US.UTF-8
  timezone: Asia/Shanghai

image:
  registry: swr.cn-east-3.myhuaweicloud.com/kweaver-ai

accessAddress:
  host: 10.4.175.152
  port: 443
  scheme: https
  path: /

depServices:
  rds:
    source_type: internal
    host: mariadb.resource.svc.cluster.local
    port: 3306
    user: kweaver
    password: ""
    database: kweaver
  redis:
    sourceType: internal
  mq:
    mqType: kafka
    mqHost: kafka.resource.svc.cluster.local
  opensearch:
    host: opensearch-cluster-master.resource.svc.cluster.local
    protocol: https
    port: 9200
  # 其他服务配置...
```

## ✅ 验证部署

```bash
# 集群与 Pod 状态
kubectl get nodes
kubectl get pods -A

# DIP 状态
./deploy.sh kweaver-dip status

# 依赖层状态
./deploy.sh kweaver-core status
./deploy.sh isf status
```

## 📁 Project Structure

```text
deploy/
├── deploy.sh                 # 主入口脚本
├── conf/                     # 内置配置与静态清单
├── release-manifests/        # 按版本组织的发布物料
├── scripts/
│   ├── lib/                  # 公共函数
│   ├── services/             # 各产品与依赖服务安装脚本
│   └── sql/                  # 按版本组织的 SQL 初始化脚本
└── .tmp/charts/              # download 命令生成的本地 chart 缓存
```

## 🗑️ Uninstall

`kweaver-dip uninstall` 只卸载 DIP 应用层，不会自动删除 `kweaver-core`、`isf` 和基础设施。

```bash
# 1. 卸载 DIP 应用层，也可以直接执行步骤 3 全部重置
./deploy.sh kweaver-dip uninstall

# 2. 如不再需要 Core / ISF，可继续卸载
./deploy.sh kweaver-core uninstall
./deploy.sh isf uninstall

# 3. 最后重置基础设施
./deploy.sh k8s reset
```

## 🔍 Troubleshooting

### CoreDNS 不就绪

```bash
# 检查防火墙是否关闭
systemctl status firewalld

# pod内到外面的网络不通
检查主机所指向的 dns server是否启用tcp 53，如未启用可以执行
kubectl -n kube-system edit core-dns 
把 prefer_udp 添加到 forward . /etc/resolv.conf { 下面，再重启coredns 的pod
```

### Pod 拉取镜像失败

```bash
# 检查网络连通性
curl -I https://swr.cn-east-3.myhuaweicloud.com

# 检查 containerd 配置
cat /etc/containerd/config.toml
```

### 访问地址不正确

如果安装完成后 `/deploy` 或 `/studio` 无法访问，先检查运行时配置里的 `accessAddress`：

```bash
grep -A4 '^accessAddress:' ~/.kweaver-ai/config.yaml
```

必要时重新编辑配置后重装，或显式指定 `--config` 使用另一份配置。

### Kubernetes apt 源 404（Ubuntu/Debian）

如果 `apt update` 报错，提示旧的 `packages.cloud.google.com` 仓库 404：

```text
Err:7 https://packages.cloud.google.com/apt kubernetes-xenial Release
  404  Not Found
```

旧版 Google 托管 apt 源已废弃，需要迁移到 `pkgs.k8s.io`：

```bash
sudo apt-mark unhold kubeadm kubelet kubectl || true
sudo apt remove -y kubeadm kubelet kubectl
sudo rm -f /etc/apt/sources.list.d/kubernetes.list
sudo rm -f /etc/apt/keyrings/kubernetes-apt-keyring.gpg
sudo mkdir -p /etc/apt/keyrings

curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key \
  | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' \
  | sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt update
sudo apt install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

### 查看组件日志

```bash
kubectl logs -n <namespace> <pod-name>
```

## 📄 License

[Apache License 2.0](../LICENSE)
