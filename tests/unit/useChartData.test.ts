import { describe, it, expect } from 'vitest'
import { buildChartData, periodLabel } from '~/composables/useChartData'
import type { FinancialReport } from '~/types/stock'

const makeReport = (overrides: Partial<FinancialReport>): FinancialReport => ({
  stock_id: '2330',
  year: 2024,
  quarter: 1,
  gross_margin: 50,
  operating_margin: 40,
  net_margin: 35,
  eps: 10,
  is_full_year: false,
  ...overrides,
})

describe('periodLabel', () => {
  it('formats full-year report', () => {
    expect(periodLabel(makeReport({ is_full_year: true, quarter: 0 }))).toBe('2024 全年')
  })

  it('formats quarter=0 as full year even if is_full_year is false', () => {
    expect(periodLabel(makeReport({ is_full_year: false, quarter: 0 }))).toBe('2024 全年')
  })

  it('formats quarterly reports', () => {
    expect(periodLabel(makeReport({ quarter: 1 }))).toBe('2024 Q1')
    expect(periodLabel(makeReport({ quarter: 2 }))).toBe('2024 Q2')
    expect(periodLabel(makeReport({ quarter: 3 }))).toBe('2024 Q3')
    expect(periodLabel(makeReport({ quarter: 4 }))).toBe('2024 Q4')
  })
})

describe('buildChartData', () => {
  it('returns empty result for empty data', () => {
    const result = buildChartData([], false)
    expect(result.seriesSolid).toHaveLength(0)
    expect(result.seriesDashed).toHaveLength(0)
    expect(result.hasIncompleteYear).toBe(false)
    expect(result.labels).toHaveLength(0)
  })

  it('returns 4 solid series for non-financial with complete year', () => {
    const data = [makeReport({ is_full_year: true, quarter: 0 })]
    const result = buildChartData(data, false)
    expect(result.seriesSolid).toHaveLength(4)
    expect(result.hasIncompleteYear).toBe(false)
    expect(result.seriesDashed).toHaveLength(0)
  })

  it('returns 3 solid series for financial industry (no gross_margin)', () => {
    const data = [makeReport({ is_full_year: true, quarter: 0 })]
    const result = buildChartData(data, true)
    expect(result.seriesSolid).toHaveLength(3)
    const names = result.seriesSolid.map(s => s.name)
    expect(names).not.toContain('毛利率')
    expect(names).toContain('營業利益率')
    expect(names).toContain('淨利率')
    expect(names).toContain('EPS')
  })

  it('detects incomplete year when last report is not full-year', () => {
    const data = [
      makeReport({ year: 2023, quarter: 4, is_full_year: false }),
      makeReport({ year: 2024, quarter: 1, is_full_year: false }),
    ]
    const result = buildChartData(data, false)
    expect(result.hasIncompleteYear).toBe(true)
    expect(result.seriesDashed.length).toBeGreaterThan(0)
  })

  it('does not detect incomplete year when last report is full-year', () => {
    const data = [
      makeReport({ year: 2023, quarter: 1 }),
      makeReport({ year: 2023, is_full_year: true, quarter: 0 }),
    ]
    const result = buildChartData(data, false)
    expect(result.hasIncompleteYear).toBe(false)
    expect(result.seriesDashed).toHaveLength(0)
  })

  it('splits into solid + dashed pairs for each series when incomplete', () => {
    const data = [
      makeReport({ year: 2023, quarter: 4 }),
      makeReport({ year: 2024, quarter: 1 }),
    ]
    const result = buildChartData(data, false)
    // 4 metrics × 2 (solid + dashed) = 8 series
    expect(result.seriesSolid).toHaveLength(4)
    expect(result.seriesDashed).toHaveLength(4)
    // dashArray alternates 0, 6 for each pair
    expect(result.dashArray).toEqual([0, 6, 0, 6, 0, 6, 0, 6])
  })

  it('dashed series name includes (未完整) suffix', () => {
    const data = [
      makeReport({ year: 2023, quarter: 4 }),
      makeReport({ year: 2024, quarter: 1 }),
    ]
    const result = buildChartData(data, false)
    expect(result.seriesDashed[0].name).toContain('未完整')
  })

  it('solid series data includes anchor point from second-to-last report', () => {
    const data = [
      makeReport({ year: 2023, quarter: 3 }),
      makeReport({ year: 2023, quarter: 4 }),
      makeReport({ year: 2024, quarter: 1 }),
    ]
    const result = buildChartData(data, false)
    const solidSeries = result.seriesSolid[0]
    // slice(0, -1) = [Q3, Q4], then anchor Q4 again = 3 points
    expect(solidSeries.data).toHaveLength(3)
    expect(solidSeries.data[2].x).toBe('2023 Q4')
  })

  it('dashed series covers last 2 points', () => {
    const data = [
      makeReport({ year: 2023, quarter: 3 }),
      makeReport({ year: 2023, quarter: 4 }),
      makeReport({ year: 2024, quarter: 1 }),
    ]
    const result = buildChartData(data, false)
    const dashedSeries = result.seriesDashed[0]
    expect(dashedSeries.data).toHaveLength(2)
    expect(dashedSeries.data[0].x).toBe('2023 Q4')
    expect(dashedSeries.data[1].x).toBe('2024 Q1')
  })

  it('generates correct labels for all data points', () => {
    const data = [
      makeReport({ year: 2023, quarter: 4 }),
      makeReport({ year: 2024, quarter: 1 }),
    ]
    const result = buildChartData(data, false)
    expect(result.labels).toEqual(['2023 Q4', '2024 Q1'])
  })

  it('handles null metric values gracefully', () => {
    const data = [makeReport({ gross_margin: null, operating_margin: null, is_full_year: true, quarter: 0 })]
    const result = buildChartData(data, false)
    expect(result.seriesSolid[0].data[0].y).toBeNull()
  })

  it('handles single data point with no incomplete year', () => {
    const data = [makeReport({ is_full_year: true, quarter: 0 })]
    const result = buildChartData(data, false)
    expect(result.hasIncompleteYear).toBe(false)
    expect(result.seriesSolid[0].data).toHaveLength(1)
  })
})
