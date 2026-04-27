import type { DipChatKitChartDataset } from '../../types'

export interface ChartTableRow {
  key: string
  dimension: string
  metric: number
}

export type ChartDataTableVariant = 'inline' | 'modal'

export interface ChartDataTableProps {
  dataset: DipChatKitChartDataset
  className?: string
  variant?: ChartDataTableVariant
}
