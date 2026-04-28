import Request from '../request';
import * as RowColumnPermission from './type';

const BASE_URL = '/api/mdl-data-model/v1/data-view-row-column-rules';

export const getRowColumnRulesByViewId = (params?: RowColumnPermission.QueryParams): Promise<RowColumnPermission.List> => {
  console.log(params);
  const queryParams = {
    view_id: params?.view_id || '',
    sort: params?.sort || 'update_time',
    direction: params?.direction || 'desc',
    limit: params?.limit || 20,
    offset: params?.offset || 0,
    name_pattern: params?.name_pattern,
  };

  return Request.get<RowColumnPermission.List>(`${BASE_URL}`, queryParams);
};

export const createRowColumnRule = (data: RowColumnPermission.CreateRuleParams[]): Promise<{ id: string }> => {
  return Request.post<{ id: string }>(BASE_URL, data);
};

export const updateRowColumnRule = (id: RowColumnPermission.RuleID, data: RowColumnPermission.CreateRuleParams): Promise<any> => {
  return Request.put<any>(`${BASE_URL}/${id}`, data);
};

export const deleteRowColumnRule = (ids: RowColumnPermission.RuleID | RowColumnPermission.RuleID[]): Promise<any> => {
  const ruleIds = Array.isArray(ids) ? ids.join(',') : ids;
  return Request.delete<any>(`${BASE_URL}/${ruleIds}`);
};

export const getRowColumnRuleById = (id: RowColumnPermission.RuleID): Promise<RowColumnPermission.Rule> => {
  return Request.get<RowColumnPermission.Rule>(`${BASE_URL}/${id}`);
};

export const copyRowColumnRule = (id: RowColumnPermission.RuleID, newName: string): Promise<{ id: string }> => {
  return Request.post<{ id: string }>(`${BASE_URL}/${id}/copy`, { name: newName });
};

export default {
  getRowColumnRulesByViewId,
  createRowColumnRule,
  updateRowColumnRule,
  deleteRowColumnRule,
  getRowColumnRuleById,
  copyRowColumnRule,
};
