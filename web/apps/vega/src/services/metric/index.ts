import Request from '../request';
import * as MetricType from './type';

const BASE_URL = '/api/bkn-backend/v1/knowledge-networks';
// 指标数据查询使用 ontology-query 服务
const QUERY_BASE_URL = '/api/ontology-query/v1/knowledge-networks';

/**
 * 获取指标列表
 * @param knId 知识网络ID
 * @param params 查询参数
 */
export const getMetrics = (knId: string, params: MetricType.GetMetricsRequest): Promise<MetricType.GetMetricsResponse> => {
  return Request.get(`${BASE_URL}/${knId}/metrics`, params);
};

/**
 * 获取指标详情
 * @param knId 知识网络ID
 * @param metricId 指标ID
 * @param branch 分支（可选）
 */
export const getMetricDetail = (knId: string, metricId: string, branch?: string): Promise<MetricType.MetricDefinition> => {
  return Request.get<{ entries: MetricType.MetricDefinition[] }>(`${BASE_URL}/${knId}/metrics/${metricId}`, branch ? { branch } : undefined).then(
    (response) => response.entries?.[0]
  );
};

/**
 * 批量获取指标详情
 * @param knId 知识网络ID
 * @param metricIds 指标ID列表
 * @param branch 分支（可选）
 */
export const getMetricDetails = (knId: string, metricIds: string[], branch?: string): Promise<MetricType.MetricDefinition[]> => {
  return Request.get<{ entries: MetricType.MetricDefinition[] }>(`${BASE_URL}/${knId}/metrics/${metricIds.join(',')}`, branch ? { branch } : undefined).then(
    (response) => response.entries
  );
};

/**
 * 创建单个指标
 * @param knId 知识网络ID
 * @param data 创建数据
 * @param strictMode 是否严格校验依赖
 * @param branch 分支（可选）
 * @returns 返回创建的指标ID数组
 */
export const createMetric = (knId: string, data: MetricType.CreateMetricRequest, strictMode?: boolean, branch?: string): Promise<string[]> => {
  const params: Record<string, unknown> = {};
  if (strictMode !== undefined) params.strict_mode = strictMode;
  if (branch) params.branch = branch;
  // 后端要求 entries 数组格式
  return Request.post(`${BASE_URL}/${knId}/metrics`, { entries: [data] }, { headers: { 'x-http-method-override': 'POST' }, params });
};

/**
 * 批量创建指标
 * @param knId 知识网络ID
 * @param entries 创建数据列表
 * @param strictMode 是否严格校验依赖
 * @param branch 分支（可选）
 * @returns 返回创建的指标ID数组
 */
export const createMetrics = (knId: string, entries: MetricType.CreateMetricRequest[], strictMode?: boolean, branch?: string): Promise<string[]> => {
  const params: Record<string, unknown> = {};
  if (strictMode !== undefined) params.strict_mode = strictMode;
  if (branch) params.branch = branch;
  return Request.post(`${BASE_URL}/${knId}/metrics`, { entries }, { headers: { 'x-http-method-override': 'POST' }, params });
};

/**
 * 更新指标
 * @param knId 知识网络ID
 * @param metricId 指标ID
 * @param data 更新数据
 * @param strictMode 是否严格校验依赖
 * @param branch 分支（可选）
 */
export const updateMetric = (knId: string, metricId: string, data: MetricType.UpdateMetricRequest, strictMode?: boolean, branch?: string): Promise<void> => {
  const params: Record<string, unknown> = {};
  if (strictMode !== undefined) params.strict_mode = strictMode;
  if (branch) params.branch = branch;
  return Request.put(`${BASE_URL}/${knId}/metrics/${metricId}`, data, { params });
};

/**
 * 删除单个指标
 * @param knId 知识网络ID
 * @param metricId 指标ID
 * @param branch 分支（可选）
 */
export const deleteMetric = (knId: string, metricId: string, branch?: string): Promise<void> => {
  return Request.delete(`${BASE_URL}/${knId}/metrics/${metricId}`, branch ? { branch } : undefined);
};

/**
 * 批量删除指标
 * @param knId 知识网络ID
 * @param metricIds 指标ID列表
 * @param branch 分支（可选）
 */
export const deleteMetrics = (knId: string, metricIds: string[], branch?: string): Promise<void> => {
  return Request.delete(`${BASE_URL}/${knId}/metrics/${metricIds.join(',')}`, branch ? { branch } : undefined);
};

/**
 * 校验指标
 * @param knId 知识网络ID
 * @param entries 待校验的指标列表
 * @param strictMode 是否严格校验依赖
 * @param importMode 导入模式
 * @param branch 分支（可选）
 */
export const validateMetrics = (
  knId: string,
  entries: MetricType.CreateMetricRequest[],
  strictMode?: boolean,
  importMode?: 'normal' | 'ignore' | 'overwrite',
  branch?: string
): Promise<MetricType.ValidateMetricsResponse> => {
  const params: Record<string, unknown> = {};
  if (strictMode !== undefined) params.strict_mode = strictMode;
  if (importMode) params.import_mode = importMode;
  if (branch) params.branch = branch;
  return Request.post(`${BASE_URL}/${knId}/metrics/validation`, { entries }, { params });
};

/**
 * 查询指标数据
 * @param knId 知识网络ID
 * @param metricId 指标ID
 * @param params 查询参数
 * @param fillNull 是否填充空值（URL query 参数）
 */
export const queryMetricData = (
  knId: string,
  metricId: string,
  params: MetricType.MetricQueryRequest,
  fillNull?: boolean
): Promise<MetricType.MetricDataResponse> => {
  const queryParams: Record<string, unknown> = {};
  if (fillNull !== undefined) queryParams.fill_null = fillNull ? 'true' : 'false';
  return Request.post(`${QUERY_BASE_URL}/${knId}/metrics/${metricId}/data`, params, { params: queryParams });
};

/**
 * 试运行指标配置
 * @param knId 知识网络ID
 * @param params 试运行参数（包含指标配置）
 * @param fillNull 是否填充空值
 */
export const dryRunMetric = (
  knId: string,
  params: MetricType.MetricDryRunRequest,
  fillNull?: boolean
): Promise<MetricType.MetricDataResponse> => {
  const queryParams: Record<string, unknown> = {};
  if (fillNull !== undefined) queryParams.fill_null = fillNull ? 'true' : 'false';
  return Request.post(`${QUERY_BASE_URL}/${knId}/metrics/dry-run`, params, { params: queryParams });
};

export default {
  getMetrics,
  getMetricDetail,
  getMetricDetails,
  createMetric,
  createMetrics,
  updateMetric,
  deleteMetric,
  deleteMetrics,
  validateMetrics,
  queryMetricData,
  dryRunMetric,
};