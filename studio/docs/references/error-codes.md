# DIP Studio 错误码规范

## 目标

本规范用于统一 DIP Studio 对外返回的错误响应格式、错误码命名方式。

目标如下：

- 为前端提供稳定、可编程判断的 `code`
- 为排障保留上游错误细节

## 响应结构

所有错误响应统一使用 `ErrorResponse`：

```json
{
  "code": "DipStudio.SkillBadLayout",
  "description": "SKILL.md is missing required front matter metadata",
  "solution": "补充合法的 front matter，并确保包含 name 字段",
  "detail": {
    "upstream": {
      "service": "openclaw",
      "operation": "skills.install",
      "httpStatus": 400,
      "code": "BAD_LAYOUT"
    }
  },
  "link": "https://example.internal/docs/errors#DipStudio.SkillBadLayout"
}
```

字段约束如下：

- `code`：Studio 对外稳定业务错误码，供前端和调用方判断
- `description`：可直接展示给用户或记录日志的人类可读说明
- `solution`：可选，建议调用方如何修复
- `detail`：可选，承载排障细节，不作为前端主判断依据
- `link`：可选，指向帮助文档

其中：

- 前端逻辑必须优先依赖 `code`，不得依赖 `description`
- `detail.upstream.code` 仅用于排障，不应作为前端稳定契约

## 分层模型

错误语义拆分为三层：

1. HTTP 状态码：表达传输层和资源操作结果
2. Studio 业务错误码 `code`：表达稳定业务语义
3. 上游原始错误：放入 `detail.upstream`

示例：

- HTTP `400` 表示请求非法
- `code: "DipStudio.SkillBadLayout"` 表示技能包布局不合法
- `detail.upstream.code: "BAD_LAYOUT"` 表示该错误来源于 OpenClaw 插件原始错误码

## 命名规则

### 基本格式

错误码命名统一采用大驼峰，并按服务名前缀组织：

`<ServiceName>.<ErrorCode>`

示例：

- `DipStudio.InvalidParameter`
- `DipStudio.SkillBadLayout`
- `DipStudio.SkillAlreadyExists`
- `DipStudio.UpstreamTimeout`

### 域前缀

`ServiceName` 表示错误所属服务，`ErrorCode` 表示该服务内的稳定业务错误码。

当前约定如下：

- Studio 对外接口统一使用 `DipStudio`
- 上游原始错误码不直接作为 Studio 公共错误码
- 若后续需要暴露其他服务自己的稳定错误码，应保持同样格式，例如 `KWeaver.ResourceNotFound`

说明：

- `ErrorCode` 必须使用大驼峰
- `ErrorCode` 应表达稳定语义，不应直接绑定某次实现细节
- 对外公开码统一由 Studio 定义，不直接暴露上游 `BAD_LAYOUT`、`CONFLICT` 等原始码

## 状态码使用规则

### 4xx

客户端请求可修复的错误应返回 4xx：

- `400`：参数非法、请求体格式错误、业务校验失败
- `401`：未认证、令牌无效
- `403`：已认证但无权限
- `404`：资源不存在
- `409`：资源冲突
- `413`：请求体过大

### 5xx

服务端或上游不可用类错误应返回 5xx：

- `500`：Studio 内部未预期错误
- `502`：上游服务返回异常、协议错误、不可解析响应、连接失败
- `504`：上游调用超时

规则如下：

- 上游明确返回业务错误时，Studio 应尽量透传对应 4xx/409，而不是统一包装为 `502`
- 仅当 Studio 无法确认错误属于客户端问题时，才回退为 `502` 或 `500`

## 通用公共错误码

以下错误码为全局稳定错误码：

| HTTP 状态 | 错误码 | 含义 |
| -- | -- | -- |
| 400 | `DipStudio.InvalidParameter` | 参数非法、缺失或格式不符合要求 |
| 401 | `DipStudio.Unauthorized` | 未认证或认证失败 |
| 403 | `DipStudio.Forbidden` | 已认证但无权限执行 |
| 404 | `DipStudio.NotFound` | 目标资源不存在 |
| 409 | `DipStudio.Conflict` | 资源状态冲突 |
| 413 | `DipStudio.PayloadTooLarge` | 请求体超过限制 |
| 500 | `DipStudio.InternalServerError` | Studio 内部异常 |
| 502 | `DipStudio.UpstreamServiceError` | 上游服务异常或返回非预期错误 |
| 504 | `DipStudio.UpstreamTimeout` | 上游请求超时 |

说明：

- 不建议继续向前端暴露 `HTTP_502`、`HTTP_500` 作为主业务码
- 允许在极少数历史兼容场景中保留旧值，但新接口和新映射必须使用 `ServiceName.ErrorCode`

## 上游错误映射规则

当错误来自 OpenClaw Gateway 或其插件时，Studio 应按以下顺序处理：

1. 优先解析上游响应中的 `code`、`error`、`message`
2. 若上游属于已知业务错误，则映射为稳定 Studio 业务码
3. 若上游仅返回 HTTP 状态，但无明确业务码，则按状态码映射为通用公共码
4. 若发生连接失败、DNS、TLS、超时、响应不可解析，则使用 `DipStudio.Upstream*` 系列错误码

推荐在 `detail.upstream` 中保留以下字段：

- `service`
- `operation`
- `httpStatus`
- `code`
- `message`

## 技能安装错误码

`POST /api/dip-studio/v1/skills/install` 推荐使用如下错误码。

| 上游 HTTP | 上游 code | Studio HTTP | Studio code | 说明 |
| -- | -- | -- | -- | -- |
| 400 | `BAD_LAYOUT` | 400 | `DipStudio.SkillBadLayout` | 技能包目录结构不合法 |
| 400 | `MISSING_SKILL_MD` | 400 | `DipStudio.SkillMissingSkillMd` | 缺少 `SKILL.md` |
| 400 | `INVALID_ZIP` | 400 | `DipStudio.SkillInvalidPackage` | 上传包不是合法 ZIP 或解压失败 |
| 400 | `INVALID_NAME` | 400 | `DipStudio.SkillInvalidName` | 技能名称不合法 |
| 400 | `BAD_FRONT_MATTER` | 400 | `DipStudio.SkillBadFrontMatter` | `SKILL.md` front matter 非法 |
| 409 | `CONFLICT` | 409 | `DipStudio.SkillAlreadyExists` | 技能已存在且未允许覆盖 |
| 413 | `TOO_LARGE` | 413 | `DipStudio.SkillPackageTooLarge` | 上传包超出限制 |
| 401 | 任意 | 401 | `DipStudio.UpstreamUnauthorized` | 调用网关时认证失败 |
| 403 | 任意 | 403 | `DipStudio.UpstreamForbidden` | 网关拒绝当前调用 |
| 5xx | 任意 | 502 | `DipStudio.UpstreamServiceError` | 网关或插件内部错误 |
| 无响应 | 超时 | 504 | `DipStudio.UpstreamTimeout` | 上游请求超时 |
| 无响应 | 连接失败 | 502 | `DipStudio.UpstreamUnavailable` | 网络连接失败 |
| 非 JSON | 任意 | 502 | `DipStudio.UpstreamBadResponse` | 上游返回体无法按约定解析 |

补充规则如下：

- 对已知上游 `400/409/413`，Studio 必须优先返回明确领域错误码
- 未识别的上游 `400` 可先落到 `DipStudio.InvalidParameter`，同时保留 `detail.upstream.code`
- 未识别的上游 `4xx`，若语义不明确，可保守映射为同 HTTP 状态下的通用公共码

## 其他接口映射原则

除技能安装外，其他接口也遵循同样原则：

- 路由自身参数校验失败：直接返回 Studio 公共错误码
- 业务层校验失败：返回对应领域错误码
- 上游可确认的业务错误：映射为同语义领域错误码
- 上游不可确认错误：统一进入 `DipStudio.Upstream*` 系列错误码

示例：

- 数字员工不存在：`404 + DipStudio.DigitalHumanNotFound`
- 会话 key 非法：`400 + DipStudio.InvalidParameter`
- OpenClaw WebSocket/RPC 调用失败：`502 + DipStudio.UpstreamServiceError`

## 兼容性要求

为避免对现有调用方造成破坏，执行以下兼容策略：

- 保留 `code`、`description` 两个字段为必填
- 新增 `detail`、`solution`、`link` 时必须保持可选
- 历史上已暴露给前端的旧码可以在过渡期兼容
- 新增领域码时，应在前端先支持 `ServiceName.ErrorCode` 新格式，再逐步清理旧的 `HTTP_<status>` 兜底判断

## 禁止事项

- 不得将所有上游错误统一映射为 `HTTP_502`
- 不得让前端依赖 `description` 做分支判断
- 不得直接将上游原始错误码当作 Studio 稳定公共码长期暴露
- 不得在没有排障价值的情况下泄露敏感上游配置或 token
