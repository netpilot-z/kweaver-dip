import Request from '../request';
import * as AuthorizationType from './type';

const BASE_URL = '/api/authorization/v1';

const DEFAULT_RESOURCE_TYPES = [
  AuthorizationType.ResourceType.KnowledgeNetwork,
  AuthorizationType.ResourceType.MetricModel,
  AuthorizationType.ResourceType.ObjectiveModel,
  AuthorizationType.ResourceType.EventModel,
  AuthorizationType.ResourceType.DataDict,
  AuthorizationType.ResourceType.TraceModel,
  AuthorizationType.ResourceType.DataView,
  AuthorizationType.ResourceType.VegaLogicView,
  AuthorizationType.ResourceType.FieldModel,
  AuthorizationType.ResourceType.IndexBase,
  AuthorizationType.ResourceType.IndexBasePolicy,
  AuthorizationType.ResourceType.Repository,
  AuthorizationType.ResourceType.StreamDataPipeline,
  AuthorizationType.ResourceType.DataConnection,
];

export const getResourceTypeOperation = async (data?: AuthorizationType.GetResourceTypeRequest): Promise<AuthorizationType.GetResourceTypeResponse> => {
  const resourceTypes = data?.map((item) => item.type) || DEFAULT_RESOURCE_TYPES;
  return Request.post(`${BASE_URL}/resource-type-operation`, { method: 'GET', resource_types: resourceTypes });
};

export default {
  DEFAULT_RESOURCE_TYPES,
  getResourceTypeOperation,
};
