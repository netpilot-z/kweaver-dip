import { useState, useEffect, useRef } from 'react';
import intl from 'react-intl-universal';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import { Form, Input, InputNumber, Select, Button, Card, Spin, Space } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import ObjectIcon from '@/components/ObjectIcon';
import MultistageFilter from '@/components/DataFilterNew';
import api from '@/services/metric';
import objectApi from '@/services/object';
import * as MetricType from '@/services/metric/type';
import * as ObjectType from '@/services/object/type';
import { baseConfig } from '@/services/request';
import HOOKS from '@/hooks';
import { Title } from '@/web-library/common';
import styles from './index.module.less';

// 单位类型枚举（来自后端）
const UNIT_TYPE_OPTIONS = [
  { value: 'numUnit', label: '数值单位' },
  { value: 'storeUnit', label: '存储单位' },
  { value: 'percent', label: '百分比' },
  { value: 'transmissionRate', label: '传输速率' },
  { value: 'timeUnit', label: '时间单位' },
  { value: 'currencyUnit', label: '货币单位' },
  { value: 'percentageUnit', label: '千分比单位' },
  { value: 'countUnit', label: '计数单位' },
  { value: 'weightUnit', label: '重量单位' },
  { value: 'ordinalRankUnit', label: '排名单位' },
];

// 单位枚举（来自后端）
const UNIT_OPTIONS = [
  { value: 'none', label: '无' },
  { value: 'K', label: '千' },
  { value: 'Mil', label: '百万' },
  { value: 'Bil', label: '十亿' },
  { value: 'Tri', label: '万亿' },
  { value: 'times', label: '次' },
  { value: 'transaction', label: '笔' },
  { value: 'piece', label: '件' },
  { value: 'item', label: '项' },
  { value: 'household', label: '户' },
  { value: 'man_day', label: '人天' },
  { value: 'ton', label: '吨' },
  { value: 'kg', label: '千克' },
  { value: 'rank', label: '名' },
  { value: '%', label: '%' },
  { value: '‰', label: '‰' },
  { value: 'CNY', label: '人民币' },
  { value: '10K_CNY', label: '万元' },
  { value: '1M_CNY', label: '百万元' },
  { value: '100M_CNY', label: '亿元' },
  { value: 'USD', label: '美元' },
  { value: 'Fen', label: '分' },
  { value: 'Jiao', label: '角' },
  { value: 'ms', label: '毫秒' },
  { value: 's', label: '秒' },
  { value: 'm', label: '分钟' },
  { value: 'h', label: '小时' },
  { value: 'day', label: '天' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'year', label: '年' },
];

const MetricCreate = () => {
  const history = useHistory();
  const location = useLocation();
  const params = useParams<{ metricId?: string }>();
  const { metricId } = params || {};
  const isEditPage = !!metricId;
  // 从 URL query 或 localStorage 获取 knId
  const query = new URLSearchParams(location.search);
  const knId = query.get('knId') || localStorage.getItem('KnowledgeNetwork.id') || '';
  const { message } = HOOKS.useGlobalContext();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // 对象类列表
  const [objectTypeList, setObjectTypeList] = useState<ObjectType.Detail[]>([]);
  // 选中对象类的属性列表
  const [objectProperties, setObjectProperties] = useState<ObjectType.DataProperty[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  // 选中对象类的作用域引用，用于过滤条件组件
  const [scopeRef, setScopeRef] = useState<string>('');
  // 选中聚合属性的类型，用于过滤聚合函数
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);
  // 过滤条件
  const filterRef = useRef<{ validate: (required: boolean) => boolean }>();
  const [conditionValue, setConditionValue] = useState<any>();

  const { METRIC_TYPE_LABELS, SCOPE_TYPE_LABELS, AGGR_LABELS } = MetricType;

  // 数值类型的聚合函数
  const NUMERIC_AGGR_OPTIONS = ['sum', 'avg', 'max', 'min', 'count', 'count_distinct'];
  // 非数值类型的聚合函数
  const NON_NUMERIC_AGGR_OPTIONS = ['count', 'count_distinct'];

  // 根据选中属性的类型获取可选的聚合函数
  const getAvailableAggrOptions = () => {
    if (!selectedPropertyType) return Object.entries(AGGR_LABELS);

    // 数值类型包括：int, float, double, long, number, decimal
    const numericTypes = ['int', 'float', 'double', 'long', 'number', 'decimal', 'INT', 'FLOAT', 'DOUBLE', 'LONG', 'NUMBER', 'DECIMAL'];
    const isNumeric = numericTypes.some((t) => selectedPropertyType.toLowerCase().includes(t.toLowerCase()));

    const availableKeys = isNumeric ? NUMERIC_AGGR_OPTIONS : NON_NUMERIC_AGGR_OPTIONS;
    return Object.entries(AGGR_LABELS).filter(([key]) => availableKeys.includes(key));
  };

  // 聚合属性只展示数值类型（所有单位类型都要求数值属性）
  const NUMERIC_TYPES = ['int', 'float', 'double', 'long', 'number', 'decimal'];

  const filteredAggregationProperties = objectProperties.filter((prop) => NUMERIC_TYPES.some((t) => prop.type?.toLowerCase().includes(t.toLowerCase())));

  // 日期/时间类型的属性（用于时间维度）
  const timeProperties = objectProperties.filter((prop) => {
    const timeTypes = ['date', 'datetime', 'timestamp', 'time', 'DATE', 'DATETIME', 'TIMESTAMP', 'TIME'];
    return timeTypes.some((t) => prop.type?.toLowerCase().includes(t.toLowerCase()));
  });

  // 监听聚合属性变化，更新属性类型并清空聚合类型
  const handleAggregationPropertyChange = (propertyName: string) => {
    const prop = objectProperties.find((p) => p.name === propertyName);
    setSelectedPropertyType(prop?.type || null);
    form.setFieldsValue({ aggregation_aggr: undefined });
  };

  // 监听单位类型变化，清空已选的聚合属性
  const handleUnitTypeChange = () => {
    form.setFieldsValue({ aggregation_property: undefined, aggregation_aggr: undefined });
    setSelectedPropertyType(null);
  };

  const goBack = () => {
    history.goBack();
  };

  // 加载对象类列表
  const loadObjectTypes = async () => {
    if (!knId) return;
    try {
      const res = await objectApi.objectGet(knId, { offset: 0, limit: 100 });
      setObjectTypeList(res?.entries || []);
    } catch (error) {
      console.error('loadObjectTypes error:', error);
    }
  };

  // 加载对象类属性列表
  const loadObjectProperties = async (objectTypeId: string, initialPropertyName?: string) => {
    if (!knId || !objectTypeId) {
      setObjectProperties([]);
      setSelectedPropertyType(null);
      return;
    }
    setLoadingProperties(true);
    try {
      const res = await objectApi.getDetail(knId, [objectTypeId]);
      const detail = res?.[0];
      const properties = detail?.data_properties || [];
      setObjectProperties(properties);
      // 如果有初始属性名，设置其类型
      if (initialPropertyName) {
        const prop = properties.find((p) => p.name === initialPropertyName);
        setSelectedPropertyType(prop?.type || null);
      }
    } catch (error) {
      console.error('loadObjectProperties error:', error);
      setObjectProperties([]);
      setSelectedPropertyType(null);
    } finally {
      setLoadingProperties(false);
    }
  };

  const getDetail = async () => {
    if (!knId || !metricId) return;
    setLoading(true);
    try {
      const res = await api.getMetricDetail(knId, metricId);
      form.setFieldsValue({
        name: res.name,
        comment: res.comment,
        metric_type: res.metric_type,
        scope_type: res.scope_type,
        scope_ref: res.scope_ref,
        unit_type: res.unit_type,
        unit: res.unit,
        tags: res.tags?.join(','),
        aggregation_property: res.calculation_formula?.aggregation?.property,
        aggregation_aggr: res.calculation_formula?.aggregation?.aggr,
        // 分组维度
        group_by: res.calculation_formula?.group_by?.map((g) => g.property) || [],
        // 排序配置
        order_by_property: res.calculation_formula?.order_by?.[0]?.property,
        order_by_direction: res.calculation_formula?.order_by?.[0]?.direction || MetricType.DirectionEnum.DESC,
        // Having 条件
        having_field: res.calculation_formula?.having?.field,
        having_operation: res.calculation_formula?.having?.operation,
        having_value: res.calculation_formula?.having?.value,
        // 时间维度
        time_dimension_property: res.time_dimension?.property,
        time_dimension_policy: res.time_dimension?.default_range_policy,
        // 分析维度
        analysis_dimensions: res.analysis_dimensions?.map((d) => d.name) || [],
      });
      // 设置过滤条件
      if (res.calculation_formula?.condition) {
        setConditionValue(res.calculation_formula.condition);
      }
      // 记录当前 scopeRef
      if (res.scope_ref) {
        setScopeRef(res.scope_ref);
      }
      // 加载选中对象类的属性列表，并设置初始属性类型
      if (res.scope_ref) {
        loadObjectProperties(res.scope_ref, res.calculation_formula?.aggregation?.property);
      }
    } catch (error) {
      console.error('getMetricDetail error:', error);
      message.error(intl.get('Global.loadDataFailed'));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: Record<string, unknown>) => {
    if (!knId) return;
    setSubmitting(true);

    // 构建分组维度
    const groupByProperties = (values.group_by as string[])?.filter(Boolean) || [];
    const groupBy = groupByProperties.length > 0
      ? groupByProperties.map((prop) => ({ property: prop, description: '' }))
      : undefined;

    // 构建排序配置
    const orderByProperty = values.order_by_property as string;
    const orderByDirection = values.order_by_direction as MetricType.DirectionEnum | undefined;
    const orderBy = orderByProperty
      ? [{ property: orderByProperty, direction: orderByDirection || MetricType.DirectionEnum.DESC }]
      : undefined;

    // 构建 Having 条件
    const havingField = values.having_field as '__value' | undefined;
    const havingOperation = values.having_operation as '==' | '!=' | '>' | '>=' | '<' | '<=' | 'in' | 'not_in' | 'range' | 'out_range' | undefined;
    const rawHavingValue = values.having_value;
    const havingValue = rawHavingValue !== undefined && rawHavingValue !== null && rawHavingValue !== '' ? Number(rawHavingValue) : undefined;
    const having =
      havingField && havingOperation && havingValue !== undefined
        ? ({ field: havingField, operation: havingOperation, value: havingValue } as MetricType.MetricHaving)
        : undefined;

    // 构建分析维度
    const analysisDimNames = (values.analysis_dimensions as string[])?.filter(Boolean) || [];
    const analysisDimensions = analysisDimNames.length > 0
      ? analysisDimNames.map((name) => ({ name, display_name: '' }))
      : undefined;

    const postData: MetricType.CreateMetricRequest = {
      name: values.name as string,
      ...(values.comment ? { comment: values.comment as string } : {}),
      metric_type: values.metric_type as MetricType.MetricTypeEnum,
      scope_type: values.scope_type as MetricType.ScopeTypeEnum,
      scope_ref: values.scope_ref as string,
      ...(values.unit_type ? { unit_type: values.unit_type as string } : {}),
      ...(values.unit ? { unit: values.unit as string } : {}),
      tags: values.tags ? (values.tags as string).split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      calculation_formula: {
        aggregation: {
          property: values.aggregation_property as string,
          aggr: values.aggregation_aggr as MetricType.AggrEnum,
        },
        ...(conditionValue?.field || conditionValue?.sub_conditions?.length ? { condition: conditionValue } : {}),
        ...(groupBy ? { group_by: groupBy } : {}),
        ...(orderBy ? { order_by: orderBy } : {}),
        ...(having ? { having } : {}),
      },
      ...(values.time_dimension_property
        ? {
            time_dimension: {
              property: values.time_dimension_property as string,
              default_range_policy: values.time_dimension_policy as MetricType.DefaultRangePolicyEnum,
            },
          }
        : {}),
      ...(analysisDimensions ? { analysis_dimensions: analysisDimensions } : {}),
    };

    try {
      if (isEditPage) {
        await api.updateMetric(knId, metricId!, postData, false);
        message.success(intl.get('Global.updateSuccess'));
      } else {
        await api.createMetric(knId, postData, false);
        message.success(intl.get('Global.createSuccess'));
      }
      goBack();
    } catch (error) {
      console.error('submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // 监听作用域引用变化，加载对应对象类的属性
  const handleScopeRefChange = (value: string) => {
    setScopeRef(value);
    // 清空所有依赖属性的配置（包括单位类型，避免残留过滤）
    form.setFieldsValue({
      aggregation_property: undefined,
      aggregation_aggr: undefined,
      group_by: undefined,
      order_by_property: undefined,
      order_by_direction: undefined,
      having_field: undefined,
      having_operation: undefined,
      having_value: undefined,
      time_dimension_property: undefined,
      time_dimension_policy: undefined,
      analysis_dimensions: undefined,
      unit_type: undefined,
      unit: undefined,
    });
    setSelectedPropertyType(null);
    setConditionValue(undefined); // 清空过滤条件
    // 加载属性列表
    loadObjectProperties(value);
  };

  useEffect(() => {
    baseConfig?.toggleSideBarShow(false);
    return () => {
      baseConfig?.toggleSideBarShow(true);
    };
  }, []);

  useEffect(() => {
    if (knId) {
      loadObjectTypes();
    }
  }, [knId]);

  useEffect(() => {
    if (isEditPage && knId && metricId) {
      getDetail();
    }
  }, [isEditPage, knId, metricId]);

  return (
    <div className={styles['metric-create-page']}>
      <div className={styles['page-header']}>
        <LeftOutlined onClick={goBack} className={styles['back-icon']} />
        <ObjectIcon icon="icon-dip-zhibiaomoxing" color="#126ee3" />
        <h4>{isEditPage ? intl.get('Global.edit') : intl.get('Global.create')}{intl.get('Global.metric')}</h4>
      </div>

      <Spin spinning={loading}>
        <Card className={styles['form-card']}>
          <Title className={styles['form-title']}>{intl.get('Global.basicInfo')}</Title>
          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            initialValues={{ metric_type: MetricType.MetricTypeEnum.Atomic, scope_type: MetricType.ScopeTypeEnum.ObjectType }}
          >
            <Form.Item
              name="name"
              label={intl.get('Global.name')}
              rules={[{ required: true, message: intl.get('Global.nameCannotNull') }, { max: 40, message: intl.get('Global.maxLength40') }]}
            >
              <Input placeholder={intl.get('Global.pleaseInputName')} />
            </Form.Item>

            <Form.Item name="metric_type" label={intl.get('Metric.metricType')} rules={[{ required: true }]}>
              <Select placeholder={intl.get('Global.pleaseSelect')} disabled>
                {/* 当前仅 atomic 允许写入 */}
                <Select.Option key="atomic" value="atomic">
                  {METRIC_TYPE_LABELS['atomic']}
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="scope_type" label={intl.get('Metric.scopeType')} rules={[{ required: true }]}>
              <Select placeholder={intl.get('Global.pleaseSelect')}>
                {Object.entries(SCOPE_TYPE_LABELS).map(([key, label]) => (
                  <Select.Option key={key} value={key}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* 作用域引用：对象类选择 */}
            <Form.Item name="scope_ref" label={intl.get('Metric.scopeRef')} rules={[{ required: true, message: intl.get('Global.cannotBeNull') }]}>
              <Select
                placeholder={intl.get('Metric.scopeRefPlaceholder')}
                showSearch
                optionFilterProp="children"
                onChange={handleScopeRefChange}
              >
                {objectTypeList.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ObjectIcon icon={item.icon} color={item.color} size={16} />
                      <span>{item.name}</span>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="unit_type" label={intl.get('Metric.unitType')}>
              <Select placeholder={intl.get('Metric.unitTypePlaceholder')} allowClear showSearch optionFilterProp="label" onChange={handleUnitTypeChange}>
                {UNIT_TYPE_OPTIONS.map((opt) => (
                  <Select.Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="unit" label={intl.get('Metric.unit')}>
              <Select placeholder={intl.get('Metric.unitPlaceholder')} allowClear showSearch optionFilterProp="label">
                {UNIT_OPTIONS.map((opt) => (
                  <Select.Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="tags" label={intl.get('Global.tag')}>
              <Input placeholder={intl.get('Metric.tagsPlaceholder')} />
            </Form.Item>

            <Form.Item name="comment" label={intl.get('Global.comment')}>
              <Input.TextArea rows={3} placeholder={intl.get('Global.pleaseInputComment')} />
            </Form.Item>

            <Title className={styles['form-title']}>{intl.get('Metric.calculationFormula')}</Title>

            {/* 聚合属性：对象类属性选择（根据单位类型过滤） */}
            <Form.Item
              name="aggregation_property"
              label={intl.get('Metric.aggregationProperty')}
              rules={[{ required: true, message: intl.get('Global.cannotBeNull') }]}
            >
              <Select
                placeholder={intl.get('Metric.aggregationPropertyPlaceholder')}
                showSearch
                optionFilterProp="children"
                loading={loadingProperties}
                disabled={!filteredAggregationProperties.length}
                onChange={handleAggregationPropertyChange}
              >
                {filteredAggregationProperties.map((prop) => (
                  <Select.Option key={prop.name} value={prop.name}>
                    {prop.display_name || prop.name} ({prop.type || 'unknown'})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="aggregation_aggr" label={intl.get('Metric.aggregationType')} rules={[{ required: true, message: intl.get('Global.cannotBeNull') }]}>
              <Select placeholder={intl.get('Global.pleaseSelect')}>
                {getAvailableAggrOptions().map(([key, label]) => (
                  <Select.Option key={key} value={key}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* 过滤条件 */}
            <Form.Item label={intl.get('Metric.filterCondition')}>
              <MultistageFilter
                key={scopeRef}
                ref={filterRef}
                objectOptions={
                  scopeRef
                    ? objectTypeList
                        .filter((item) => item.id === scopeRef)
                        .map((item) => ({
                          ...item,
                          data_properties: objectProperties,
                        }))
                    : []
                }
                value={conditionValue}
                onChange={setConditionValue}
                disabled={!objectProperties.length}
                defaultValue={{ object_type_id: scopeRef, field: undefined, value: null, operation: undefined, value_from: 'const' }}
              />
            </Form.Item>

            {/* 分组维度 */}
            <Form.Item name="group_by" label={intl.get('Metric.groupBy')}>
              <Select
                mode="multiple"
                placeholder={intl.get('Metric.groupByPlaceholder')}
                allowClear
                disabled={!objectProperties.length}
              >
                {objectProperties.map((prop) => (
                  <Select.Option key={prop.name} value={prop.name}>
                    {prop.display_name || prop.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* 排序配置 */}
            <Form.Item label={intl.get('Metric.orderBy')}>
              <Space>
                <Form.Item name="order_by_property" noStyle>
                  <Select
                    placeholder={intl.get('Metric.orderByPropertyPlaceholder')}
                    allowClear
                    disabled={!objectProperties.length}
                    style={{ width: 200 }}
                  >
                    {objectProperties.map((prop) => (
                      <Select.Option key={prop.name} value={prop.name}>
                        {prop.display_name || prop.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item name="order_by_direction" noStyle>
                  <Select placeholder={intl.get('Global.pleaseSelect')} allowClear style={{ width: 100 }}>
                    <Select.Option value="asc">{intl.get('Metric.orderAsc')}</Select.Option>
                    <Select.Option value="desc">{intl.get('Metric.orderDesc')}</Select.Option>
                  </Select>
                </Form.Item>
              </Space>
            </Form.Item>

            {/* Having 条件 */}
            <Form.Item label={intl.get('Metric.having')}>
              <Space>
                <Form.Item name="having_field" noStyle>
                  <Select placeholder={intl.get('Metric.havingFieldPlaceholder')} allowClear style={{ width: 120 }}>
                    <Select.Option value="__value">{intl.get('Metric.havingFieldValue')}</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="having_operation" noStyle>
                  <Select placeholder={intl.get('Metric.havingOperationPlaceholder')} allowClear style={{ width: 100 }}>
                    <Select.Option value=">">{intl.get('Metric.havingGt')}</Select.Option>
                    <Select.Option value=">=">{intl.get('Metric.havingGte')}</Select.Option>
                    <Select.Option value="<">{intl.get('Metric.havingLt')}</Select.Option>
                    <Select.Option value="<=">{intl.get('Metric.havingLte')}</Select.Option>
                    <Select.Option value="==">{intl.get('Metric.havingEq')}</Select.Option>
                    <Select.Option value="!=">{intl.get('Metric.havingNeq')}</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="having_value" noStyle>
                  <InputNumber placeholder={intl.get('Metric.havingValuePlaceholder')} style={{ width: 150 }} />
                </Form.Item>
              </Space>
            </Form.Item>

            <Title className={styles['form-title']}>{intl.get('Metric.timeDimension')}</Title>

            {/* 时间属性：对象类属性选择（仅日期/时间类型） */}
            <Form.Item name="time_dimension_property" label={intl.get('Metric.timeProperty')}>
              <Select
                placeholder={intl.get('Metric.timePropertyPlaceholder')}
                showSearch
                optionFilterProp="children"
                allowClear
                disabled={!timeProperties.length}
              >
                {timeProperties.map((prop) => (
                  <Select.Option key={prop.name} value={prop.name}>
                    {prop.display_name || prop.name} ({prop.type || 'unknown'})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="time_dimension_policy" label={intl.get('Metric.defaultRangePolicy')}>
              <Select placeholder={intl.get('Global.pleaseSelect')} allowClear>
                <Select.Option value="last_1h">{intl.get('Metric.last1h')}</Select.Option>
                <Select.Option value="last_24h">{intl.get('Metric.last24h')}</Select.Option>
                <Select.Option value="calendar_day">{intl.get('Metric.calendarDay')}</Select.Option>
                <Select.Option value="none">{intl.get('Metric.none')}</Select.Option>
              </Select>
            </Form.Item>

            <Title className={styles['form-title']}>{intl.get('Metric.analysisDimensions')}</Title>

            {/* 分析维度 */}
            <Form.Item name="analysis_dimensions" label={intl.get('Metric.analysisDimensionsLabel')}>
              <Select
                mode="multiple"
                placeholder={intl.get('Metric.analysisDimensionsPlaceholder')}
                allowClear
                disabled={!objectProperties.length}
              >
                {objectProperties.map((prop) => (
                  <Select.Option key={prop.name} value={prop.name}>
                    {prop.display_name || prop.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item className={styles['form-actions']}>
              <Button style={{ marginRight: 12 }} onClick={goBack}>
                {intl.get('Global.cancel')}
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {intl.get('Global.save')}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default MetricCreate;