import { del, get, put } from '@/utils/http'
import type {
  CronJobListResponse,
  CronRunListResponse,
  GetCronJobListParams,
  GetDigitalHumanPlanListParams,
  GetDigitalHumanPlanRunsParams,
} from './index.d'

export type {
  CronJob,
  CronJobListEnabledFilter,
  CronJobListResponse,
  CronJobListSortBy,
  CronJobState,
  CronRunDeliveryStatusFilter,
  CronRunEntry,
  CronRunListResponse,
  CronRunStatusFilter,
  CronSchedule,
  GetCronJobListParams,
  GetDigitalHumanPlanListParams,
  GetDigitalHumanPlanRunsParams,
  SortDir,
} from './index.d'

const BASE = '/api/dip-studio/v1'

/** 省略 undefined，避免作为 query 传出 */
function cleanParams<T extends Record<string, unknown>>(obj?: T): T | undefined {
  if (!obj) return undefined
  const entries = Object.entries(obj).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return undefined
  return Object.fromEntries(entries) as T
}

/** 获取计划任务列表（getCronJobList） */
export const getCronJobList = (params?: GetCronJobListParams): Promise<CronJobListResponse> =>
  get(`${BASE}/plans`, {
    params: cleanParams(params as Record<string, unknown> | undefined),
  }) as Promise<CronJobListResponse>

/** 获取指定数字员工的计划任务列表（getDigitalHumanPlanList） */
export const getDigitalHumanPlanList = (
  dhId: string,
  params?: GetDigitalHumanPlanListParams,
): Promise<CronJobListResponse> =>
  get(`${BASE}/digital-human/${dhId}/plans`, {
    params: cleanParams(params as Record<string, unknown> | undefined),
  }) as Promise<CronJobListResponse>

/** 获取指定数字员工计划任务的运行记录（getDigitalHumanPlanRuns） */
export const getDigitalHumanPlanRuns = (
  planId: string,
  params?: GetDigitalHumanPlanRunsParams,
): Promise<CronRunListResponse> =>
  get(`${BASE}/plans/${planId}/runs`, {
    params: cleanParams(params as Record<string, unknown> | undefined),
  }) as Promise<CronRunListResponse>

/** 删除计划任务 */
export const deleteCronJob = (planId: string): Promise<void> => del(`${BASE}/plans/${planId}`)

/** 更新计划启用状态 */
export const updateCronJobEnabled = (planId: string, enabled: boolean): Promise<void> =>
  put(`${BASE}/plans/${planId}`, { body: { enabled } })
