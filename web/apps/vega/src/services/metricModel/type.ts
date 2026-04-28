export enum QueryType {
  Dsl = 'dsl',
  Sql = 'sql',
}

export enum MetricType {
  Basic = 'basic',
  Derived = 'derived',
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface MetricModelListParams extends PaginationParams {
  name_pattern?: string;
  query_type?: string[];
  tag?: string;
  group_id?: string | null;
  metric_type?: MetricType[];
  simple_info?: boolean;
}

export interface MetricModelItem {
  id: string;
  name: string;
  technical_name: string;
  type: string;
  query_type: QueryType;
  formula: string;
  comment?: string;
  tags?: string[];
  group_id: string;
  group_name: string;
  creator?: {
    id: string;
    name: string;
    type: string;
  };
  create_time: number;
  updater?: {
    id: string;
    name: string;
    type: string;
  };
  update_time: number;
  kn_id: string;
  builtin: boolean;
  data_source_id: string;
  data_source_type: string;
  data_source_name: string;
}

export interface MetricModelList {
  entries: MetricModelItem[];
  total_count: number;
}

export interface MetricModelDetail extends MetricModelItem {
  dslFormula?: any;
  sqlFormula?: string;
  queryType: QueryType;
  formula: string;
}

export interface CreateMetricModelRequest {
  name: string;
  technical_name: string;
  type: string;
  query_type: QueryType;
  formula: string;
  comment?: string;
  tags?: string[];
  group_id: string;
  kn_id: string;
  data_source_id: string;
}

export interface UpdateMetricModelRequest {
  name?: string;
  technical_name?: string;
  type?: string;
  query_type?: QueryType;
  formula?: string;
  comment?: string;
  tags?: string[];
  group_id?: string;
  data_source_id?: string;
}

export interface Group {
  id: string;
  name: string;
  comment?: string;
  builtin: boolean;
  metric_model_count: number;
  create_time: number;
  update_time: number;
}

export interface GroupList {
  entries: Group[];
  total_count: number;
}

export interface CreateGroupRequest {
  name: string;
  comment?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  comment?: string;
}

export interface Tag {
  tag: string;
  module: string;
}

export interface TagList {
  entries: Tag[];
  total_count: number;
}

export interface MetricOrderField {
  display_name: string;
  name: string;
  type: string;
  comment: string;
}

export interface GetIndexBaseListParams extends PaginationParams {
  name_pattern?: string;
  process_status?: string;
}
