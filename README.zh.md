<p align="center">
  <img alt="KWeaver DIP" src="./assets/logo/kweaver-dip.png" width="320" />
</p>

[English](./README.md) | 中文

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

# KWeaver DIP

KWeaver DIP 是 AI 原生的数字员工开发与管理平台，围绕业务知识网络，构建可理解、可执行、可治理的数字员工应用体系。

- 该平台基于 [KWeaver Core](https://github.com/kweaver-ai/kweaver-core) 和 [OpenClaw](https://github.com/openclaw/openclaw) 构建的数字员工的能力。

- 🌐 [KWeaver DIP 的在线体验](https://dip-poc.aishu.cn/studio/agent/development/my-agent-list)：欢迎在线试用 KWeaver DIP（用户名：`kweaver`，密码：`111111`），该环境内置了一些数字员工，可以快速体验。

## 安装与配置使用 KWeaver DIP

***说明***

1. KWeaver DIP 提供快速安装命令，可安装 KWeaver Core 与 KWeaver DIP 的相关服务。KWeaver DIP 完整的安装流程和资源配置信息，请参考 [deploy/README.zh.md](deploy/README.zh.md)。

### 安装 OpenClaw

KWeaver DIP 需配合 OpenClaw 使用。OpenClaw 支持两种安装方式：

- 方式一：基于 [OpenClaw](https://github.com/openclaw/openclaw) 项目，自行选择 OpenClaw 版本下载安装。
- 方式二：基于 KWeaver DIP 的安装命令，快速安装内置 OpenClaw 版本。

#### 方式一：自行下载安装 OpenClaw

1. KWeaver DIP 支持 OpenClaw `v2026.3.11` 版本，推荐使用当前已测试验证的 `v2026.3.11` 至 `v2026.3.24` 版本。由于 OpenClaw 版本迭代较快，其他版本可能存在兼容性问题。您可以从官网 https://openclaw.ai 或 GitHub：https://github.com/openclaw/openclaw 进行安装。
2. 安装完成后，使用 `openclaw gateway onboard` 命令完成初始化。
3. 修改 `openclaw.json` 的 `gateway.bind` 字段值为 "lan"，同时请记住  `gateway.auth.token` 的值，后续需要填入 KWeaver DIP 的 OpenClaw 连接配置中。
4. 执行 `openclaw gateway restart` 重启 OpenClaw 网关。
5. 运行 `openclaw gateway status` 并记录网关监听地址，通常为：`ws://0.0.0.0:18789`。
6. 确保运行 `deploy.sh` 的机器可以访问 OpenClaw 配置文件和工作空间目录。编辑 `deploy/release-manifests/<version>/kweaver-dip.yaml`：
 - `dip-studio.values.studio.envFileHostPath`: Studio ENV 配置文件主机路径
 - `dip-studio.values.studio.openClawHostPath`: .openclaw/ 主目录主机路径
 - `dip-studio.values.studio.useExternalOpenClaw`: 是否使用自行部署的 OpenClaw

#### 方式二：基于 KWeaver DIP 的安装命令，快速安装内置 OpenClaw 版本

1. 先执行下面的 KWeaver DIP 安装部署命令。
2. 待KWeaver DIP 安装成功后，再进行 [初始化 OpenClaw](#kweaver-dip-onboard)。

### 安装 KWeaver DIP 

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

```bash
# 1. 克隆仓库
git clone https://github.com/kweaver-ai/kweaver-dip.git
cd kweaver-dip/deploy

# 2. 安装 KWeaver DIP
a、确保稳定，推荐安装最新的发布版本：
sudo ./deploy.sh kweaver-dip install --version=0.5.0

5、体验最新的功能，也可以安装主线版本：
sudo ./deploy.sh kweaver-dip install

# 3. 安装 Kweaver-SDK
# 如果您采用方式二安装 Openclaw 则跳过此步
npm install -g @kweaver-ai/kweaver-sdk

# 4. 安装 OpenClaw DIP 插件
# 如果您采用方式二安装 Openclaw 则跳过此步
openclaw plugins install ./openclaw-extensions/dip
```

### 方式二：初始化 KWeaver DIP OpenClaw
<a id="kweaver-dip-onboard"></a>

如果您选择使用 KWeaver DIP 自带的 OpenClaw，请在完成部署后按以下流程配置 OpenClaw：

  - 在主机执行 `kubectl get pods -nkweaver | grep dip-studio`，复制 POD ID。
  - 在主机执行 `kubectl exec -it <POD ID> -nkweaver -- /bin/bash` 进入容器。
  - 在容器内执行 `openclaw onboard` 初始化 OpenClaw。

### KWeaver DIP 配置 OpenClaw

请先使用 admin 账号登录 KWeaver DIP Studio，根据界面指引完成 OpenClaw 配置。

**注意**：

- 如果您选择在主机自行部署 OpenClaw，连接地址请填写：`ws://<主机 IP>:<端口>`。
- 如果您选择使用 KWeaver DIP OpenClaw，连接地址请填写：`ws://127.0.0.1:<端口>`。

#### 授权

（如果您采用方式二安装 Openclaw 则可以**跳过**授权）

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

---

#### 初始化配置并使用 KWeaver DIP
部署完成后，即可登入 KWeaver DIP：

- `https://<节点IP>/dip-hub`

默认账号：`admin`
初始密码：`eisoo.com`

初始化配置：使用 `admin` 对系统进行相关初始化配置，然后其他的账号才能正常使用系统的功能，具体参考 [管理员入门](docs/Onlin_help/zh/Quick%20Start/Admin%20Quick%20Start/index.md)

## 开源社区阅读路径

1. 先读本文件，从总体上了解项目价值、目标与能力范围。
2. 进入各业务模块目录，查看模块级 `README.md`了解各个模块的功能说明。

## 💬 交流社区

<div align="center">
<img src="./docs/qrcode.png" alt="KWeaver 交流群二维码" width="30%"/>

扫码加入 KWeaver 交流群
</div>

## 支持与联系

- **贡献指南**: [贡献指南](rules/CONTRIBUTING.zh.md)
- **问题反馈**: [GitHub Issues](https://github.com/kweaver-ai/kweaver/issues)
- **许可证**: [Apache License 2.0](LICENSE)
