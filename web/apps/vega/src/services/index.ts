import action from './action';
import * as ActionType from './action/type';
import atomDataView from './atomDataView';
import * as AtomDataViewType from './atomDataView/type';
import authorization from './authorization';
import * as AuthorizationType from './authorization/type';
import conceptGroup from './conceptGroup';
import * as ConceptGroupType from './conceptGroup/type';
import customDataView from './customDataView';
import * as CustomDataViewType from './customDataView/type';
import dataConnect from './dataConnect';
import * as DataConnectType from './dataConnect/type';
import dataView from './dataView';
import * as DataViewType from './dataView/type';
import edge from './edge';
import * as EdgeType from './edge/type';
import knowledgeNetwork from './knowledgeNetwork';
import * as KnowledgeNetworkType from './knowledgeNetwork/type';
import metricModel from './metricModel';
import * as MetricModelType from './metricModel/type';
import object from './object';
import * as ObjectType from './object/type';
import ontologyQuery from './ontologyQuery';
import * as OntologyQueryType from './ontologyQuery/type';
import rowColumnPermission from './rowColumnPermission';
import * as RowColumnPermissionType from './rowColumnPermission/type';
import scanManagement from './scanManagement';
import * as ScanManagementType from './scanManagement/type';
import tag from './tag';
import * as TagType from './tag/type';
import task from './task';
import * as TaskType from './task/type';
import tool from './tool';
import * as ToolType from './tool/type';

const SERVICE = {
  action,
  atomDataView,
  authorization,
  conceptGroup,
  customDataView,
  dataConnect,
  dataView,
  edge,
  knowledgeNetwork,
  metricModel,
  object,
  ontologyQuery,
  rowColumnPermission,
  scanManagement,
  tag,
  task,
  tool,
};

export default SERVICE;

export type {
  ActionType,
  AtomDataViewType,
  AuthorizationType,
  ConceptGroupType,
  CustomDataViewType,
  DataConnectType,
  DataViewType,
  EdgeType,
  KnowledgeNetworkType,
  MetricModelType,
  ObjectType,
  OntologyQueryType,
  RowColumnPermissionType,
  ScanManagementType,
  TagType,
  TaskType,
  ToolType,
};
