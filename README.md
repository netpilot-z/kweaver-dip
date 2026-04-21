<p align="center">
  <img alt="KWeaver DIP" src="./assets/logo/kweaver-dip.png" width="320" />
</p>

[中文](./README.zh.md) | English

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

# KWeaver DIP

KWeaver DIP is an AI-native platform for developing and managing digital employees. Centered on business knowledge networks, it builds an application stack for digital employees that is understandable, executable, and governable.

- The platform builds digital employee capabilities on [KWeaver Core](https://github.com/kweaver-ai/kweaver-core) and [OpenClaw](https://github.com/openclaw/openclaw).
- 🌐 [Live Demo](https://dip-poc.aishu.cn/studio/agent/development/my-agent-list): Try KWeaver DIP online (username: `kweaver`, password: `111111`). This environment includes some built-in digital employees for quick exploration.

## Install, Configure, and Use KWeaver DIP

***Notes***

1. KWeaver DIP provides fast installation commands to deploy the services required by KWeaver Core and KWeaver DIP. For the complete installation workflow and resource configuration details, see [deploy/README.zh.md](deploy/README.zh.md).

### Install OpenClaw

KWeaver DIP must be used with OpenClaw. OpenClaw supports two installation approaches:

- Option 1: Install OpenClaw yourself based on the [OpenClaw](https://github.com/openclaw/openclaw) project and choose a compatible version.
- Option 2: Use KWeaver DIP’s installation command to quickly install the bundled OpenClaw version.

#### Option 1: Install OpenClaw yourself

1. KWeaver DIP supports OpenClaw `v2026.3.11`. We recommend using the tested versions from `v2026.3.11` to `v2026.3.24`. OpenClaw iterates quickly; other versions may have compatibility issues. You can install it from `https://openclaw.ai` or GitHub at `https://github.com/openclaw/openclaw`.
2. After installation, run `openclaw gateway onboard` to initialize OpenClaw.
3. Set `gateway.bind` in `openclaw.json` to `"lan"`. Keep the value of `gateway.auth.token`, which is required later when configuring the OpenClaw connection in KWeaver DIP.
4. Run `openclaw gateway restart` to restart the OpenClaw gateway.
5. Run `openclaw gateway status` and record the gateway listen address, which is usually `ws://0.0.0.0:18789`.
6. Make sure the machine running `deploy.sh` can access the OpenClaw config file and workspace directory. Edit `deploy/release-manifests/<version>/kweaver-dip.yaml`:

 - `dip-studio.values.studio.envFileHostPath`: host path of the Studio ENV configuration file
 - `dip-studio.values.studio.openClawHostPath`: host path of the `.openclaw/` root directory
 - `dip-studio.values.studio.useExternalOpenClaw`: whether to use a self-deployed OpenClaw instance

#### Option 2: Use KWeaver DIP’s bundled OpenClaw

1. Run the KWeaver DIP installation and deployment command below first.
2. After KWeaver DIP is installed successfully, proceed to [Initialize OpenClaw](#kweaver-dip-onboard).

### Install KWeaver DIP

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
# a) For stability, we recommend installing the latest released version:
sudo ./deploy.sh kweaver-dip install --version=0.5.0

# b) To try the latest features, you can also install the main branch:
sudo ./deploy.sh kweaver-dip install

# 3. Install Kweaver-SDK
# Skip this step if you install OpenClaw via Option 2
npm install -g @kweaver-ai/kweaver-sdk

# 4. Install OpenClaw DIP extensions
# Skip this step if you install OpenClaw via Option 2
openclaw plugins install ./openclaw-extensions/dip
```

### Option 2: Initialize KWeaver DIP OpenClaw
<a id="kweaver-dip-onboard"></a>

If you choose to use KWeaver DIP’s bundled OpenClaw, configure OpenClaw after deployment:

- Run `kubectl get pods -nkweaver | grep dip-studio` on the host and copy the POD ID.
- Run `kubectl exec -it <POD ID> -nkweaver -- /bin/bash` on the host to enter the container.
- Run `openclaw onboard` inside the container to initialize OpenClaw.

### Configure OpenClaw in KWeaver DIP

Sign in to KWeaver DIP Studio with the `admin` account first, then follow the UI instructions to finish the OpenClaw configuration.

**Note**:

- If you deploy OpenClaw on the host yourself, use `ws://<host-ip>:<port>` as the connection address.
- If you use the OpenClaw bundled with KWeaver DIP, use `ws://127.0.0.1:<port>` as the connection address.

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

---

#### Initialize configuration and use KWeaver DIP

After deployment, sign in to KWeaver DIP:

- `https://<node-ip>/dip-hub`

Default username: `admin`  
Initial password: `eisoo.com`

Initialization: Use `admin` to complete the initial system configuration; other accounts can use the system features normally only after this is done. See [Admin Quick Start](docs/Onlin_help/zh/Quick%20Start/Admin%20Quick%20Start/index.md).

## Community Reading Path

1. Read this file for an overall view of the project’s value, goals, and scope of capabilities.
2. Open each business module directory and read its `README.md` to learn what each module does.

## 💬 Community

<div align="center">
<img src="./docs/qrcode.png" alt="KWeaver community QR code" width="30%"/>

Scan to join the KWeaver community group
</div>

## Support & Contact

- **Contributing**: [Contributing Guide](rules/CONTRIBUTING.zh.md)
- **Issues**: [GitHub Issues](https://github.com/kweaver-ai/kweaver/issues)
- **License**: [Apache License 2.0](LICENSE)
