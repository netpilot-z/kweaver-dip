// 指标类型枚举
export enum MetricTypeEnum {
  Atomic = 'atomic',
  Derived = 'derived',
  Composite = 'composite',
}

// 作用域类型枚举
export enum ScopeTypeEnum {
  ObjectType = 'object_type',
  Subgraph = 'subgraph',
}

// 排序类型枚举
export enum SortEnum {
  UpdateTime = 'update_time',
  Name = 'name',
}

// 排序方向枚举
export enum DirectionEnum {
  ASC = 'asc',
  DESC = 'desc',
}

// 聚合类型枚举
export enum AggrEnum {
  CountDistinct = 'count_distinct',
  Sum = 'sum',
  Max = 'max',
  Min = 'min',
  Avg = 'avg',
  Count = 'count',
}

// 默认时间范围策略枚举
export enum DefaultRangePolicyEnum {
  Last1h = 'last_1h',
  Last24h = 'last_24h',
  CalendarDay = 'calendar_day',
  None = 'none',
}

// 时间维度
export interface MetricTimeDimension {
  property: string; // 时间列或事件时间字段名
  default_range_policy?: DefaultRangePolicyEnum; // 默认时间范围策略
}

// 聚合配置
export interface MetricAggregation {
  property: string; // 属性名
  aggr: AggrEnum; // 聚合类型
}

// 分组配置
export interface MetricGroupBy {
  property: string; // 属性名
  description?: string; // 描述
}

// 排序配置
export interface MetricOrderBy {
  property: string; // 属性名
  direction: DirectionEnum; // 排序方向
}

// Having 过滤条件
export interface MetricHaving {
  field?: '__value';
  operation?: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'in' | 'not_in' | 'range' | 'out_range';
  value?: any;
}

// 计算公式
export interface MetricCalculationFormula {
  aggregation: MetricAggregation; // 聚合配置
  condition?: any; // 过滤条件（复用 ontology-query 的 Condition）
  group_by?: MetricGroupBy[]; // 分组配置
  order_by?: MetricOrderBy[]; // 排序配置
  having?: MetricHaving; // Having 条件
}

// 分析维度
export interface MetricAnalysisDimension {
  name: string; // 维度名称
  display_name?: string; // 显示名称
}

// 指标定义（完整）
export interface MetricDefinition {
  id: string; // 指标ID
  kn_id: string; // 知识网络ID
  branch: string; // 分支
  name: string; // 名称
  comment?: string; // 备注
  unit_type?: string; // 单位类型
  unit?: string; // 单位
  metric_type: MetricTypeEnum; // 指标类型
  scope_type: ScopeTypeEnum; // 作用域类型
  scope_ref: string; // 作用域引用
  time_dimension?: MetricTimeDimension; // 时间维度
  calculation_formula: MetricCalculationFormula; // 计算公式
  analysis_dimensions?: MetricAnalysisDimension[]; // 分析维度
  tags?: string[]; // 标签
  creator?: {
    id: string;
    name: string;
    type: string;
  }; // 创建人
  create_time?: number; // 创建时间
  updater?: {
    id: string;
    name: string;
    type: string;
  }; // 更新人
  update_time?: number; // 更新时间
}

// 创建指标请求
export interface CreateMetricRequest {
  name: string; // 名称
  comment?: string; // 备注
  unit_type?: string; // 单位类型
  unit?: string; // 单位
  metric_type: MetricTypeEnum; // 指标类型
  scope_type: ScopeTypeEnum; // 作用域类型
  scope_ref: string; // 作用域引用
  time_dimension?: MetricTimeDimension; // 时间维度
  calculation_formula: MetricCalculationFormula; // 计算公式
  analysis_dimensions?: MetricAnalysisDimension[]; // 分析维度
  tags?: string[]; // 标签
}

// 更新指标请求
export interface UpdateMetricRequest {
  comment?: string; // 备注
  unit_type?: string; // 单位类型
  unit?: string; // 单位
  metric_type?: MetricTypeEnum; // 指标类型
  time_dimension?: MetricTimeDimension; // 时间维度
  calculation_formula?: MetricCalculationFormula; // 计算公式
  analysis_dimensions?: MetricAnalysisDimension[]; // 分析维度
  tags?: string[]; // 标签
}

// 获取指标列表请求
export interface GetMetricsRequest {
  name_pattern?: string; // 名称模糊查询
  sort?: SortEnum; // 排序类型
  direction?: DirectionEnum; // 排序方向
  offset?: number; // 偏移量
  limit?: number; // 每页数量
  tag?: string; // 标签过滤
  group_id?: string; // 概念分组过滤
  branch?: string; // 分支
}

// 获取指标列表响应
export interface GetMetricsResponse {
  entries: MetricDefinition[]; // 指标列表
  total_count: number; // 总数
}

// 批量创建指标请求
export interface CreateMetricsRequest {
  entries: CreateMetricRequest[];
}

// 校验指标请求
export interface ValidateMetricsRequest {
  entries: CreateMetricRequest[];
}

// 校验指标响应
export interface ValidateMetricsResponse {
  valid: boolean; // 是否有效
  detail?: string; // 错误详情
}

// 指标类型标签
export const METRIC_TYPE_LABELS: Record<MetricTypeEnum, string> = {
  [MetricTypeEnum.Atomic]: '原子指标',
  [MetricTypeEnum.Derived]: '派生指标',
  [MetricTypeEnum.Composite]: '复合指标',
};

// 作用域类型标签
export const SCOPE_TYPE_LABELS: Record<ScopeTypeEnum, string> = {
  [ScopeTypeEnum.ObjectType]: '对象类',
  [ScopeTypeEnum.Subgraph]: '子图',
};

// 聚合类型标签
export const AGGR_LABELS: Record<AggrEnum, string> = {
  [AggrEnum.CountDistinct]: '去重计数',
  [AggrEnum.Sum]: '求和',
  [AggrEnum.Max]: '最大值',
  [AggrEnum.Min]: '最小值',
  [AggrEnum.Avg]: '平均值',
  [AggrEnum.Count]: '计数',
};

// ============ 指标数据查询相关类型 ============

// 查询模式类型
export type MetricQueryMode = 'instant' | 'trend' | 'sameperiod' | 'proportion';

// 同环比计算方法
export type SamePeriodMethod = 'growth_value' | 'growth_rate';

// 同环比时间粒度
export type SamePeriodTimeGranularity = 'day' | 'month' | 'quarter' | 'year';

// 同环比配置（API 要求 method 为数组，offset 和 time_granularity 为必填）
export interface MetricSamePeriodConfig {
  method?: SamePeriodMethod[]; // 计算方法数组，默认 ['growth_value', 'growth_rate']
  offset: number; // 偏移周期数（必填）
  time_granularity: SamePeriodTimeGranularity; // 时间粒度（必填）
}

// 占比配置
export interface MetricProportionConfig {
  analysis_dimension?: string; // 按哪个维度计算占比
}

// Metrics 配置块（用于同环比/占比分析）
export interface MetricsConfig {
  type: 'sameperiod' | 'proportion';
  sameperiod_config?: MetricSamePeriodConfig;
  proportion_config?: MetricProportionConfig;
}

// 时间窗口配置
export interface MetricTimeWindow {
  start?: number; // 开始时间（毫秒时间戳）
  end?: number; // 结束时间（毫秒时间戳）
  instant?: boolean; // 是否即时查询
  step?: string; // 时间步长（如 '1d', '1h'）
}

// 指标数据查询请求
export interface MetricQueryRequest {
  time?: MetricTimeWindow; // 时间范围
  condition?: any; // 过滤条件（复用 Condition 结构）
  analysis_dimensions?: string[]; // 分析维度
  order_by?: MetricOrderBy[]; // 排序
  having?: MetricHaving; // 聚合后过滤
  metrics?: MetricsConfig; // 同环比/占比配置
  limit?: number; // 返回条数限制
  fill_null?: boolean; // 是否填充空值（URL query 参数）
}

// 指标试运行请求
export interface MetricDryRunRequest {
  metric_config?: MetricDefinition; // 指标配置（用于试运行未保存的配置）
  time?: MetricTimeWindow;
  condition?: any;
  analysis_dimensions?: string[];
  order_by?: MetricOrderBy[];
  having?: MetricHaving;
  metrics?: MetricsConfig;
  limit?: number;
}

// 指标数据响应
export interface MetricDataResponse {
  model?: any; // 指标模型信息
  datas: BknMetricData[]; // 数据列表
  vega_duration_ms?: number; // VEGA 查询耗时
  overall_ms?: number; // 总耗时
}

// 单条指标数据
export interface BknMetricData {
  labels: Record<string, string>; // 维度标签
  times?: any[]; // 时间戳数组
  time_strs?: string[]; // 时间字符串数组
  values: any[]; // 值数组
  growth_values?: any[]; // 同环比增长值
  growth_rates?: any[]; // 同环比增长率
  proportions?: any[]; // 占比百分比
}