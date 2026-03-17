# DIP 数字员工运营平台

本项目基于 TypeScript 

## 启动

1. 执行 `npm install` 安装依赖
2. 重命名 `.env.example` → `.env`，配置 OpenClaw 连接信息
3. 在 `assets` 目录下执行 OpenSSL 命令生成 Ed25519 PEM 私钥和 PEM 公钥
```bash
cd assets
openssl genpkey -algorithm ED25519 -out private.pem
openssl pkey -in private.pem -pubout -out public.pem
```
4. 执行 `npm run dev` 启动服务