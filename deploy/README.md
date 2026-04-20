# KWeaver DIP Deploy

[中文](README.zh.md) | English

One-click deployment of **KWeaver DIP** onto a single-node Kubernetes cluster.

This `deploy` directory is organized around `kweaver-dip` as the default product entrypoint. Running `kweaver-dip install` automatically checks and installs `kweaver-core`, `isf`, Kubernetes, and the required data services when they are missing.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](../LICENSE.txt)

## 🚀 Quick Start

### OpenClaw requirements

DIP Studio requires OpenClaw to be installed and running:

1. Deploy [OpenClaw](https://openclaw.ai) first. The supported version is `v2026.3.11`. You can also refer to the preparation notes in [studio/README.md](../studio/README.md).
2. Start OpenClaw Gateway.
3. Copy `gateway.auth.token` from `openclaw.json`, then run `openclaw gateway status` and record the gateway bind address and port.
4. Make sure the machine running `deploy.sh` can access the OpenClaw config file and workspace directory. If you want to preconfigure them, set `dipStudio.openClaw.configHostPath` and `dipStudio.openClaw.workspaceHostPath` in `deploy/conf/config.yaml` or in your custom config file.
5. Start OpenClaw in LAN mode: `openclaw gateway --bind lan`, listening on `0.0.0.0:18789`.

### Host prerequisites

Run install commands as `root` or through `sudo`.

```bash
# 1. Disable firewall
systemctl stop firewalld && systemctl disable firewalld

# 2. Disable swap
swapoff -a && sed -i '/ swap / s/^/#/' /etc/fstab

# 3. Set SELinux to permissive if needed
setenforce 0

# 4. Install containerd.io
dnf install containerd.io
```

```bash
# 1. Clone the repository
git clone https://github.com/kweaver-ai/kweaver-dip.git
cd kweaver-dip/deploy

# 2. (Optional) Customize access ports
# By default, ingress-nginx uses ports 80/443. To use custom ports (e.g., 8080/8443):
export INGRESS_NGINX_HTTP_PORT=8080
export INGRESS_NGINX_HTTPS_PORT=8443

# 3. Install KWeaver DIP
bash ./deploy.sh kweaver-dip install

# 4. Install OpenClaw DIP extensions
openclaw plugins install ./openclaw-extensions/dip
```

### Authorization

After deployment, authorize OpenClaw to link with DIP Studio:

1. Run `openclaw devices list` and find the pending device shown below:

```bash
Pending (1)
┌──────────────────────────────────────┬──────────────────────────────────────────────────┬──────────┬───────────────┬──────────┬────────┐
│ Request                              │ Device                                           │ Role     │ IP            │ Age      │ Flags  │
├──────────────────────────────────────┼──────────────────────────────────────────────────┼──────────┼───────────────┼──────────┼────────┤
│ 3ef1700e-cc91-4978-a980-4fb783925028 │ cc8d2143cf8fcd04161ade9e5161006c410a0bee65f835e2 │ operator │ 192.169.0.104 │ just now │        │
│                                      │ 629792aa584bb119                                 │          │               │          │        │
└──────────────────────────────────────┴──────────────────────────────────────────────────┴──────────┴───────────────┴──────────┴────────┘
```

2. Run `openclaw devices approve <Request>` to approve it.

When you see:

```bash
Approved cc8d2143cf8fcd04161ade9e5161006c410a0bee65f835e2629792aa584bb119 (3ef1700e-cc91-4978-a980-4fb783925028)
```

the authorization has succeeded.

3. After authorization, you can access:

- `https://<node-ip>/dip-hub`: DIP Hub

Default username: `admin`
Initial password: `eisoo.com`

## 📋 Prerequisites

### System requirements

| Item | Minimum | Recommended |
| --- | --- | --- |
| OS | CentOS 8+, RHEL 8 | CentOS 7 |
| CPU | 24 cores | 32 cores |
| Memory | 48 GB | 64 GB |
| Disk | 200 GB | 500 GB |

### Network requirements

The deployment scripts need access to these domains:

| Domain | Purpose |
| --- | --- |
| `mirrors.aliyun.com` | RPM package mirrors |
| `mirrors.tuna.tsinghua.edu.cn` | `containerd.io` RPM mirror |
| `registry.aliyuncs.com` | Kubernetes component images |
| `swr.cn-east-3.myhuaweicloud.com` | KWeaver application image registry |
| `repo.huaweicloud.com` | Helm binary download |
| `kweaver-ai.github.io` | KWeaver Helm chart repository |

## 📦 Deployment Model

`kweaver-dip` is the default product-level entrypoint in this repository. The install flow is:

1. Install or repair single-node Kubernetes, local-path storage, and ingress-nginx.
2. Install or repair data services: MariaDB, Redis, Kafka, ZooKeeper, and OpenSearch.
3. Check whether `isf` and `kweaver-core` are already present, and install them if they are missing.
4. Deploy the KWeaver DIP application charts.

The DIP application layer currently includes charts such as:

- `dip-frontend`
- `anyfabric-frontend`
- `data-catalog`
- `data-subject`
- `data-view`
- `data-semantic`
- `data-exploration-service`
- `sailor` / `sailor-agent` / `sailor-service`
- `task-center`

Notes:

- `kweaver-core` can still be installed on its own if you only want the Core capability set.
- `isf` can also be installed on its own if you want to prepare the base platform first.
- The current auto-installed data service set does **not** include MongoDB. If your environment needs MongoDB, configure it manually as an external dependency in the config file.

## 🔧 Usage

### Recommended commands

```bash
# Install KWeaver DIP (latest version)
./deploy.sh kweaver-dip install

# Install a specific version
./deploy.sh kweaver-dip install --version=0.5.0

# Show DIP status
./deploy.sh kweaver-dip status

# Uninstall the DIP application layer
./deploy.sh kweaver-dip uninstall
```

### Dependency-layer and supplemental commands

```bash
# Install Core only
./deploy.sh kweaver-core install

# Install ISF only
./deploy.sh isf install

# Install infrastructure and data services only
./deploy.sh infra install

```

## ⚙️ Configuration

Default runtime config path:

```text
~/.kweaver-ai/config.yaml
```

On the first `kweaver-dip install`, if the config file does not exist, the script can generate it automatically and write `accessAddress`. You can also generate it first and edit it before installation.

Common settings:

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
  # Other service configurations...
```

## ✅ Verify deployment

```bash
# Cluster and pod status
kubectl get nodes
kubectl get pods -A

# DIP status
./deploy.sh kweaver-dip status

# Dependency-layer status
./deploy.sh kweaver-core status
./deploy.sh isf status
```

## 📁 Project Structure

```text
deploy/
├── deploy.sh                 # Main entry script
├── conf/                     # Bundled config and static manifests
├── release-manifests/        # Versioned release bill of materials
├── scripts/
│   ├── lib/                  # Common helper functions
│   ├── services/             # Product and dependency install scripts
│   └── sql/                  # Versioned SQL initialization scripts
└── .tmp/charts/              # Local chart cache generated by download
```

## 🗑️ Uninstall

`kweaver-dip uninstall` removes only the DIP application layer. It does not automatically remove `kweaver-core`, `isf`, or infrastructure.

```bash
# 1. Remove the DIP application layer (or skip to step 3 for full reset)
./deploy.sh kweaver-dip uninstall

# 2. Remove Core / ISF if you no longer need them
./deploy.sh kweaver-core uninstall
./deploy.sh isf uninstall

# 3. Reset infrastructure last
./deploy.sh k8s reset
```

## 🔍 Troubleshooting

### CoreDNS is not ready

```bash
# Check whether firewall is disabled
systemctl status firewalld

# If pods cannot reach external network
# Check if the host's DNS server has TCP 53 enabled. If not, run:
kubectl -n kube-system edit core-dns
# Add 'prefer_udp' below 'forward . /etc/resolv.conf {', then restart CoreDNS pods
```

### Pods fail to pull images

```bash
# Check network connectivity
curl -I https://swr.cn-east-3.myhuaweicloud.com

# Check containerd config
cat /etc/containerd/config.toml
```

### Access URL is wrong

If `/deploy` or `/studio` is unreachable after installation, check `accessAddress` in the runtime config:

```bash
grep -A4 '^accessAddress:' ~/.kweaver-ai/config.yaml
```

Edit the config and reinstall if needed, or pass a different config file with `--config`.

### Kubernetes apt source 404 (Ubuntu/Debian)

If `apt update` fails with a 404 from the legacy `packages.cloud.google.com` repository:

```text
Err:7 https://packages.cloud.google.com/apt kubernetes-xenial Release
  404  Not Found
```

The old Google-hosted apt repository is deprecated. Migrate to `pkgs.k8s.io`:

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

### View component logs

```bash
kubectl logs -n <namespace> <pod-name>
```

## 📄 License

[Apache License 2.0](../LICENSE)
