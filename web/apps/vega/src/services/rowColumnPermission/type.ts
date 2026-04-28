export type RuleID = string;
export type ViewID = string;

export interface User {
  id: string;
  type: string;
  name: string;
}

export interface RowFilter {
  field: string;
  operation: string;
  value_from: string;
  value: any;
  sub_conditions?: any[];
}

export interface Rule {
  id: RuleID;
  name: string;
  view_id: ViewID;
  view_name: string;
  tags: string[];
  comment: string;
  create_time: number;
  update_time: number;
  creator: User;
  updater: User;
  fields: string[];
  row_filters: RowFilter;
  visitor?: string;
  from?: string;
  permission?: string;
  updated_by?: string;
  operations?: string[];
  data_view_id?: string;
  rule_type?: string;
  rule_config?: any;
}

export interface List {
  entries: Rule[];
  total_count: number;
}

export interface QueryParams {
  view_id?: ViewID;
  offset?: number;
  limit?: number;
  sort?: string;
  direction?: string;
  name_pattern?: string;
}

export interface CreateRuleParams {
  name: string;
  view_id: ViewID;
  tags?: string[];
  comment?: string;
  fields: string[];
  row_filters?: any;
}
