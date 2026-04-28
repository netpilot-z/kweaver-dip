import * as ObjectType from '../object/type';

export type KnowledgeNetworkID = string;
export type ObjectTypeID = string;
export type ObjectID = string;
export type PropertyName = string;

export enum QueryTypeEnum {
  RelationPath = 'relation_path',
  SourceTarget = 'source_target',
}

export enum DirectionEnum {
  Forward = 'forward',
  Reverse = 'reverse',
  Bidirectional = 'bidirectional',
}

export interface BaseCondition {
  object_type_id: ObjectID;
  field: string;
  operation: string;
  value: any;
  value_from: 'const' | 'input' | 'property';
}

export interface ConditionGroup {
  operation: 'and' | 'or';
  sub_conditions: (BaseCondition | ConditionGroup)[];
}

export interface PathEdge {
  id: string;
  name: string;
  source: ObjectID;
  target: ObjectID;
}

export interface PathNode {
  id: ObjectID;
  name: string;
}

export interface Path {
  nodes: PathNode[];
  edges: PathEdge[];
  length: number;
}

export interface ObjectQueryBaseOnPath {
  concept_groups: string[];
  path: Path;
  condition: ConditionGroup;
}

export interface ObjectQueryBaseOnSourceTarget {
  concept_groups: string[];
  source_object_type_id: ObjectTypeID;
  target_object_type_id: ObjectTypeID;
  query_object_type_id: ObjectTypeID;
  path_max_length: number;
  direction: DirectionEnum;
  path_select_policy: string;
  condition: ConditionGroup;
}

export type ObjectQueryRequest = ObjectQueryBaseOnPath | ObjectQueryBaseOnSourceTarget;

export interface Object {
  [key: string]: any;
}

export type SearchResponse = Object[];

export interface SubgraphQueryBody {
  concept_groups: string[];
  source_object_type_ids: ObjectTypeID[];
  path_length: number;
  direction: DirectionEnum;
  path_select_policy: string;
  condition: ConditionGroup;
}

export interface SubgraphResponse {
  nodes: Object[];
  edges: Object[];
}

export interface PropertyQueryBody {
  object_type_id: ObjectTypeID;
  property_name: PropertyName[];
  unique_identity: Array<Record<string, any>>;
  query_type: 'value' | 'calculate_params';
  dynamic_params?: Record<string, any>;
}

export interface PageTurn {
  search_after?: string[];
  limit?: number;
  need_total?: boolean;
  condition: ConditionGroup;
}

export interface ObjectDataResponse {
  object_type: ObjectType.ReqObjectType;
  datas: { [key: string]: any }[];
  total_count: number;
  search_after?: string[];
}

export interface ListObjectsRequest {
  knId: KnowledgeNetworkID;
  otId: ObjectTypeID;
  body?: PageTurn;
  includeTypeInfo?: boolean;
  includeLogicParams?: boolean;
}
