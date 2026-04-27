import { Table } from 'antd'
import clsx from 'clsx'
import type { ColumnsType } from 'antd/es/table'
import type React from 'react'
import { useMemo } from 'react'
import intl from 'react-intl-universal'
import styles from './index.module.less'
import type { ChartDataTableProps, ChartTableRow } from './types'

const formatMetricValue = (value: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: 3,
  }).format(value)
}

const ChartDataTable: React.FC<ChartDataTableProps> = ({
  dataset,
  className,
  variant = 'inline',
}) => {
  const columns = useMemo<ColumnsType<ChartTableRow>>(() => {
    const dimensionTitle =
      dataset.dimensionLabel || (intl.get('dipChatKit.chartTableDimension').d('维度') as string)
    const metricTitle =
      dataset.metricLabel || (intl.get('dipChatKit.chartTableMetric').d('指标') as string)

    return [
      {
        title: dimensionTitle,
        dataIndex: 'dimension',
        key: 'dimension',
        ellipsis: { showTitle: true },
      },
      {
        title: metricTitle,
        dataIndex: 'metric',
        key: 'metric',
        ellipsis: { showTitle: true },
        render: (value: number) => formatMetricValue(value),
      },
    ]
  }, [dataset.dimensionLabel, dataset.metricLabel])

  const dataSource = useMemo<ChartTableRow[]>(() => {
    return dataset.rows.map((row) => ({
      key: row.key,
      dimension: row.dimension,
      metric: row.metric,
    }))
  }, [dataset.rows])

  return (
    <div
      className={clsx(
        'ChartDataTable',
        styles.root,
        variant === 'inline' ? styles.inlineRoot : styles.modalRoot,
        className,
      )}
    >
      <Table<ChartTableRow>
        className={styles.table}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size='small'
        tableLayout='fixed'
        style={{ width: '100%' }}
      />
    </div>
  )
}

export default ChartDataTable
