import Request from '@/services/request';
import * as Task from './type';

const BASE_URL = '/api/ontology-manager/v1/knowledge-networks';

export const createTask = async (
  knId: string,
  data: {
    name: string;
    job_type: Task.JobType;
  }
): Promise<{ id: string }> => {
  return await Request.post(`${BASE_URL}/${knId}/jobs`, data);
};

export const deleteTask = async (knId: string, taskId: string) => {
  return await Request.delete(`${BASE_URL}/${knId}/jobs/${taskId}`);
};

export const getTaskList = async (knId: string, params: any): Promise<Task.TaskList> => {
  return Request.get(`${BASE_URL}/${knId}/jobs`, params);
};

export const getTaskDetail = async (knId: string, rtId: string, params: any): Promise<Task.TaskChildList> => {
  return await Request.get(`${BASE_URL}/${knId}/jobs/${rtId}/tasks`, params);
};

export default {
  createTask,
  deleteTask,
  getTaskList,
  getTaskDetail,
};
