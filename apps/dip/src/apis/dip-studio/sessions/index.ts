import { get } from '@/utils/http'
import type {
  GetDigitalHumanSessionMessagesParams,
  GetDigitalHumanSessionsListParams,
  GetSessionsListParams,
  SessionArchivesResponse,
  SessionGetResponse,
  SessionsListResponse,
} from './index.d'

export type {
  GetDigitalHumanSessionMessagesParams,
  GetDigitalHumanSessionsListParams,
  GetSessionsListParams,
  SessionArchiveEntry,
  SessionArchiveEntryType,
  SessionArchivesResponse,
  SessionDefaults,
  SessionDeliveryContext,
  SessionGetResponse,
  SessionMessage,
  SessionOrigin,
  SessionPreviewItem,
  SessionSummary,
  SessionsListResponse,
  SessionsPreviewRequest,
  SessionsPreviewResponse,
} from './index.d'

const BASE = '/api/dip-studio/v1'

/** 省略 undefined，避免作为 query 传出 */
function cleanParams<T extends Record<string, unknown>>(obj?: T): T | undefined {
  if (!obj) return undefined
  const entries = Object.entries(obj).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return undefined
  return Object.fromEntries(entries) as T
}

/** 归档子路径分段 URL 编码（保留 `/` 作为层级） */
function encodeArchiveSubpath(subpath: string): string {
  return subpath.replace(/^\/+/, '').split('/').filter(Boolean).map(encodeURIComponent).join('/')
}

/** 获取会话列表（getSessionsList） */
export const getSessionsList = (params?: GetSessionsListParams): Promise<SessionsListResponse> =>
  get(`${BASE}/sessions`, {
    params: cleanParams(params as Record<string, unknown> | undefined),
  }) as Promise<SessionsListResponse>

/** 获取指定数字员工的会话列表（getDigitalHumanSessionsList） */
export const getDigitalHumanSessionsList = (
  dhId: string,
  params?: GetDigitalHumanSessionsListParams,
): Promise<SessionsListResponse> =>
  get(`${BASE}/digital-human/${dhId}/sessions`, {
    params: cleanParams(params as Record<string, unknown> | undefined),
  }) as Promise<SessionsListResponse>

/** 获取指定数字员工会话消息详情（getDigitalHumanSessionMessages） */
export const getDigitalHumanSessionMessages = (
  sessionId: string,
  params?: GetDigitalHumanSessionMessagesParams,
): Promise<SessionGetResponse> =>
  get(`${BASE}/sessions/${sessionId}/messages`, {
    params: cleanParams(params as Record<string, unknown> | undefined),
  }) as Promise<SessionGetResponse>

/** 获取指定数字员工会话下的归档物（getDigitalHumanSessionArchives） */
export const getDigitalHumanSessionArchives = (
  sessionId: string,
): Promise<SessionArchivesResponse> =>
  get(`${BASE}/sessions/${sessionId}/archives`) as Promise<SessionArchivesResponse>

/**
 * 获取指定数字员工会话归档子路径内容（getDigitalHumanSessionArchiveSubpath）
 * 目录多为 JSON（SessionArchivesResponse）；文件可能为 octet-stream / text，需传 `responseType`。
 */
export const getDigitalHumanSessionArchiveSubpath = (
  sessionId: string,
  subpath: string,
  options?: { responseType?: 'json' | 'text' | 'arraybuffer'; timeout?: number },
): Promise<SessionArchivesResponse | string | ArrayBuffer> =>
  get(`${BASE}/sessions/${sessionId}/archives/${encodeArchiveSubpath(subpath)}`, {
    ...(options?.responseType !== undefined ? { responseType: options.responseType } : {}),
    ...(options?.timeout !== undefined ? { timeout: options.timeout } : {}),
  }) as Promise<SessionArchivesResponse | string | ArrayBuffer>
