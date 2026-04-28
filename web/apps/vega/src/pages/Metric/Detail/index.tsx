import { useEffect, useState } from 'react';
import intl from 'react-intl-universal';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import { LeftOutlined, EllipsisOutlined } from '@ant-design/icons';
import { Descriptions, Dropdown, Empty, Spin, Tag, Tabs } from 'antd';
import DetailPageHeader from '@/components/DetailPageHeader';
import ObjectIcon from '@/components/ObjectIcon';
import api from '@/services/metric';
import * as MetricType from '@/services/metric/type';
import { baseConfig } from '@/services/request';
import HOOKS from '@/hooks';
import { Button, IconFont } from '@/web-library/common';
import MetricDataQuery from '../DataQuery';
import styles from './index.module.less';

const MetricDetail = () => {
  const history = useHistory();
  const location = useLocation();
  const { metricId } = useParams<{ metricId: string }>();
  // 从 URL query 或 localStorage 获取 knId
  const query = new URLSearchParams(location.search);
  const knId = query.get('knId') || localStorage.getItem('KnowledgeNetwork.id') || '';
  const { message } = HOOKS.useGlobalContext();

  const [detail, setDetail] = useState<MetricType.MetricDefinition>();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('info');

  const getDetail = async () => {
    if (!knId || !metricId) return;
    setLoading(true);
    try {
      const res = await api.getMetricDetail(knId, metricId);
      setDetail(res);
    } catch (error) {
      console.error('getMetricDetail error:', error);
      message.error(intl.get('Global.loadDataFailed'));
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    history.push(`/ontology/main/metric?id=${knId}`);
  };

  const handleEdit = () => {
    history.push(`/ontology/metric/edit/${metricId}?knId=${knId}`);
  };

  const handleDelete = () => {
    HOOKS.useGlobalContext().modal.confirm({
      title: intl.get('Global.tipTitle'),
      content: intl.get('Global.deleteConfirm', { name: detail?.name || '' }),
      okText: intl.get('Global.ok'),
      cancelText: intl.get('Global.cancel'),
      onOk: async () => {
        try {
          await api.deleteMetric(knId, metricId);
          message.success(intl.get('Global.deleteSuccess'));
          goBack();
        } catch (error) {
          console.error('deleteMetric error:', error);
          message.error(intl.get('Global.deleteFailed'));
        }
      },
    });
  };

  useEffect(() => {
    baseConfig?.toggleSideBarShow(false);
    return () => {
      baseConfig?.toggleSideBarShow(true);
    };
  }, []);

  useEffect(() => {
    if (knId && metricId) {
      getDetail();
    }
  }, [knId, metricId]);

  if (loading) {
    return (
      <div className={styles['metric-detail-page']}>
        <Spin spinning={loading} className={styles['loading-spin']}>
          <Empty />
        </Spin>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className={styles['metric-detail-page']}>
        <Empty description={intl.get('Global.noData')} />
      </div>
    );
  }

  const dropdownMenu = [{ key: 'delete', label: intl.get('Global.delete') }];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'delete') {
      handleDelete();
    }
  };

  const { METRIC_TYPE_LABELS, SCOPE_TYPE_LABELS, AGGR_LABELS } = MetricType;

  // 基本信息 Tab 内容
  const renderInfoTab = () => (
    <>
      <div className={styles['section-card']}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label={intl.get('Metric.metricType')}>
            {METRIC_TYPE_LABELS[detail.metric_type] || '--'}
          </Descriptions.Item>
          <Descriptions.Item label={intl.get('Metric.scopeType')}>
            {SCOPE_TYPE_LABELS[detail.scope_type] || '--'}
          </Descriptions.Item>
          <Descriptions.Item label={intl.get('Metric.scopeRef')}>{detail.scope_ref || '--'}</Descriptions.Item>
          <Descriptions.Item label={intl.get('Global.tag')}>
            {detail.tags?.length ? detail.tags.map((tag) => <Tag key={tag}>{tag}</Tag>) : '--'}
          </Descriptions.Item>
          <Descriptions.Item label={intl.get('Metric.unitType')}>{detail.unit_type || '--'}</Descriptions.Item>
          <Descriptions.Item label={intl.get('Metric.unit')}>{detail.unit || '--'}</Descriptions.Item>
          <Descriptions.Item label={intl.get('Global.comment')} span={2}>
            {detail.comment || '--'}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* 计算公式 */}
      <div className={styles['section-card']}>
        <h3 className={styles['section-title']}>{intl.get('Metric.calculationFormula')}</h3>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label={intl.get('Metric.aggregation')}>
            {AGGR_LABELS[detail.calculation_formula?.aggregation?.aggr] || '--'} ({detail.calculation_formula?.aggregation?.property || '--'})
          </Descriptions.Item>
          <Descriptions.Item label={intl.get('Metric.groupBy')}>
            {detail.calculation_formula?.group_by?.length
              ? detail.calculation_formula.group_by.map((g) => g.property).join(', ')
              : '--'}
          </Descriptions.Item>
          <Descriptions.Item label={intl.get('Metric.orderBy')} span={2}>
            {detail.calculation_formula?.order_by?.length
              ? detail.calculation_formula.order_by.map((o) => `${o.property} (${o.direction})`).join(', ')
              : '--'}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* 时间维度 */}
      {detail.time_dimension && (
        <div className={styles['section-card']}>
          <h3 className={styles['section-title']}>{intl.get('Metric.timeDimension')}</h3>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label={intl.get('Metric.timeProperty')}>
              {detail.time_dimension.property || '--'}
            </Descriptions.Item>
            <Descriptions.Item label={intl.get('Metric.defaultRangePolicy')}>
              {detail.time_dimension.default_range_policy || '--'}
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}

      {/* 分析维度 */}
      {detail.analysis_dimensions?.length && (
        <div className={styles['section-card']}>
          <h3 className={styles['section-title']}>{intl.get('Metric.analysisDimensions')}</h3>
          <Descriptions column={2} bordered size="small">
            {detail.analysis_dimensions.map((dim, index) => (
              <Descriptions.Item key={index} label={dim.display_name || dim.name}>
                {dim.name}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </div>
      )}
    </>
  );

  // Tab 配置
  const tabItems = [
    { key: 'info', label: intl.get('Metric.tabInfo'), children: renderInfoTab() },
    { key: 'query', label: intl.get('Metric.tabDataQuery'), children: <MetricDataQuery knId={knId} metricId={metricId} metricDetail={detail} /> },
  ];

  return (
    <div className={styles['metric-detail-page']}>
      <DetailPageHeader
        onBack={goBack}
        icon={<ObjectIcon icon="icon-dip-zhibiaomoxing" color="#126ee3" />}
        title={detail.name}
        actions={
          <>
            <Button className={styles['top-edit-btn']} icon={<IconFont type="icon-dip-bianji" />} onClick={handleEdit}>
              {intl.get('Global.edit')}
            </Button>
            <Dropdown trigger={['click']} menu={{ items: dropdownMenu, onClick: handleMenuClick }}>
              <Button className={styles['top-more-btn']} icon={<EllipsisOutlined style={{ fontSize: 20 }} />} />
            </Dropdown>
          </>
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className={styles['detail-tabs']}
      />
    </div>
  );
};

export default MetricDetail;