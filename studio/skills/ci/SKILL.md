---
name: ci
description: 本文档描述持续集成相关流程
---

# CI

## 流程

1. 构建镜像并推送到华为云，命令为：

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --provenance=false \
  --sbom=false \
  -f Dockerfile \
  -t swr.cn-east-3.myhuaweicloud.com/kweaver-ai/dip/dip-studio:<tag> \
  --push \
  .
```
说明:
  - <tag> 的命名规则为：0.5.0-<分支名>.<7 位随机16进制字符>，例如：0.5.0-main.c7182b3

2. 修改 @chart/Chart.yaml 中的 `version` 字段。格式为：<镜像 tag>-<日期>.<递增号>，例如：假设镜像 tag 为 `0.5.0-main.c7182b3`，当前日期为 2026 年 4 月 14 日，则 `version` 为：`0.5.0-main.c7182b3-20260414.1`
3. 修改 @chart/values.yaml 中的 `image.tag`，与镜像 tag 保持一致。
4. 构建 Helm Chart，命令为：
```
helm package chart
```