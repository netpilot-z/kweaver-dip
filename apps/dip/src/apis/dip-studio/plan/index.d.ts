/**
 * 计划任务（Plan / Cron）API 类型定义。
 * 与 `plan.schemas.yaml`、`plan.paths.yaml` 中的 OpenAPI 描述一致。
 */

/**
 * 计划任务调度定义（`CronSchedule`，见 `plan.schemas.yaml`）。
 */
export interface CronSchedule {
  /** 调度类型（可选，由服务端约定，如 every 周期执行 / at 指定时间执行） */
  kind?: 'every' | 'at'
  /** Cron 表达式（必填） */
  expr: string
  /** 时区（必填，如 `Asia/Shanghai`） */
  tz: string
}

/**
 * 计划任务运行状态（`CronJobState`，见 `plan.schemas.yaml`）。
 */
export interface CronJobState {
  /** 下次计划运行时间（毫秒时间戳） */
  nextRunAtMs?: number
  /** 上次运行时间（毫秒时间戳） */
  lastRunAtMs?: number
  /** 上次运行结果状态 'ok' | 'error' | 'skipped' */
  lastRunStatus?: 'ok' | 'error' | 'skipped'
  /** 最近一次状态摘要 */
  lastStatus?: string
  /** 上次运行耗时（毫秒） */
  lastDurationMs?: number
  /** 上次运行错误信息 */
  lastError?: string
  /** 连续失败次数（≥0） */
  consecutiveErrors?: number
  /** 上次是否已成功投递 */
  lastDelivered?: boolean
  /** 上次投递状态 */
  lastDeliveryStatus?: string
  /** 当前是否正在运行（毫秒时间戳，运行中时有值） */
  runningAtMs?: number
}

/**
 * 计划任务（`CronJob`，见 `plan.schemas.yaml`）。
 * 必填字段：`id`、`agentId`、`sessionKey`、`name`、`enabled`、`createdAtMs`、`updatedAtMs`、`schedule`。
 */
export interface CronJob {
  id: string
  /** 所属数字员工 / Agent ID */
  agentId: string
  /** 会话键，用于关联会话 */
  sessionKey: string
  name: string
  /** 是否启用 */
  enabled: boolean
  createdAtMs: number
  updatedAtMs: number
  schedule: CronSchedule
  /** 会话投递目标等（字符串，由服务端约定） */
  sessionTarget?: string
  /** 唤醒模式（由服务端约定） */
  wakeMode?: string
  /** 触发时附加负载（任意 JSON 对象） */
  payload?: Record<string, unknown>
  /** 投递配置（任意 JSON 对象） */
  delivery?: Record<string, unknown>
  state?: CronJobState
  /** 是否在执行一次后删除该计划 */
  deleteAfterRun?: boolean
}

/**
 * 列表与运行记录共用的分页元数据（对应 `CronJobListResponse` / `CronRunListResponse` 中的分页字段，见 `plan.schemas.yaml`）。
 */
type CronPagedMeta = {
  /** 总条数 */
  total: number
  /** 当前偏移量 */
  offset: number
  /** 本页条数上限 */
  limit: number
  /** 是否还有下一页 */
  hasMore: boolean
  /** 下一页偏移量；无下一页时为 `null` */
  nextOffset: number | null
}

/**
 * 计划任务列表响应（`CronJobListResponse`，见 `plan.schemas.yaml`）。
 * 对应接口：`GET /plans`、`GET /digital-human/{dh_id}/plans`。
 */
export type CronJobListResponse = CronPagedMeta & {
  jobs: CronJob[]
}

/**
 * 计划任务运行记录（`CronRunEntry`，见 `plan.schemas.yaml`）。
 * 必填字段：`ts`、`jobId`、`action`、`status`。
 */
export interface CronRunEntry {
  /** 记录时间戳（毫秒） */
  ts: number
  jobId: string
  /** 动作类型（由服务端约定） */
  action: string
  /** 运行结果，仅 ok / error / skipped */
  status: 'ok' | 'error' | 'skipped'
  error?: string
  summary?: string
  runAtMs?: number
  /** 当前是否正在运行（毫秒时间戳，有值表示进行中；语义同 {@link CronJobState.runningAtMs}） */
  runningAtMs?: number
  durationMs?: number
  nextRunAtMs?: number
  model?: string
  provider?: string
  delivered?: boolean
  deliveryStatus?: string
  sessionId?: string
  sessionKey?: string
  jobName?: string
}

/**
 * 计划任务运行记录列表响应（`CronRunListResponse`，见 `plan.schemas.yaml`）。
 * 对应接口：`GET /digital-human/{dh_id}/plans/{plan_id}/runs`。
 */
export type CronRunListResponse = CronPagedMeta & {
  entries: CronRunEntry[]
}

// --- Query：`getCronJobList` / `getDigitalHumanPlanList`（见 `plan.paths.yaml`）---

/** `enabled` 查询参数枚举，默认 `all` */
export type CronJobListEnabledFilter = 'all' | 'enabled' | 'disabled'

/** `sortBy` 查询参数枚举，默认 `nextRunAtMs` */
export type CronJobListSortBy = 'nextRunAtMs' | 'createdAtMs' | 'updatedAtMs' | 'name'

/** `sortDir` 查询参数枚举 */
export type SortDir = 'asc' | 'desc'

/**
 * `getCronJobList`（`GET /plans`，见 `plan.paths.yaml`）的 query 参数。
 */
export interface GetCronJobListParams {
  /** 是否包含已禁用任务，默认 `true` */
  includeDisabled?: boolean
  /** 分页大小，默认 `50` */
  limit?: number
  /** 分页偏移量，默认 `0` */
  offset?: number
  /** 启用状态筛选，默认 `all` */
  enabled?: CronJobListEnabledFilter
  /** 排序字段，默认 `nextRunAtMs` */
  sortBy?: CronJobListSortBy
  /** 排序方向，默认 `asc` */
  sortDir?: SortDir
}

/**
 * `getDigitalHumanPlanList`（`GET /digital-human/{dh_id}/plans`，见 `plan.paths.yaml`）的 query 参数，与 {@link GetCronJobListParams} 一致。
 * 路径参数 `dh_id`：数字员工 ID。
 */
export type GetDigitalHumanPlanListParams = GetCronJobListParams

// --- Query：`getDigitalHumanPlanRuns`（见 `plan.paths.yaml`）---

/** `status` / `statuses` 筛选枚举，默认 `all` */
export type CronRunStatusFilter = 'all' | 'ok' | 'error' | 'skipped'

/** `deliveryStatus` / `deliveryStatuses` 筛选枚举 */
export type CronRunDeliveryStatusFilter =
  | 'delivered'
  | 'not-delivered'
  | 'unknown'
  | 'not-requested'

/**
 * `getDigitalHumanPlanRuns`（`GET /digital-human/{dh_id}/plans/{plan_id}/runs`，见 `plan.paths.yaml`）的 query 参数。
 * 路径参数：`dh_id` 数字员工 ID，`plan_id` 计划任务 ID。
 */
export interface GetDigitalHumanPlanRunsParams {
  /** 分页大小，默认 `50`，最大 `200` */
  limit?: number
  /** 分页偏移量，默认 `0` */
  offset?: number
  /** 单状态筛选，默认 `all` */
  status?: CronRunStatusFilter
  /** 多状态筛选；支持逗号分隔或重复 query 参数 */
  statuses?: CronRunStatusFilter[]
  /** 单投递状态筛选 */
  deliveryStatus?: CronRunDeliveryStatusFilter
  /** 多投递状态筛选；支持逗号分隔或重复 query 参数 */
  deliveryStatuses?: CronRunDeliveryStatusFilter[]
  /** 关键词匹配（`summary` / `error` / `jobName`） */
  query?: string
  /** 排序方向，默认 `desc` */
  sortDir?: SortDir
}
