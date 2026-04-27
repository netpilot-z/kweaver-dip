import type {
  DipChatKitChartDataset,
  DipChatKitChartDatum,
  DipChatKitChartDisplayMode,
  DipChatKitChartOptionResult,
  DipChatKitChartOrientation,
  DipChatKitChartParseOptions,
  DipChatKitChartPayload,
  DipChatKitChartType,
} from './types'

const SUPPORTED_CHART_TYPE_SET = new Set<DipChatKitChartType>([
  'bar',
  'bar_horizontal',
  'line',
  'pie',
  'scatter',
])
const SWITCHABLE_CHART_TYPE_SET = new Set<DipChatKitChartType>(['bar', 'line', 'pie'])
const JSON_STRING_TOKEN_PATTERN = /"(?:\\.|[^"\\])*"/
const JSON_NUMBER_TOKEN_PATTERN = /-?\d+(?:\.\d+)?/

const toText = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (value === null || value === undefined) return ''
  return String(value)
}

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return null
  const trimmedValue = value.trim()
  if (!trimmedValue) return null
  const normalizedValue = Number(trimmedValue.replace(/,/g, ''))
  return Number.isFinite(normalizedValue) ? normalizedValue : null
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

const normalizeChartDataItem = (item: unknown): DipChatKitChartDatum | null => {
  if (!isRecord(item)) return null

  return {
    x: typeof item.x === 'string' || typeof item.x === 'number' ? item.x : undefined,
    y: typeof item.y === 'string' || typeof item.y === 'number' ? item.y : undefined,
    name: typeof item.name === 'string' ? item.name : undefined,
    value:
      typeof item.value === 'string' || typeof item.value === 'number' ? item.value : undefined,
    label: typeof item.label === 'string' ? item.label : undefined,
  }
}

const isRenderableBarDatum = (item: DipChatKitChartDatum): boolean => {
  return toText(item.x).trim().length > 0 && toNumber(item.y) !== null
}

const isRenderableHorizontalBarDatum = (item: DipChatKitChartDatum): boolean => {
  return toText(item.y).trim().length > 0 && toNumber(item.x) !== null
}

const isRenderablePieDatum = (item: DipChatKitChartDatum): boolean => {
  return toText(item.name).trim().length > 0 && toNumber(item.value) !== null
}

const isRenderableScatterDatum = (item: DipChatKitChartDatum): boolean => {
  return toNumber(item.x) !== null && toNumber(item.y) !== null
}

const normalizeChartOrientation = (value: unknown): DipChatKitChartOrientation | undefined => {
  if (typeof value !== 'string') return undefined

  const normalizedValue = value.trim().toLowerCase()
  if (normalizedValue === 'horizontal' || normalizedValue === 'vertical') {
    return normalizedValue
  }

  return undefined
}

const normalizeChartPayloadType = (chart: DipChatKitChartPayload): DipChatKitChartPayload => {
  if (chart.chartType !== 'bar') {
    return chart
  }

  if (chart.orientation === 'horizontal') {
    return {
      ...chart,
      chartType: 'bar_horizontal',
    }
  }

  const hasRenderableVerticalBarDatum = chart.data.some(isRenderableBarDatum)
  const hasRenderableHorizontalBarDatum = chart.data.some(isRenderableHorizontalBarDatum)

  if (!hasRenderableVerticalBarDatum && hasRenderableHorizontalBarDatum) {
    return {
      ...chart,
      chartType: 'bar_horizontal',
    }
  }

  return chart
}

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const unwrapCodeFence = (source: string): string => {
  const trimmedSource = source.trim()
  const codeFenceMatch = trimmedSource.match(/^```(?:[\w-]+)?\s*([\s\S]*?)\s*```$/)
  if (codeFenceMatch?.[1]) {
    return codeFenceMatch[1].trim()
  }
  return trimmedSource
}

const decodeJsonStringToken = (token: string): string => {
  try {
    return JSON.parse(token) as string
  } catch {
    return token.replace(/^"/, '').replace(/"$/, '')
  }
}

const createFieldPattern = (key: string, valuePattern: string): RegExp => {
  const escapedKey = escapeRegExp(key)
  return new RegExp(
    `(?:^|[,{])\\s*(?:"${escapedKey}"|"?[^",:{}\\[\\]\\r\\n]*${escapedKey}"?)\\s*:\\s*(${valuePattern})`,
    'i',
  )
}

const extractStringField = (source: string, key: string): string => {
  const matched = source.match(createFieldPattern(key, JSON_STRING_TOKEN_PATTERN.source))
  if (!matched?.[1]) return ''
  return decodeJsonStringToken(matched[1]).trim()
}

const extractNumberField = (source: string, key: string): number | null => {
  const matched = source.match(createFieldPattern(key, JSON_NUMBER_TOKEN_PATTERN.source))
  if (!matched?.[1]) return null
  return toNumber(matched[1])
}

const extractEncodingBlock = (source: string): string => {
  const matched = source.match(/"encoding"\s*:\s*\{([\s\S]*?)\}\s*,?\s*"data"/i)
  if (matched?.[1]) {
    return matched[1]
  }
  const fallbackMatched = source.match(/"encoding"\s*:\s*\{([\s\S]*?)\}/i)
  return fallbackMatched?.[1] || ''
}

const extractDataBlock = (source: string): string => {
  const matched = source.match(/"data"\s*:\s*\[([\s\S]*?)\]\s*\}?/i)
  return matched?.[1] || ''
}

const extractObjectBlocks = (source: string): string[] => {
  const objectBlocks: string[] = []
  let startIndex = -1
  let depth = 0
  let inString = false
  let escaped = false

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]

    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\' && inString) {
      escaped = true
      continue
    }

    if (char === '"') {
      inString = !inString
      continue
    }

    if (inString) continue

    if (char === '{') {
      if (depth === 0) {
        startIndex = index
      }
      depth += 1
      continue
    }

    if (char === '}') {
      depth -= 1
      if (depth === 0 && startIndex >= 0) {
        objectBlocks.push(source.slice(startIndex, index + 1))
        startIndex = -1
      }
    }
  }

  return objectBlocks
}

const parseLenientDatum = (
  chartType: DipChatKitChartType,
  source: string,
): DipChatKitChartDatum | null => {
  if (chartType === 'bar' || chartType === 'line') {
    const x = extractStringField(source, 'x')
    const y = extractNumberField(source, 'y')
    if (!x || y === null) return null
    return { x, y }
  }

  if (chartType === 'bar_horizontal') {
    const y = extractStringField(source, 'y')
    const x = extractNumberField(source, 'x')
    if (!y || x === null) return null
    return { x, y }
  }

  if (chartType === 'pie') {
    const name = extractStringField(source, 'name')
    const value = extractNumberField(source, 'value')
    if (!name || value === null) return null
    return { name, value }
  }

  const x = extractNumberField(source, 'x')
  const y = extractNumberField(source, 'y')
  if (x === null || y === null) return null

  const label = extractStringField(source, 'label') || undefined
  return { x, y, label }
}

const parseLenientChartPayload = (source: string): DipChatKitChartPayload | null => {
  const plotId = extractStringField(source, 'plot_id')
  const chartTypeValue = extractStringField(source, 'chart_type').toLowerCase()
  if (!(plotId && isDipChatKitChartType(chartTypeValue))) {
    return null
  }

  const encodingBlock = extractEncodingBlock(source)
  const dataBlock = extractDataBlock(source)
  const data = extractObjectBlocks(dataBlock)
    .map((item) => parseLenientDatum(chartTypeValue, item))
    .filter((item): item is DipChatKitChartDatum => Boolean(item))

  return {
    plotId,
    chartType: chartTypeValue,
    sql: extractStringField(source, 'sql'),
    encoding: {
      x: extractStringField(encodingBlock, 'x') || undefined,
      y: extractStringField(encodingBlock, 'y') || undefined,
      name: extractStringField(encodingBlock, 'name') || undefined,
      value: extractStringField(encodingBlock, 'value') || undefined,
      label: extractStringField(encodingBlock, 'label') || undefined,
    },
    data,
    orientation: normalizeChartOrientation(extractStringField(source, 'orientation')),
    title: extractStringField(source, 'title') || undefined,
  }
}

export const isDipChatKitChartType = (value: unknown): value is DipChatKitChartType => {
  return typeof value === 'string' && SUPPORTED_CHART_TYPE_SET.has(value as DipChatKitChartType)
}

export const isDipChatKitChartPayloadRenderable = (chart: DipChatKitChartPayload): boolean => {
  if (chart.data.length === 0) return false

  if (chart.chartType === 'bar' || chart.chartType === 'line') {
    return chart.data.some(isRenderableBarDatum)
  }

  if (chart.chartType === 'bar_horizontal') {
    return chart.data.some(isRenderableHorizontalBarDatum)
  }

  if (chart.chartType === 'pie') {
    return chart.data.some(isRenderablePieDatum)
  }

  return chart.data.some(isRenderableScatterDatum)
}

const normalizeParsedChartPayload = (
  chart: DipChatKitChartPayload,
  options?: DipChatKitChartParseOptions,
): DipChatKitChartPayload | null => {
  const normalizedChart = normalizeChartPayloadType(chart)

  if (options?.requireRenderable && !isDipChatKitChartPayloadRenderable(normalizedChart)) {
    return null
  }

  return normalizedChart
}

export const parseDipChatKitChartPayload = (
  source: string,
  options?: DipChatKitChartParseOptions,
): DipChatKitChartPayload | null => {
  const trimmedSource = unwrapCodeFence(source)

  if (!trimmedSource) return null

  try {
    const parsed = JSON.parse(trimmedSource)
    if (!isRecord(parsed)) return null

    const plotId = toText(parsed.plot_id).trim()
    const chartType = toText(parsed.chart_type).trim().toLowerCase()
    if (!(plotId && isDipChatKitChartType(chartType))) {
      return null
    }

    const normalizedData = Array.isArray(parsed.data)
      ? parsed.data
          .map(normalizeChartDataItem)
          .filter((item): item is DipChatKitChartDatum => Boolean(item))
      : []

    return normalizeParsedChartPayload(
      {
        plotId,
        chartType,
        sql: toText(parsed.sql).trim(),
        encoding: isRecord(parsed.encoding)
          ? {
              x: toText(parsed.encoding.x).trim() || undefined,
              y: toText(parsed.encoding.y).trim() || undefined,
              name: toText(parsed.encoding.name).trim() || undefined,
              value: toText(parsed.encoding.value).trim() || undefined,
              label: toText(parsed.encoding.label).trim() || undefined,
            }
          : {},
        data: normalizedData,
        orientation: normalizeChartOrientation(parsed.orientation),
        title: toText(parsed.title).trim() || undefined,
      },
      options,
    )
  } catch {
    if (options?.allowLenient === false) {
      return null
    }

    const parsedPayload = parseLenientChartPayload(trimmedSource)
    if (!parsedPayload) return null

    return normalizeParsedChartPayload(parsedPayload, options)
  }
}

export const getDipChatKitChartDataCount = (chart: DipChatKitChartPayload): number => {
  return chart.data.length
}

export const isDipChatKitChartSwitchable = (chart: DipChatKitChartPayload): boolean => {
  return SWITCHABLE_CHART_TYPE_SET.has(chart.chartType)
}

export const getDipChatKitChartDefaultDisplayMode = (
  chart: DipChatKitChartPayload,
): Exclude<DipChatKitChartDisplayMode, 'table'> => {
  if (chart.chartType === 'line') {
    return 'line'
  }

  if (chart.chartType === 'pie') {
    return 'pie'
  }

  return 'column'
}

export const normalizeDipChatKitChartDataset = (
  chart: DipChatKitChartPayload,
): DipChatKitChartDataset | null => {
  if (!isDipChatKitChartSwitchable(chart)) {
    return null
  }

  if (chart.chartType === 'pie') {
    const rows = chart.data
      .map((item, index) => {
        return {
          key: `${chart.plotId}_dataset_${index}`,
          dimension: toText(item.name).trim(),
          metric: toNumber(item.value),
        }
      })
      .filter((item) => item.dimension && item.metric !== null) as DipChatKitChartDataset['rows']

    if (rows.length === 0) {
      return null
    }

    return {
      dimensionLabel: chart.encoding.name || '',
      metricLabel: chart.encoding.value || '',
      rows,
    }
  }

  const rows = chart.data
    .map((item, index) => {
      return {
        key: `${chart.plotId}_dataset_${index}`,
        dimension: toText(item.x).trim(),
        metric: toNumber(item.y),
      }
    })
    .filter((item) => item.dimension && item.metric !== null) as DipChatKitChartDataset['rows']

  if (rows.length === 0) {
    return null
  }

  return {
    dimensionLabel: chart.encoding.x || '',
    metricLabel: chart.encoding.y || '',
    rows,
  }
}

export const getDipChatKitChartRecommendedHeight = (
  chart: DipChatKitChartPayload,
  variant: 'inline' | 'preview',
): number => {
  if (chart.chartType === 'bar' || chart.chartType === 'bar_horizontal') {
    return variant === 'preview' ? 560 : 380
  }
  if (chart.chartType === 'pie') {
    return variant === 'preview' ? 520 : 340
  }
  return variant === 'preview' ? 500 : 340
}

export const getDipChatKitChartRecommendedHeightByDisplayMode = (
  displayMode: Exclude<DipChatKitChartDisplayMode, 'table'>,
  variant: 'inline' | 'preview',
): number => {
  if (displayMode === 'column') {
    return variant === 'preview' ? 560 : 380
  }

  if (displayMode === 'pie' || displayMode === 'donut') {
    return variant === 'preview' ? 520 : 340
  }

  return variant === 'preview' ? 500 : 340
}

const buildBarChartOption = (
  chart: DipChatKitChartPayload,
  variant: 'inline' | 'preview',
): Record<string, unknown> => {
  const forceHorizontal = chart.chartType === 'bar_horizontal'
  const points = chart.data
    .map((item) => {
      if (forceHorizontal) {
        return {
          category: toText(item.y).trim(),
          value: toNumber(item.x),
        }
      }

      return {
        category: toText(item.x).trim(),
        value: toNumber(item.y),
      }
    })
    .filter((item) => item.category && item.value !== null) as Array<{
    category: string
    value: number
  }>

  const maxLabelLength = points.reduce((maxValue, item) => {
    return Math.max(maxValue, item.category.length)
  }, 0)
  const horizontal = forceHorizontal || points.length > 8 || maxLabelLength > 6
  const visibleCount = variant === 'preview' ? 14 : 8
  const needDataZoom = points.length > visibleCount

  return {
    animationDuration: 260,
    grid: horizontal
      ? {
          left: Math.min(Math.max(maxLabelLength * 8, 96), 220),
          right: needDataZoom ? 42 : 18,
          top: 16,
          bottom: 24,
          containLabel: false,
        }
      : {
          left: 18,
          right: 18,
          top: 16,
          bottom: points.length > 6 ? 92 : 42,
          containLabel: true,
        },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: horizontal
      ? {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: '#eaecf0',
            },
          },
        }
      : {
          type: 'category',
          data: points.map((item) => item.category),
          axisLabel: {
            interval: 0,
            rotate: points.length > 6 ? 32 : 0,
          },
        },
    yAxis: horizontal
      ? {
          type: 'category',
          data: points.map((item) => item.category),
          axisLabel: {
            width: Math.min(Math.max(maxLabelLength * 8, 96), 200),
            overflow: 'truncate',
          },
        }
      : {
          type: 'value',
          splitLine: {
            lineStyle: {
              color: '#eaecf0',
            },
          },
        },
    dataZoom: needDataZoom
      ? [
          horizontal
            ? {
                type: 'inside',
                yAxisIndex: 0,
                startValue: 0,
                endValue: visibleCount - 1,
              }
            : {
                type: 'inside',
                xAxisIndex: 0,
                startValue: 0,
                endValue: visibleCount - 1,
              },
          horizontal
            ? {
                type: 'slider',
                yAxisIndex: 0,
                width: 12,
                right: 10,
                top: 16,
                bottom: 24,
                startValue: 0,
                endValue: visibleCount - 1,
              }
            : {
                type: 'slider',
                xAxisIndex: 0,
                height: 14,
                left: 18,
                right: 18,
                bottom: 12,
                startValue: 0,
                endValue: visibleCount - 1,
              },
        ]
      : [],
    series: [
      {
        type: 'bar',
        data: points.map((item) => item.value),
        barMaxWidth: 22,
        itemStyle: {
          color: '#126ee3',
          borderRadius: horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0],
        },
      },
    ],
  }
}

const buildColumnChartOptionByDataset = (
  dataset: DipChatKitChartDataset,
  variant: 'inline' | 'preview',
): Record<string, unknown> => {
  const points = dataset.rows
  const visibleCount = variant === 'preview' ? 14 : 8
  const needDataZoom = points.length > visibleCount

  return {
    animationDuration: 260,
    grid: {
      left: 18,
      right: 18,
      top: 16,
      bottom: points.length > 6 || needDataZoom ? 92 : 42,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      data: points.map((item) => item.dimension),
      axisLabel: {
        interval: 0,
        rotate: points.length > 6 ? 32 : 0,
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: '#eaecf0',
        },
      },
    },
    dataZoom: needDataZoom
      ? [
          {
            type: 'inside',
            xAxisIndex: 0,
            startValue: 0,
            endValue: visibleCount - 1,
          },
          {
            type: 'slider',
            xAxisIndex: 0,
            height: 14,
            left: 18,
            right: 18,
            bottom: 12,
            startValue: 0,
            endValue: visibleCount - 1,
          },
        ]
      : [],
    series: [
      {
        type: 'bar',
        data: points.map((item) => item.metric),
        barMaxWidth: 22,
        itemStyle: {
          color: '#126ee3',
          borderRadius: [6, 6, 0, 0],
        },
      },
    ],
  }
}

const buildLineChartOption = (
  chart: DipChatKitChartPayload,
  variant: 'inline' | 'preview',
): Record<string, unknown> => {
  const points = chart.data
    .map((item) => {
      return {
        x: toText(item.x).trim(),
        y: toNumber(item.y),
      }
    })
    .filter((item) => item.x && item.y !== null) as Array<{ x: string; y: number }>
  const visibleCount = variant === 'preview' ? 16 : 10
  const needDataZoom = points.length > visibleCount

  return {
    animationDuration: 260,
    grid: {
      left: 18,
      right: 18,
      top: 16,
      bottom: needDataZoom ? 72 : 32,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: points.map((item) => item.x),
      axisLabel: {
        interval: 0,
        rotate: points.length > 6 ? 30 : 0,
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: '#eaecf0',
        },
      },
    },
    dataZoom: needDataZoom
      ? [
          {
            type: 'inside',
            xAxisIndex: 0,
            startValue: 0,
            endValue: visibleCount - 1,
          },
          {
            type: 'slider',
            xAxisIndex: 0,
            height: 14,
            left: 18,
            right: 18,
            bottom: 12,
            startValue: 0,
            endValue: visibleCount - 1,
          },
        ]
      : [],
    series: [
      {
        type: 'line',
        data: points.map((item) => item.y),
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#126ee3',
        },
        itemStyle: {
          color: '#126ee3',
        },
        areaStyle: {
          color: 'rgba(18,110,227,0.12)',
        },
      },
    ],
  }
}

const buildLineChartOptionByDataset = (
  dataset: DipChatKitChartDataset,
  variant: 'inline' | 'preview',
): Record<string, unknown> => {
  const points = dataset.rows
  const visibleCount = variant === 'preview' ? 16 : 10
  const needDataZoom = points.length > visibleCount

  return {
    animationDuration: 260,
    grid: {
      left: 18,
      right: 18,
      top: 16,
      bottom: needDataZoom ? 72 : 32,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: points.map((item) => item.dimension),
      axisLabel: {
        interval: 0,
        rotate: points.length > 6 ? 30 : 0,
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: '#eaecf0',
        },
      },
    },
    dataZoom: needDataZoom
      ? [
          {
            type: 'inside',
            xAxisIndex: 0,
            startValue: 0,
            endValue: visibleCount - 1,
          },
          {
            type: 'slider',
            xAxisIndex: 0,
            height: 14,
            left: 18,
            right: 18,
            bottom: 12,
            startValue: 0,
            endValue: visibleCount - 1,
          },
        ]
      : [],
    series: [
      {
        type: 'line',
        data: points.map((item) => item.metric),
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#126ee3',
        },
        itemStyle: {
          color: '#126ee3',
        },
        areaStyle: {
          color: 'rgba(18,110,227,0.12)',
        },
      },
    ],
  }
}

const buildPieChartOption = (chart: DipChatKitChartPayload): Record<string, unknown> => {
  const points = chart.data
    .map((item) => {
      return {
        name: toText(item.name).trim(),
        value: toNumber(item.value),
      }
    })
    .filter((item) => item.name && item.value !== null) as Array<{ name: string; value: number }>

  return {
    animationDuration: 260,
    tooltip: {
      trigger: 'item',
    },
    legend: {
      type: 'scroll',
      bottom: 0,
      left: 'center',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '68%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          formatter: '{b}: {d}%',
        },
        data: points,
      },
    ],
  }
}

const buildPieChartOptionByDataset = (
  dataset: DipChatKitChartDataset,
  displayMode: Extract<DipChatKitChartDisplayMode, 'pie' | 'donut'>,
): Record<string, unknown> => {
  const points = dataset.rows.map((item) => ({
    name: item.dimension,
    value: item.metric,
  }))

  return {
    animationDuration: 260,
    tooltip: {
      trigger: 'item',
    },
    legend: {
      type: 'scroll',
      bottom: 0,
      left: 'center',
    },
    series: [
      {
        type: 'pie',
        radius: displayMode === 'donut' ? ['40%', '68%'] : '68%',
        center: ['50%', '42%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          formatter: '{b}: {d}%',
        },
        data: points,
      },
    ],
  }
}

const buildScatterChartOption = (chart: DipChatKitChartPayload): Record<string, unknown> => {
  const points = chart.data
    .map((item) => {
      return {
        value: [toNumber(item.x), toNumber(item.y)],
        label: toText(item.label).trim(),
      }
    })
    .filter((item) => item.value[0] !== null && item.value[1] !== null) as Array<{
    value: [number, number]
    label: string
  }>

  return {
    animationDuration: 260,
    grid: {
      left: 18,
      right: 18,
      top: 16,
      bottom: 30,
      containLabel: true,
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: { data?: { label?: string; value?: [number, number] } }) => {
        const pointLabel = params.data?.label ? `${params.data.label}<br/>` : ''
        const pointValue = params.data?.value || []
        return `${pointLabel}${chart.encoding.x || 'X'}: ${pointValue[0] ?? ''}<br/>${chart.encoding.y || 'Y'}: ${pointValue[1] ?? ''}`
      },
    },
    xAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: '#eaecf0',
        },
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: '#eaecf0',
        },
      },
    },
    series: [
      {
        type: 'scatter',
        symbolSize: 14,
        itemStyle: {
          color: '#126ee3',
          opacity: 0.82,
        },
        data: points,
      },
    ],
  }
}

export const buildDipChatKitChartOptionByDisplayMode = (
  dataset: DipChatKitChartDataset,
  displayMode: Exclude<DipChatKitChartDisplayMode, 'table'>,
  variant: 'inline' | 'preview',
): DipChatKitChartOptionResult => {
  const height = getDipChatKitChartRecommendedHeightByDisplayMode(displayMode, variant)

  if (displayMode === 'column') {
    return {
      height,
      option: buildColumnChartOptionByDataset(dataset, variant),
    }
  }

  if (displayMode === 'line') {
    return {
      height,
      option: buildLineChartOptionByDataset(dataset, variant),
    }
  }

  return {
    height,
    option: buildPieChartOptionByDataset(dataset, displayMode),
  }
}

export const buildDipChatKitChartOption = (
  chart: DipChatKitChartPayload,
  variant: 'inline' | 'preview',
): DipChatKitChartOptionResult => {
  const height = getDipChatKitChartRecommendedHeight(chart, variant)

  if (chart.chartType === 'bar' || chart.chartType === 'bar_horizontal') {
    return {
      height,
      option: buildBarChartOption(chart, variant),
    }
  }

  if (chart.chartType === 'line') {
    return {
      height,
      option: buildLineChartOption(chart, variant),
    }
  }

  if (chart.chartType === 'pie') {
    return {
      height,
      option: buildPieChartOption(chart),
    }
  }

  return {
    height,
    option: buildScatterChartOption(chart),
  }
}
