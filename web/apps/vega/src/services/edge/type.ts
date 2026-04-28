// 边（关系类）接口定义
export interface Edge {
  id: string; // 关系类ID
  name: string; // 关系类名称
  color: string; // 颜色
  source_type_id: string; // 起始点对象类ID
  target_type_id: string; // 终点对象类ID
  kn_id: string; // 知识网络ID
  properties?: any[]; // 属性列表
  [key: string]: any; // 其他属性
}

// 创建关系类请求参数
export interface CreateEdgeRequest {
  name: string; // 关系类名称
  color: string; // 颜色
  source_type_id: string; // 起始点对象类ID
  target_type_id: string; // 终点对象类ID
  [key: string]: any;
}

// 更新关系类请求参数
export interface UpdateEdgeRequest {
  name?: string; // 关系类名称
  color?: string; // 颜色
  [key: string]: any;
}

// 获取关系类列表查询参数
export interface GetEdgeListParams {
  name_pattern?: string; // 名称模糊查询
  source_type_id?: string; // 起始点对象类ID过滤
  target_type_id?: string; // 终点对象类ID过滤
  offset?: number;
  limit?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
  [key: string]: any;
}

// 列表响应结构
export interface List<T> {
  entries: T[];
  total_count: number;
}
