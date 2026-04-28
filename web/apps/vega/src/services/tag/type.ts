export interface GetObjectTagsParams {
  sort?: string;
  direction?: string;
  limit?: number;
  offset?: number;
  module?: string;
  name_pattern?: string;
}

export interface TagItem {
  tag: string;
  count?: number;
  module?: string;
  [key: string]: any;
}

export interface TagList {
  total_count: number;
  entries: TagItem[];
}
