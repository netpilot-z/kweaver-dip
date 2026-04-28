export enum JobType {
  Full = 'full',
  Incremental = 'incremental',
}

export enum ConceptTypeEnum {
  Object = 'object_type',
}

export enum StateEnum {
  Pending = 'pending',
  Running = 'running',
  Completed = 'completed',
  Failed = 'failed',
  Canceled = 'canceled',
}

export interface TaskItemType {
  id: string;
  job_type: JobType;
  state: StateEnum;
  start_time: number;
  finish_time: number;
}

export interface TaskList {
  entries: TaskItemType[];
  total_count: number;
}

export interface TaskChildType {
  concept_id: string;
  concept_name: string;
  concept_type: ConceptTypeEnum;
  finish_time: number;
  id: string;
  job_id: string;
  start_time: number;
  state: StateEnum;
  state_detail: string;
  time_cost: number;
}

export interface TaskChildList {
  entries: TaskChildType[];
  total_count: number;
}
