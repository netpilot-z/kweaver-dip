import UTILS from '@/utils';
import Request from '../request';
import * as EdgeType from './type';

// API URL 常量
const BASE_URL = '/api/ontology-manager/v1/knowledge-networks';

/**
 * 创建关系类
 * @param knId 知识网络ID
 * @param data 创建数据
 */
const createEdge = async (knId: string, data: EdgeType.CreateEdgeRequest): Promise<any> => {
  return await Request.post(`${BASE_URL}/${knId}/relation-types`, { entries: [data] }, { cancelTokenKey: 'createEdge' });
};

/**
 * 删除关系类
 * @param knId 知识网络ID
 * @param edgeIds 关系类ID列表
 */
const deleteEdge = async (knId: string, edgeIds: string[]): Promise<any> => {
  return await Request.delete(`${BASE_URL}/${knId}/relation-types/${edgeIds.join(',')}`);
};

/**
 * 修改关系类
 * @param knId 知识网络ID
 * @param edgeId 关系类ID
 * @param data 更新数据
 */
const updateEdge = async (knId: string, edgeId: string, data: EdgeType.UpdateEdgeRequest): Promise<any> => {
  return await Request.put(`${BASE_URL}/${knId}/relation-types/${edgeId}`, data, { cancelTokenKey: 'updateEdge' });
};

/**
 * 获取关系类列表
 * @param knId 知识网络ID
 * @param params 查询参数
 */
const getEdgeList = async (knId: string, params: EdgeType.GetEdgeListParams): Promise<EdgeType.List<EdgeType.Edge>> => {
  const queryParams = UTILS.filterEmptyFields({
    ...params,
    sort: params.sort || 'update_time',
    direction: params.direction || 'desc',
  });
  return await Request.get(`${BASE_URL}/${knId}/relation-types`, queryParams);
};

/**
 * 获取关系类详情
 * @param knId 知识网络ID
 * @param edgeIds 关系类ID或ID列表
 */
const getEdgeDetail = async (knId: string, edgeIds: string | string[]): Promise<EdgeType.Edge[]> => {
  const ids = Array.isArray(edgeIds) ? edgeIds.join(',') : edgeIds;
  const response = await Request.get<{ entries: EdgeType.Edge[] }>(`${BASE_URL}/${knId}/relation-types/${ids}`);
  return response.entries;
};

export default {
  createEdge,
  deleteEdge,
  updateEdge,
  getEdgeList,
  getEdgeDetail,
};
