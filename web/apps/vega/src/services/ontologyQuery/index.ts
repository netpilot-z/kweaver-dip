import Request from '../request';
import * as OntologyQuery from './type';

const BASE_URL = '/api/ontology-query/v1/knowledge-networks/';

export const searchObjects = (
  knId: OntologyQuery.KnowledgeNetworkID,
  queryType: OntologyQuery.QueryTypeEnum,
  data: OntologyQuery.ObjectQueryRequest
): Promise<OntologyQuery.SearchResponse> => {
  return Request.postOverrideGet(`${BASE_URL}${knId}?query_type=${queryType}`, data);
};

export const querySubgraph = (knId: OntologyQuery.KnowledgeNetworkID, body: OntologyQuery.SubgraphQueryBody): Promise<OntologyQuery.SubgraphResponse> => {
  return Request.postOverrideGet(`${BASE_URL}${knId}/subgraph`, body);
};

export const queryProperties = (
  knId: OntologyQuery.KnowledgeNetworkID,
  otId: OntologyQuery.ObjectTypeID,
  propertyNames: OntologyQuery.PropertyName[],
  body: OntologyQuery.PropertyQueryBody
): Promise<OntologyQuery.Object[]> => {
  return Request.postOverrideGet(`${BASE_URL}${knId}/object-types/${otId}/properties/${propertyNames.join(',')}`, body);
};

export const listObjects = ({
  knId,
  otId,
  body,
  includeTypeInfo = false,
  includeLogicParams = false,
}: OntologyQuery.ListObjectsRequest): Promise<OntologyQuery.ObjectDataResponse> => {
  return Request.postOverrideGet(`${BASE_URL}${knId}/object-types/${otId}`, body, {
    params: { include_type_info: includeTypeInfo, include_logic_params: includeLogicParams },
  });
};

export const queryAction = (knId: OntologyQuery.KnowledgeNetworkID, actionId: string, body: any = {}): Promise<any> => {
  return Request.postOverrideGet(`${BASE_URL}${knId}/action-types/${actionId}`, body);
};

export default {
  searchObjects,
  querySubgraph,
  queryProperties,
  listObjects,
  queryAction,
};
