<p align="center">
  <img alt="KWeaver DIP" src="./assets/logo/kweaver-dip.png" width="320" />
</p>

[中文](./README.zh.md) | English

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

# KWeaver DIP

KWeaver DIP is an AI-native platform for developing and managing digital employees. It builds an application stack for digital employees that is understandable, executable, and governable, centered on business knowledge networks.

The platform is an enterprise digital employee platform built on the **KWeaver Core** open-source project. You can build and use agents through decision agents on a business knowledge network, or build and use digital worker on top of **Openclaw**.

## Quick Links

- 🌐 [Live Demo](https://dip-poc.aishu.cn/studio/agent/development/my-agent-list) — Try KWeaver online (username: `kweaver`, password: `111111`)

## Quick Start

### OpenClaw

DIP Studio depends on OpenClaw. You can either deploy OpenClaw on your own host or use the OpenClaw instance bundled with KWeaver DIP.

#### Deploy OpenClaw yourself

1. KWeaver DIP supports OpenClaw `v2026.3.11`. You can install it from the official site at https://openclaw.ai or from GitHub at https://github.com/openclaw/openclaw.
2. After installation, run `openclaw gateway onboard` to initialize OpenClaw.
3. Update `gateway.bind` in `openclaw.json` to `"lan"`, and keep the value of `gateway.auth.token` for the later OpenClaw connection setup in KWeaver DIP.
4. Run `openclaw gateway restart` to restart the OpenClaw gateway.
5. Run `openclaw gateway status` and record the gateway listen address, which is usually `ws://0.0.0.0:18789`.
6. Make sure the machine running `deploy.sh` can access the OpenClaw config file and workspace directory. If you want to preconfigure them, set `dipStudio.openClaw.configHostPath` and `dipStudio.openClaw.workspaceHostPath` in `deploy/conf/config.yaml` or in your custom config file.

#### Use the OpenClaw bundled with KWeaver DIP

After installing and deploying KWeaver DIP, follow [Initialize KWeaver DIP OpenClaw](#initialize-kweaver-dip-openclaw).

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

# 2. Install KWeaver DIP
sudo ./deploy.sh kweaver-dip install

# 3. Install OpenClaw DIP extensions
openclaw plugins install ./openclaw-extensions/dip
```

After deployment, you can access:

- `https://<node-ip>/deploy`: deployment console
- `https://<node-ip>/studio`: KWeaver DIP Studio

Default username: `admin`
Initial password: `eisoo.com`

### Initialize KWeaver DIP OpenClaw

If you choose to use the OpenClaw bundled with KWeaver DIP, complete the following steps after deployment:

- Run `kubectl get pods -nkweaver | grep dip-studio` on the host and copy the POD ID.
- Run `kubectl exec -it <POD ID> -nkweaver -- /bin/bash` on the host to enter the container.
- Run `openclaw onboard` inside the container to initialize OpenClaw.

### Configure OpenClaw

Sign in to KWeaver DIP Studio with the `admin` account first, then follow the UI instructions to finish the OpenClaw configuration.

**Note**:

- If you deploy OpenClaw on the host yourself, use the host IP address as the connection address.
- If you use the OpenClaw bundled with KWeaver DIP, use `127.0.0.1` as the connection address.

#### Authorization

If you use the OpenClaw bundled with KWeaver DIP, you can skip authorization.

After deployment, authorize OpenClaw to connect with DIP Studio:

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

For full installation requirements, configuration details, parameter descriptions, and offline deployment options, see [deploy/README.md](deploy/README.md).

## Community Reading Path

1. Read this file for an overall view of the project’s value, goals, and scope of capabilities.
2. Open each business module directory and read its `README.md` to learn what each module does.

## 💬 Community

<div align="center">
<img src="./docs/qrcode.png" alt="KWeaver community QR code" width="30%"/>

Scan to join the KWeaver community group
</div>

## Support & Contact

- **Contributing**: [Contributing Guide](rules/CONTRIBUTING.md)
- **Issues**: [GitHub Issues](https://github.com/kweaver-ai/kweaver/issues)
- **License**: [Apache License 2.0](LICENSE)
