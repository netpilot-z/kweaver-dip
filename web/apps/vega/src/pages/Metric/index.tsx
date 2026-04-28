/**
 * 指标-数据列表
 */
import { memo, FC, useState, useEffect, useCallback } from 'react';
import intl from 'react-intl-universal';
import { useHistory } from 'react-router-dom';
import { EllipsisOutlined } from '@ant-design/icons';
import { Dropdown, Empty } from 'antd';
import { SorterResult } from 'antd/es/table/interface';
import { TableProps } from 'antd/lib/table';
import dayjs from 'dayjs';
import { showDeleteConfirm } from '@/components/DeleteConfirm';
import ObjectIcon from '@/components/ObjectIcon';
import api from '@/services/metric';
import * as MetricType from '@/services/metric/type';
import createImage from '@/assets/images/common/create.svg';
import emptyImage from '@/assets/images/common/empty.png';
import noSearchResultImage from '@/assets/images/common/no_search_result.svg';
import ENUMS from '@/enums';
import HOOKS from '@/hooks';
import { KnowledgeNetworkType } from '@/services';
import { Table, Button, Title } from '@/web-library/common';
import styles from './index.module.less';

enum OperationEnum {
  View = 'view',
  Edit = 'edit',
  Delete = 'delete',
}

interface TProps {
  detail?: KnowledgeNetworkType.KnowledgeNetwork;
  isPermission: boolean;
}

interface DropdownMenuItem {
  key: string;
  label: string;
  visible: boolean;
}

const Metric: FC<TProps> = ({ detail, isPermission }) => {
  const knId = detail?.id || localStorage.getItem('KnowledgeNetwork.id')!;
  const hasModifyPerm = isPermission;

  const { modal, message } = HOOKS.useGlobalContext();
  const history = useHistory();

  const { pageState, pagination, onUpdateState } = HOOKS.usePageStateNew();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<MetricType.MetricDefinition[]>([]);
  const [tableData, setTableData] = useState<MetricType.MetricDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterValues, setFilterValues] = useState<Pick<MetricType.GetMetricsRequest, 'name_pattern' | 'tag'>>({
    name_pattern: '',
    tag: 'all',
  });
  const { page, limit, direction, sort } = pageState || {};
  const { name_pattern, tag } = filterValues || {};
  const { OBJECT_MENU_SORT_ITEMS } = HOOKS.useConstants();

  const dropdownMenu: DropdownMenuItem[] = [
    { key: OperationEnum.View, label: intl.get('Global.view'), visible: true },
    { key: OperationEnum.Edit, label: intl.get('Global.edit'), visible: hasModifyPerm },
    { key: OperationEnum.Delete, label: intl.get('Global.delete'), visible: hasModifyPerm },
  ];

  const columns = [
    {
      title: intl.get('Global.name'),
      dataIndex: 'name',
      fixed: 'left',
      sorter: true,
      width: 350,
      __fixed: true,
      __selected: true,
      render: (_value: string, _record: MetricType.MetricDefinition) => (
        <div className="g-flex-align-center" style={{ cursor: 'pointer' }} onClick={() => toDetail(_record.id)}>
          <ObjectIcon icon="icon-dip-zhibiaomoxing" color="#126ee3" />
          <div className="g-ellipsis-1 g-ml-2" title={_value}>
            {_value}
          </div>
        </div>
      ),
    },
    {
      title: intl.get('Global.operation'),
      dataIndex: 'operation',
      width: 80,
      __fixed: true,
      __selected: true,
      render: (_value: unknown, record: MetricType.MetricDefinition) => {
        return (
          <Dropdown
            trigger={['click']}
            menu={{
              items: dropdownMenu.filter((item) => item.visible).map(({ key, label }) => ({ key, label })),
              onClick: ({ key, domEvent }: { key: string; domEvent: React.SyntheticEvent }) => {
                domEvent.stopPropagation();
                handleOperationEvent(key, record);
              },
            }}
          >
            <Button.Icon icon={<EllipsisOutlined style={{ fontSize: 20 }} />} onClick={(event: React.MouseEvent) => event.stopPropagation()} />
          </Dropdown>
        );
      },
    },
    {
      title: intl.get('Metric.metricType'),
      dataIndex: 'metric_type',
      width: 120,
      __selected: true,
      render: (_value: MetricType.MetricTypeEnum) => MetricType.METRIC_TYPE_LABELS[_value] || '--',
    },
    {
      title: intl.get('Metric.scopeType'),
      dataIndex: 'scope_type',
      width: 120,
      __selected: true,
      render: (_value: MetricType.ScopeTypeEnum) => MetricType.SCOPE_TYPE_LABELS[_value] || '--',
    },
    {
      title: intl.get('Global.tag'),
      dataIndex: 'tags',
      width: 150,
      __selected: true,
      render: (_value: string[]) => (_value && _value.length ? _value.join(', ') : '--'),
    },
    {
      title: intl.get('Global.modifier'),
      dataIndex: 'updater',
      width: 150,
      __selected: true,
      render: (_value: unknown, record: MetricType.MetricDefinition) => record?.updater?.name || '--',
    },
    {
      title: intl.get('Global.updateTime'),
      dataIndex: 'update_time',
      width: 200,
      sorter: true,
      __selected: true,
      render: (_value: number) => (_value ? dayjs(_value).format('YYYY/MM/DD HH:mm:ss') : '--'),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (nextSelectedRowKeys: string[], nextSelectedRows: MetricType.MetricDefinition[]): void => {
      setSelectedRowKeys(nextSelectedRowKeys);
      setSelectedRows(nextSelectedRows);
    },
  };

  /** 获取列表数据 */
  const getTableData = useCallback(
    async (val?: Record<string, unknown>): Promise<void> => {
      if (!knId) return;
      const postData: MetricType.GetMetricsRequest = {
        offset: val?.page ? limit * ((val.page as number) - 1) : limit * (page - 1),
        limit,
        direction,
        sort,
        name_pattern,
        tag,
        ...(val as MetricType.GetMetricsRequest),
      };
      if (!postData.tag || postData.tag === 'all') delete postData.tag;
      const curPage = (val?.page as number) || page;
      if (val?.page) delete postData.page;
      setIsLoading(true);
      try {
        const res = await api.getMetrics(knId, postData);
        if (!res) return;
        const { total_count, entries } = res;

        onUpdateState({ ...postData, page: curPage, count: total_count });
        setTableData(entries);
        setSelectedRowKeys([]);
        setSelectedRows([]);
      } catch (error) {
        console.error('getTableData error:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [knId, limit, page, direction, sort, name_pattern, tag, onUpdateState]
  );

  useEffect(() => {
    if (knId) {
      getTableData();
    }
  }, [knId]);

  /** 删除指标 */
  const deleteMetric = async (items: MetricType.MetricDefinition[], isBatch?: boolean) => {
    try {
      await api.deleteMetrics(
        knId,
        items.map((item) => item.id)
      );
      getTableData();
      message.success(intl.get('Global.deleteSuccess'));
      if (isBatch) setSelectedRowKeys([]);
    } catch (error) {
      console.error('deleteMetric error:', error);
    }
  };

  const onDeleteConfirm = (items: MetricType.MetricDefinition[], isBatch?: boolean) => {
    if (!items.length || !knId) return;
    const isSingleDelete = items.length === 1;

    showDeleteConfirm(modal, {
      content: isSingleDelete ? intl.get('Global.deleteConfirm', { name: items[0].name }) : intl.get('Global.deleteConfirmMultiple', { count: items.length }),
      async onOk() {
        await deleteMetric(items, isBatch);
      },
    });
  };

  /** 跳转创建和编辑页面 */
  const toCreateOrEdit = (metricId?: string) => {
    if (metricId) {
      history.push(`/ontology/metric/edit/${metricId}?knId=${knId}`);
      return;
    }
    history.push(`/ontology/metric/create?knId=${knId}`);
  };

  /** 点击查看详情 */
  const toDetail = (metricId: string) => {
    history.push(`/ontology/metric/detail/${metricId}?knId=${knId}`, { isPermission });
  };

  /** 操作事件 */
  const handleOperationEvent = (operationKey: string, record: MetricType.MetricDefinition) => {
    switch (operationKey) {
      case OperationEnum.Delete:
        onDeleteConfirm([record]);
        break;
      case OperationEnum.View:
        toDetail(record.id);
        break;
      case OperationEnum.Edit:
        toCreateOrEdit(record.id);
        break;
    }
  };

  /** 筛选条件变更 */
  const onChangeTableOperation = (values: Pick<MetricType.GetMetricsRequest, 'name_pattern' | 'tag'>) => {
    getTableData({ offset: 0, ...values });
    setFilterValues(values);
  };

  /** table 分页排序切换 */
  const handleTableChange: TableProps['onChange'] = async (
    paginationInfo: { current: number; pageSize: number },
    _filters: Record<string, unknown>,
    sorter: SorterResult<MetricType.MetricDefinition>
  ): Promise<void> => {
    const { field, order } = sorter;
    const { current, pageSize } = paginationInfo;
    const stateOrder = ENUMS.SORT_ENUM[order as keyof typeof ENUMS.SORT_ENUM] || 'desc';
    const state = { page: current, limit: pageSize, sort: (field as string) || 'update_time', direction: stateOrder };
    onUpdateState(state);
    getTableData(state);
  };

  const handleSortChange = (val: { key: string }) => {
    const state = {
      sort: val.key,
      direction: val.key !== sort ? 'desc' : direction === 'desc' ? 'asc' : 'desc',
    };
    onUpdateState(state);
    getTableData(state);
  };

  return (
    <div className={styles['metric-root']}>
      <Title>{intl.get('Global.metric')}</Title>
      <Table.PageTable
        name="metric"
        rowKey="id"
        columns={columns}
        loading={isLoading}
        dataSource={tableData}
        rowSelection={rowSelection}
        pagination={pagination}
        onChange={handleTableChange}
        locale={{
          emptyText:
            filterValues.name_pattern || filterValues.tag !== 'all' ? (
              <Empty image={noSearchResultImage} description={intl.get('Global.emptyNoSearchResult')} />
            ) : hasModifyPerm ? (
              <Empty
                image={createImage}
                description={
                  <span>
                    {intl.get('Global.click')}
                    <Button type="link" style={{ padding: 0 }} onClick={() => toCreateOrEdit()}>
                      {intl.get('Global.createBtn')}
                    </Button>
                    {intl.get('Global.add')}
                  </span>
                }
              />
            ) : (
              <Empty image={emptyImage} description={intl.get('Global.noData')} />
            ),
        }}
      >
        <Table.Operation
          nameConfig={{ key: 'name_pattern', placeholder: intl.get('Global.searchNameId') }}
          sortConfig={{ items: OBJECT_MENU_SORT_ITEMS, order: direction, rule: sort, onChange: handleSortChange }}
          initialFilter={filterValues}
          onChange={onChangeTableOperation}
          onRefresh={getTableData}
          isControlFilter
        >
          {hasModifyPerm && <Button.Create onClick={() => toCreateOrEdit()} />}
          {hasModifyPerm && <Button.Delete onClick={() => onDeleteConfirm(selectedRows, true)} disabled={!selectedRows?.length} />}
        </Table.Operation>
      </Table.PageTable>
    </div>
  );
};

export default memo(Metric);