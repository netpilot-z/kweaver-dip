import { formatKeyOfObjectToLine } from '@/utils/format-objectkey-structure';
import UTILS from '@/utils';
import Request from '../request';
import * as AtomDataViewType from './type';

const BASE_URL = '/api/mdl-data-model/v1/data-views';
const PREVIEW_BASE_URL = '/api/mdl-uniquery/v1/data-views';

/**
 * 1. 查询视图列表
 * @param params 查询参数
 * @returns 视图列表数据
 */
export const getDataViewList = (params: AtomDataViewType.QueryViewListParams): Promise<AtomDataViewType.List> => {
  const queryParams = {
    sort: params.sort || 'update_time',
    direction: params.direction || 'asc',
    limit: params.limit || -1,
    offset: params.offset || 0,
    keyword: params.keyword || '',
    type: 'atomic',
    excel_file_name: params.excel_file_name,
    data_source_type: params.data_source_type,
    data_source_id: params.data_source_id,
  };
  // 过滤空值字段
  const filteredParams = UTILS.filterEmptyFields(queryParams);

  return Request.get<AtomDataViewType.List>(BASE_URL, filteredParams);
};

/**
 * 2. 修改视图的属性
 * @param id 视图ID
 * @param data 更新数据对象
 * @returns 更新结果
 */
export const updateDataViewAttrs = (id: string, data: AtomDataViewType.UpdateDataViewParams): Promise<any> => {
  const url = `${BASE_URL}/${id}/attrs/name,comment,fields`;
  return Request.put(url, data);
};

/**
 * 3. 批量根据id查询视图
 * @param viewIds 视图ID数组
 * @param params 查询参数
 * @param params.include_view 是否包含视图详情，默认为true
 * @returns 视图详情列表
 */
export const getDataViewsByIds = (viewIds: string[], params?: AtomDataViewType.BatchQueryParams): Promise<AtomDataViewType.Data[]> => {
  const queryParams = {
    include_view: params?.include_view || true,
  };

  return Request.get<AtomDataViewType.Data[]>(`${BASE_URL}/${viewIds.join(',')}`, queryParams);
};

/**
 * 4. 批量删除视图
 * @param view_ids 要删除的数据视图ID列表
 * @returns 删除结果，HTTP 204表示删除成功
 */
export const batchDeleteDataViews = (view_ids: string[]): Promise<any> => {
  return Request.delete(`${BASE_URL}/${view_ids.join(',')}`);
};

/**
 * 数据预览
 * @param id 视图ID
 * @param values 预览参数
 */
export const postFormViewDataPreview = async (id: string, values: Record<string, any>): Promise<any> => {
  return Request.postOverrideGet(`${PREVIEW_BASE_URL}/${id}?include_view=${true}`, formatKeyOfObjectToLine(values));
};

export default {
  getDataViewList,
  updateDataViewAttrs,
  getDataViewsByIds,
  batchDeleteDataViews,
  postFormViewDataPreview,
};
