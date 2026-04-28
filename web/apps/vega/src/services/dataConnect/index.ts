import UTILS from '@/utils';
import Request from '../request';
import * as DataConnectType from './type';

// API URL 常量
const BASE_URL = '/api/data-connection/v1/datasource';
const CONNECTORS_URL = '/api/data-connection/v1/datasource/connectors';

/**
 * 获取数据源列表
 * @param params 查询参数
 */
export const getDataSourceList = async (params: DataConnectType.GetDataSourceListParams): Promise<DataConnectType.List<DataConnectType.DataSource>> => {
  const queryParams = UTILS.filterEmptyFields({
    sort: params.sort || 'updated_at',
    direction: params.direction || 'desc',
    limit: params.limit || -1,
    offset: params.offset || 0,
    keyword: params.keyword,
    type: params.type === 'all' ? '' : params.type,
  });

  return await Request.get(BASE_URL, queryParams);
};

/**
 * 根据ID获取数据源详情
 * @param id 数据源ID
 */
export const getDataSourceById = async (id: string): Promise<DataConnectType.DataSource> => {
  const res = await Request.get<DataConnectType.DataSource>(`${BASE_URL}/${id}`);
  return {
    ...res,
    deployMethod: res.bin_data.replica_set ? 1 : 0,
    authMethod: res.bin_data.token ? 1 : 0,
  };
};

/**
 * 获取数据源连接器列表
 */
export const getDataSourceConnectors = async (): Promise<DataConnectType.ConnectorsResponse> => {
  return await Request.get(CONNECTORS_URL);
};

/**
 * 创建数据源
 * @param data 创建数据
 */
export const createDataSource = async (data: Partial<DataConnectType.DataSource>): Promise<DataConnectType.CreateDataSourceResponse[]> => {
  return await Request.post(BASE_URL, data);
};

/**
 * 更新数据源
 * @param id 数据源ID
 * @param data 更新数据
 */
export const updateDataSource = async (id: string, data: Partial<DataConnectType.DataSource>): Promise<any> => {
  return await Request.put(`${BASE_URL}/${id}`, data);
};

/**
 * 测试数据源连接
 * @param data 测试数据
 */
export const postTestConnect = async (data: Partial<DataConnectType.DataSource>): Promise<DataConnectType.CreateDataSourceResponse[]> => {
  return await Request.post(`${BASE_URL}/test`, data);
};

/**
 * 删除数据源
 * @param ids 数据源ID列表
 */
export const deleteDataSource = async (ids: string[]): Promise<any> => {
  return await Request.delete(`${BASE_URL}/${ids.join(',')}`);
};

/**
 * 根据名称获取数据源
 * @param name 数据源名称
 */
export const getDataSourceByName = async (name: string): Promise<any> => {
  return await Request.get(BASE_URL, { name });
};

export default {
  getDataSourceList,
  getDataSourceById,
  createDataSource,
  updateDataSource,
  deleteDataSource,
  getDataSourceConnectors,
  getDataSourceByName,
  postTestConnect,
};
