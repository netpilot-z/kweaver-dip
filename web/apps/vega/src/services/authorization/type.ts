export enum ResourceType {
  KnowledgeNetwork = 'knowledge_network',
  MetricModel = 'metric_model',
  ObjectiveModel = 'objective_model',
  EventModel = 'event_model',
  DataDict = 'data_dict',
  TraceModel = 'trace_model',
  DataView = 'data_view',
  VegaLogicView = 'vega_logic_view',
  FieldModel = 'field_model',
  IndexBase = 'index_base',
  IndexBasePolicy = 'index_base_policy',
  Repository = 'repository',
  StreamDataPipeline = 'stream_data_pipeline',
  DataConnection = 'data_connection',
}

export type ResourceTypeInfo = {
  id: string;
  type: string;
};

export type GetResourceTypeRequest = ResourceTypeInfo[];

export type GetResourceTypeResponse = {
  entries: Array<{
    id: string;
    type: string;
    operations: string[];
  }>;
  total_count: number;
};
