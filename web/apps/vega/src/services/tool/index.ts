import Request from '../request';
import * as ToolType from './type';

// API URL 常量
const AGENT_BASE_URL = '/api/agent-operator-integration/v1';
const TOOL_BOX_BASE_URL = `${AGENT_BASE_URL}/tool-box`;
const MCP_BASE_URL = `${AGENT_BASE_URL}/mcp`;

/**
 * 获取工具箱列表
 */
export const getToolBoxList = async (params: ToolType.GetToolBoxListParams): Promise<any> => {
  return await Request.get(`${TOOL_BOX_BASE_URL}/market`, params);
};

/**
 * 获取工具箱内的工具列表
 */
export const getToolListByBoxId = async (boxId: string, params: ToolType.GetToolListByBoxIdParams): Promise<any> => {
  return await Request.get(`${TOOL_BOX_BASE_URL}/${boxId}/tools/list`, params);
};

/**
 * 获取工具箱市场信息
 */
export const getToolBoxDetail = async (boxId: string, fields: ToolType.ToolBoxField[]): Promise<any> => {
  return await Request.get(`${TOOL_BOX_BASE_URL}/market/${boxId}/${fields.join(',')}`);
};

/**
 * 搜索工具
 */
export const searchTool = async (params: ToolType.SearchToolParams): Promise<any> => {
  const queryParams = {
    ...params,
    sort_by: params.sort_by || 'create_time',
    sort_order: params.sort_order || 'desc',
  };
  return await Request.get(`${TOOL_BOX_BASE_URL}/market/tools`, queryParams);
};

/**
 * 获取工具信息
 */
export const getToolDetail = async (boxId: string, toolId: string): Promise<any> => {
  return await Request.get(`${TOOL_BOX_BASE_URL}/${boxId}/tool/${toolId}`);
};

/**
 * 获取MCP市场列表
 */
export const getMcpMarketList = async (params: ToolType.GetMcpMarketListParams): Promise<any> => {
  return await Request.get(`${MCP_BASE_URL}/market/list`, params);
};

/**
 * 获取MCP详情
 */
export const getMcpDetail = async (mcpId: string): Promise<any> => {
  return await Request.get(`${MCP_BASE_URL}/market/${mcpId}/`);
};

/**
 * 获取MCP工具列表
 */
export const getMcpTools = async (mcpId: string, params: ToolType.GetMcpToolsParams): Promise<any> => {
  return await Request.get(`${MCP_BASE_URL}/proxy/${mcpId}/tools`, params);
};

export default {
  getToolBoxList,
  getToolListByBoxId,
  getToolBoxDetail,
  searchTool,
  getToolDetail,
  getMcpMarketList,
  getMcpDetail,
  getMcpTools,
};
