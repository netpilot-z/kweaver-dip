import { useState, useEffect, useRef } from 'react';
import intl from 'react-intl-universal';
import { Card, Spin, Radio, DatePicker, Select, Button, Empty, Space, InputNumber, Tag, Switch, Alert } from 'antd';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, TitleComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import dayjs, { Dayjs } from 'dayjs';
import api from '@/services/metric';
import * as MetricType from '@/services/metric/type';
import { DATE_FORMAT } from '@/hooks/useConstants';
import styles from './index.module.less';

echarts.use([LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, TitleComponent, CanvasRenderer]);

interface MetricDataQueryProps {
  knId: string;
  metricId: string;
  metricDetail?: MetricType.MetricDefinition;
}

// 时间范围快捷选项
const TIME_RANGE_OPTIONS = [
  { value: 'last_1h', label: intl.get('Metric.last1h') },
  { value: 'last_24h', label: intl.get('Metric.last24h') },
  { value: 'last_7d', label: intl.get('Metric.last7d') },
  { value: 'last_30d', label: intl.get('Metric.last30d') },
  { value: 'calendar_day', label: intl.get('Metric.calendarDay') },
  { value: 'custom', label: intl.get('Metric.customRange') },
];

// 同环比时间粒度选项
const TIME_GRANULARITY_OPTIONS = [
  { value: 'day', label: intl.get('Metric.granularityDay') },
  { value: 'month', label: intl.get('Metric.granularityMonth') },
  { value: 'quarter', label: intl.get('Metric.granularityQuarter') },
  { value: 'year', label: intl.get('Metric.granularityYear') },
];

// 同环比计算方法选项
const SAME_PERIOD_METHOD_OPTIONS = [
  { value: 'growth_value', label: intl.get('Metric.growthValue') },
  { value: 'growth_rate', label: intl.get('Metric.growthRate') },
];

const MetricDataQuery: React.FC<MetricDataQueryProps> = ({ knId, metricId, metricDetail }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MetricType.MetricDataResponse>();
  const [error, setError] = useState<string>();

  // 查询参数
  const [queryMode, setQueryMode] = useState<MetricType.MetricQueryMode>('instant');
  const [timeRange, setTimeRange] = useState<string>('last_24h');
  const [customStartTime, setCustomStartTime] = useState<Dayjs>();
  const [customEndTime, setCustomEndTime] = useState<Dayjs>();
  const [limit, setLimit] = useState<number>(100);
  const [fillNull, setFillNull] = useState<boolean>(false);

  // 同环比配置
  const [samePeriodMethod, setSamePeriodMethod] = useState<MetricType.SamePeriodMethod>('growth_value');
  const [samePeriodGranularity, setSamePeriodGranularity] = useState<MetricType.SamePeriodTimeGranularity>('day');
  const [samePeriodOffset, setSamePeriodOffset] = useState<number>(1);

  // 图表实例
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  // 计算时间范围
  const getTimeWindow = (): MetricType.MetricTimeWindow => {
    const now = Date.now();
    const oneHour = 3600000;
    const oneDay = 86400000;

    if (timeRange === 'custom' && customStartTime && customEndTime) {
      return { start: customStartTime.valueOf(), end: customEndTime.valueOf(), instant: false };
    }

    switch (timeRange) {
      case 'last_1h':
        return { start: now - oneHour, end: now, instant: false };
      case 'last_24h':
        return { start: now - oneDay, end: now, instant: false };
      case 'last_7d':
        return { start: now - 7 * oneDay, end: now, instant: false };
      case 'last_30d':
        return { start: now - 30 * oneDay, end: now, instant: false };
      case 'calendar_day':
        const startOfDay = dayjs().startOf('day').valueOf();
        return { start: startOfDay, end: now, instant: false };
      default:
        return { start: now - oneDay, end: now, instant: false };
    }
  };

  // 构建查询请求
  const buildQueryRequest = (): MetricType.MetricQueryRequest => {
    const timeWindow = getTimeWindow();
    const request: MetricType.MetricQueryRequest = {
      time: queryMode === 'instant' ? { ...timeWindow, instant: true } : timeWindow,
      limit,
    };

    // 同环比配置 - method 必须是数组，offset 和 time_granularity 必填
    if (queryMode === 'sameperiod') {
      request.metrics = {
        type: 'sameperiod',
        sameperiod_config: {
          method: [samePeriodMethod], // API 要求 method 为数组
          offset: samePeriodOffset,
          time_granularity: samePeriodGranularity,
        },
      };
    }

    // 占比配置
    if (queryMode === 'proportion') {
      request.metrics = {
        type: 'proportion',
      };
    }

    return request;
  };

  // 执行查询
  const executeQuery = async () => {
    if (!knId || !metricId) return;
    setLoading(true);
    setError(undefined);
    try {
      const request = buildQueryRequest();
      const response = await api.queryMetricData(knId, metricId, request, fillNull);
      setData(response);
    } catch (error: any) {
      console.error('queryMetricData error:', error);
      const errorMsg = error?.response?.data?.detail || error?.message || intl.get('Metric.queryFailed');
      setError(errorMsg);
      setData(undefined);
    } finally {
      setLoading(false);
    }
  };

  // 初始化图表
  const initChart = () => {
    if (!chartRef.current || !data?.datas?.length) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // 先清除旧的配置，避免切换图表类型时配置残留
    chartInstance.current.clear();

    const metricData = data.datas[0];

    if (queryMode === 'instant') {
      // 即时查询：显示单值卡片，不需要图表
      return;
    }

    if (queryMode === 'proportion') {
      // 占比分析：饼图
      const pieData = metricData.values?.map((value, index) => ({
        name: metricData.labels?.[index] || `${intl.get('Metric.item')}${index + 1}`,
        value: value,
      })) || [];

      const option = {
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
            label: { show: true, formatter: '{b}: {d}%' },
            emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
            data: pieData,
          },
        ],
      };
      chartInstance.current.setOption(option);
      return;
    }

    if (queryMode === 'sameperiod') {
      // 同环比分析：双轴折线图
      const times = metricData.time_strs || metricData.times || [];
      const xData = times.map((t) => (typeof t === 'number' ? dayjs(t).format(DATE_FORMAT.FULL_TIMESTAMP) : t));

      const series: any[] = [
        { name: intl.get('Metric.currentValue'), type: 'line', data: metricData.values, smooth: true },
      ];

      if (samePeriodMethod === 'growth_value' && metricData.growth_values) {
        series.push({ name: intl.get('Metric.growthValue'), type: 'line', data: metricData.growth_values, smooth: true });
      }
      if (samePeriodMethod === 'growth_rate' && metricData.growth_rates) {
        series.push({ name: intl.get('Metric.growthRate'), type: 'line', yAxisIndex: 1, smooth: true, data: metricData.growth_rates });
      }

      const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: series.map((s) => s.name) },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: xData },
        yAxis: [
          { type: 'value', name: intl.get('Metric.value') },
          { type: 'value', name: intl.get('Metric.rate'), show: samePeriodMethod === 'growth_rate' },
        ],
        series,
        dataZoom: [{ type: 'slider' }, { type: 'inside' }],
      };
      chartInstance.current.setOption(option);
      return;
    }

    // 趋势查询：折线图
    const times = metricData.time_strs || metricData.times || [];
    const xData = times.map((t) => (typeof t === 'number' ? dayjs(t).format(DATE_FORMAT.FULL_TIMESTAMP) : t));

    const option = {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: xData },
      yAxis: { type: 'value', name: intl.get('Metric.value') },
      series: [{ type: 'line', data: metricData.values, smooth: true, areaStyle: { opacity: 0.3 } }],
      dataZoom: [{ type: 'slider' }, { type: 'inside' }],
    };
    chartInstance.current.setOption(option);
  };

  // 窗口 resize
  useEffect(() => {
    const handleResize = () => {
      if (chartInstance.current) chartInstance.current.resize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 数据更新时重新绘制图表
  useEffect(() => {
    initChart();
  }, [data, queryMode, samePeriodMethod]);

  // 组件卸载时销毁图表实例
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = undefined;
      }
    };
  }, []);

  // 渲染即时查询结果卡片
  const renderInstantResult = () => {
    if (!data?.datas?.length) return null;
    const value = data.datas[0].values?.[0];
    const labels = data.datas[0].labels;

    return (
      <Card className={styles['instant-card']}>
        <div className={styles['instant-value']}>
          <span className={styles['value-number']}>{value ?? '--'}</span>
          <span className={styles['value-unit']}>{metricDetail?.unit || ''}</span>
        </div>
        {labels && Object.keys(labels).length > 0 && (
          <div className={styles['instant-labels']}>
            {Object.entries(labels).map(([key, val]) => (
              <Tag key={key}>{key}: {val}</Tag>
            ))}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className={styles['metric-data-query']}>
      {/* 查询参数配置 */}
      <Card className={styles['query-config-card']}>
        <div className={styles['config-section']}>
          {/* 查询模式 */}
          <div className={styles['config-item']}>
            <span className={styles['config-label']}>{intl.get('Metric.queryMode')}:</span>
            <Radio.Group value={queryMode} onChange={(e) => setQueryMode(e.target.value)}>
              <Radio.Button value="instant">{intl.get('Metric.queryInstant')}</Radio.Button>
              <Radio.Button value="trend">{intl.get('Metric.queryTrend')}</Radio.Button>
              <Radio.Button value="sameperiod">{intl.get('Metric.querySamePeriod')}</Radio.Button>
              <Radio.Button value="proportion">{intl.get('Metric.queryProportion')}</Radio.Button>
            </Radio.Group>
          </div>

          {/* 时间范围（非即时查询） */}
          {queryMode !== 'instant' && (
            <div className={styles['config-item']}>
              <span className={styles['config-label']}>{intl.get('Metric.timeRange')}:</span>
              <Select value={timeRange} onChange={setTimeRange} style={{ width: 150 }} options={TIME_RANGE_OPTIONS} />
              {timeRange === 'custom' && (
                <Space style={{ marginLeft: 8 }}>
                  <DatePicker
                    showTime
                    value={customStartTime}
                    onChange={setCustomStartTime}
                    placeholder={intl.get('Metric.startTime')}
                  />
                  <DatePicker
                    showTime
                    value={customEndTime}
                    onChange={setCustomEndTime}
                    placeholder={intl.get('Metric.endTime')}
                  />
                </Space>
              )}
            </div>
          )}

          {/* 同环比配置 */}
          {queryMode === 'sameperiod' && (
            <div className={styles['config-item']}>
              <span className={styles['config-label']}>{intl.get('Metric.samePeriodConfig')}:</span>
              <Space>
                <Select
                  value={samePeriodMethod}
                  onChange={setSamePeriodMethod}
                  style={{ width: 120 }}
                  options={SAME_PERIOD_METHOD_OPTIONS}
                />
                <Select
                  value={samePeriodGranularity}
                  onChange={setSamePeriodGranularity}
                  style={{ width: 100 }}
                  options={TIME_GRANULARITY_OPTIONS}
                />
                <span>{intl.get('Metric.offset')}</span>
                <InputNumber min={1} max={12} value={samePeriodOffset} onChange={(v) => setSamePeriodOffset(v || 1)} />
              </Space>
            </div>
          )}

          {/* 其他配置 */}
          <div className={styles['config-item']}>
            <span className={styles['config-label']}>{intl.get('Metric.limit')}:</span>
            <InputNumber min={1} max={1000} value={limit} onChange={(v) => setLimit(v || 100)} style={{ width: 80 }} />
            <span className={styles['config-label']} style={{ marginLeft: 16 }}>{intl.get('Metric.fillNull')}:</span>
            <Switch checked={fillNull} onChange={setFillNull} />
          </div>

          {/* 查询按钮 */}
          <div className={styles['config-item']}>
            <Button type="primary" onClick={executeQuery} loading={loading}>
              {intl.get('Metric.executeQuery')}
            </Button>
          </div>
        </div>
      </Card>

      {/* 数据展示 */}
      <Card className={styles['query-result-card']}>
        <Spin spinning={loading}>
          {error && (
            <Alert
              type="error"
              message={intl.get('Metric.queryError')}
              description={error}
              showIcon
              closable
              onClose={() => setError(undefined)}
              style={{ marginBottom: 16 }}
            />
          )}
          {!error && !data?.datas?.length ? (
            <Empty description={intl.get('Metric.noQueryResult')} />
          ) : queryMode === 'instant' ? (
            renderInstantResult()
          ) : (
            <div ref={chartRef} className={styles['chart-container']} />
          )}
        </Spin>

        {/* 查询耗时 */}
        {data?.overall_ms && (
          <div className={styles['query-meta']}>
            <span>{intl.get('Metric.queryDuration')}: {data.overall_ms}ms</span>
            {data.vega_duration_ms && <span> | VEGA: {data.vega_duration_ms}ms</span>}
          </div>
        )}
      </Card>
    </div>
  );
};

export default MetricDataQuery;