export interface DataView {
  id: string; // 视图ID
  name: string; // 视图名称
  technical_name?: string; // 技术名称
  group_id?: string; // 分组ID
  group_name?: string; // 分组名称
  type?: string; // 视图类型
  query_type?: string; // 查询类型
  tags?: string[]; // 标签
  comment?: string; // 备注
  create_time?: number; // 创建时间
  update_time?: number; // 更新时间
  creator?: string; // 创建人
  updater?: string; // 更新人
  data_source_id?: string; // 数据源ID
  data_source_type?: string; // 数据源类型
  sql_str?: string; // SQL
  fields?: any[]; // 字段列表
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  // 其他属性根据实际返回补充
}

export interface Group {
  id: string;
  name: string;
  data_view_count: number;
  update_time: number;
  builtin: boolean;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface GetDataViewListParams extends PaginationParams {
  name_pattern?: string;
  type?: string;
  group_id?: string;
  tag?: string;
}

export interface GetAtomViewListParams extends PaginationParams {
  excelFileName?: string;
  dataSourceType?: string;
  dataSourceId?: string;
  name?: string;
  tag?: string;
  queryType?: string;
}

export interface GetDataSourceListParams extends PaginationParams {
  [key: string]: any;
}

export interface List<T> {
  entries: T[];
  total_count: number;
}
