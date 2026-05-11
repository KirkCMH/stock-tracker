import type { FinancialReport } from '~/types/stock'
import type { ChartSeries } from '~/types/chart'

function periodLabel(r: FinancialReport): string {
  if (r.is_full_year || r.quarter === 0) return `${r.year} 全年`
  return `${r.year} Q${r.quarter}`
}

interface SeriesConfig {
  key: keyof Pick<FinancialReport, 'gross_margin' | 'operating_margin' | 'net_margin' | 'eps'>
  name: string
  color: string
}

const ALL_SERIES: SeriesConfig[] = [
  { key: 'gross_margin', name: '毛利率', color: '#3b82f6' },
  { key: 'operating_margin', name: '營業利益率', color: '#10b981' },
  { key: 'net_margin', name: '淨利率', color: '#f59e0b' },
  { key: 'eps', name: 'EPS', color: '#8b5cf6' },
]

export interface ChartDataResult {
  // Each metric is split into solid (all points) + optional dashed (last 2 points if incomplete year)
  seriesSolid: ChartSeries[]
  seriesDashed: ChartSeries[]
  colors: string[]
  dashArray: number[]
  labels: string[]
  hasIncompleteYear: boolean
}

export const useChartData = () => {
  const { selectedStock } = useSelectedStock()
  const { reports } = useFinancialData()

  const chartData = computed<ChartDataResult>(() => {
    const data = reports.value
    const industry = selectedStock.value?.industry_type ?? ''
    const isFinancial = industry === 'Financial'

    const activeSeries = isFinancial
      ? ALL_SERIES.filter(s => s.key !== 'gross_margin')
      : ALL_SERIES

    if (!data || data.length === 0) {
      return { seriesSolid: [], seriesDashed: [], colors: [], dashArray: [], labels: [], hasIncompleteYear: false }
    }

    const lastReport = data[data.length - 1]
    const hasIncompleteYear = !lastReport.is_full_year && lastReport.quarter !== 0

    const labels = data.map(periodLabel)

    const seriesSolid: ChartSeries[] = []
    const seriesDashed: ChartSeries[] = []
    const colors: string[] = []
    const dashArray: number[] = []

    for (const s of activeSeries) {
      if (hasIncompleteYear) {
        // Solid: all points except the last
        const solidData = data.slice(0, -1).map(r => ({
          x: periodLabel(r),
          y: r[s.key] as number | null,
        }))
        // Add the second-to-last as anchor so lines connect
        const anchor = data[data.length - 2]
        if (anchor) {
          solidData.push({ x: periodLabel(anchor), y: anchor[s.key] as number | null })
        }

        // Dashed: last 2 points to create connected dashed segment
        const dashedStartIdx = Math.max(0, data.length - 2)
        const dashedData = data.slice(dashedStartIdx).map(r => ({
          x: periodLabel(r),
          y: r[s.key] as number | null,
        }))

        seriesSolid.push({ name: s.name, data: solidData })
        seriesDashed.push({ name: `${s.name} (未完整)`, data: dashedData })
        colors.push(s.color, s.color)
        dashArray.push(0, 6)
      } else {
        seriesSolid.push({
          name: s.name,
          data: data.map(r => ({ x: periodLabel(r), y: r[s.key] as number | null })),
        })
        colors.push(s.color)
        dashArray.push(0)
      }
    }

    return { seriesSolid, seriesDashed, colors, dashArray, labels, hasIncompleteYear }
  })

  return { chartData }
}
