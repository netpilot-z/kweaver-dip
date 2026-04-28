// 通用分页参数
export interface PaginationParams {
  page?: number; // 页码，默认1
  page_size?: number; // 每页数量，默认10
  sort_by?: string; // 排序字段
  sort_order?: 'asc' | 'desc'; // 排序顺序
  all?: boolean; // 是否获取所有
  [key: string]: any;
}

// 获取工具箱列表请求参数
export interface GetToolBoxListParams extends PaginationParams {
  status?: 'unpublish' | 'published' | 'offline'; // 查询状态
  name?: string; // 名称
  sort_by?: 'create_time' | 'updated_time' | 'name';
}

// 获取工具箱内工具列表请求参数
export interface GetToolListByBoxIdParams extends PaginationParams {
  status?: 'enabled'; // 查询状态
  name?: string; // 名称
  sort_by?: 'create_time' | 'updated_time' | 'name';
}

// 搜索工具请求参数
export interface SearchToolParams extends PaginationParams {
  tool_name: string;
  status?: 'enabled';
  sort_by?: 'create_time';
  sort_order?: 'desc';
}

export type ToolBoxField =
  | 'box_name'
  | 'box_desc'
  | 'box_svc_url'
  | 'status'
  | 'category_type'
  | 'category_name'
  | 'is_internal'
  | 'source'
  | 'create_user'
  | 'update_user'
  | 'release_user'
  | 'tools';

// MCP 市场列表请求参数
export interface GetMcpMarketListParams extends PaginationParams {
  name?: string;
  status?: 'published';
}

// MCP 工具列表请求参数
export interface GetMcpToolsParams extends PaginationParams {
  status?: 'enabled';
}

// 通用列表响应
export interface List<T> {
  entries: T[];
  total_count: number;
}
