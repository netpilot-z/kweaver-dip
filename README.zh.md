<p align="center">
  <img alt="KWeaver DIP" src="./assets/logo/kweaver-dip.png" width="320" />
</p>

[English](./README.md) | 中文

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

# KWeaver DIP

KWeaver DIP 是 AI 原生的数字员工开发与管理平台，围绕业务知识网络构建可理解、可执行、可治理的数字员工应用体系。

该平台基于 KWeaver Core 开源项目构建的企业级数字员工平台，该平台可以基于业务知识网络下决策智能体构建智能体进行使用，也可以基于 Openclaw 构建数字员工进行使用。

## 快速链接

- 🌐 [在线体验](https://dip-poc.aishu.cn/studio/agent/development/my-agent-list) — 在线试用 KWeaver（用户名：`kweaver`，密码：`111111`）

## 快速开始

### OpenClaw

DIP Studio 运行依赖 OpenClaw。您可以选择在主机上自行部署 OpenClaw，也可以使用 KWeaver DIP 自带的 OpenClaw。

#### 自行部署 OpenClaw

1. KWeaver DIP 支持 `v2026.3.11` 版本的 OpenClaw 。您可以从官网 https://openclaw.ai 或 GitHub：https://github.com/openclaw/openclaw 进行安装。
2. 安装完成后，使用 `openclaw gateway onboard` 命令完成初始化。
3. 修改 `openclaw.json` 的 `gateway.bind` 字段值为 "lan"，同时请记住  `gateway.auth.token` 的值，后续需要填入 KWeaver DIP 的 OpenClaw 连接配置中。
4. 执行 `openclaw gateway restart` 重启 OpenClaw 网关。
5. 运行 `openclaw gateway status` 并记录网关监听地址，通常为：`ws://0.0.0.0:18789`。
6. 确保运行 `deploy.sh` 的机器可以访问 OpenClaw 配置文件和工作空间目录。如果要预配置，请在 `deploy/conf/config.yaml` 或你的自定义配置文件中设置 `dipStudio.openClaw.configHostPath` 和 `dipStudio.openClaw.workspaceHostPath`。

#### 使用 KWeaver DIP OpenClaw

请在完成 KWeaver DIP 安装部署后[初始化 KWeaver DIP OpenClaw](#初始化 KWeaver DIP OpenClaw)。

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

```bash
# 1. 克隆仓库
git clone https://github.com/kweaver-ai/kweaver-dip.git
cd kweaver-dip/deploy

# 2. 安装 KWeaver DIP
sudo ./deploy.sh kweaver-dip install

# 3. 安装 OpenClaw DIP 插件
openclaw plugins install ./openclaw-extensions/dip
```

3. 部署完成后，可访问：

- `https://<节点IP>/deploy`：部署控制台
- `https://<节点IP>/studio`：KWeaver DIP Studio

默认账号：`admin`
初始密码：`eisoo.com`

### 初始化 KWeaver DIP OpenClaw

如果您选择使用 KWeaver DIP 自带的 OpenClaw，请在完成部署后按以下流程配置 OpenClaw：

  - 在主机执行 `kubectl get pods -nkweaver | grep dip-studio`，复制 POD ID。
  - 在主机执行 `kubectl exec -it <POD ID> -nkweaver -- /bin/bash` 进入容器。
  - 在容器内执行 `openclaw onboard` 初始化 OpenClaw。

### 配置 OpenClaw

请先使用 admin 账号登录 KWeaver DIP Studio，根据界面指引完成 OpenClaw 配置。

**注意**：

- 如果您选择在主机自行部署 OpenClaw，连接地址请填写主机 IP。
- 如果您选择使用 KWeaver DIP OpenClaw，连接地址请填写 `127.0.0.1`。

#### 授权

（如果您选择使用 KWeaver DIP 自带 OpenClaw 则可以**跳过**授权）

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

完整安装要求、配置项说明、参数说明和离线部署方式请参考 [deploy/README.zh.md](deploy/README.zh.md)。


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
