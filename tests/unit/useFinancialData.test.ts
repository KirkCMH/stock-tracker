import { describe, it, expect } from 'vitest'
import { filterReportsByRange } from '~/composables/useFinancialData'
import type { FinancialReport } from '~/types/stock'

const makeReport = (year: number, quarter = 1): FinancialReport => ({
  stock_id: '2330', year, quarter,
  gross_margin: 30, operating_margin: 20, net_margin: 15, eps: 5, is_full_year: false,
})

describe('filterReportsByRange', () => {
  const reports = [
    makeReport(2018),
    makeReport(2019),
    makeReport(2020),
    makeReport(2021),
    makeReport(2022),
    makeReport(2023),
    makeReport(2024),
  ]

  it('returns all reports for max range', () => {
    expect(filterReportsByRange(reports, 'max', 2024)).toHaveLength(7)
  })

  it('filters to year >= currentYear - 5 for 5y range', () => {
    const result = filterReportsByRange(reports, '5y', 2024)
    // cutoff = 2024 - 5 = 2019 → years 2019–2024 (6 reports)
    expect(result).toHaveLength(6)
    expect(result[0].year).toBe(2019)
    expect(result[result.length - 1].year).toBe(2024)
  })

  it('excludes reports older than 5 years', () => {
    const result = filterReportsByRange(reports, '5y', 2024)
    expect(result.some(r => r.year < 2019)).toBe(false)
  })

  it('returns empty array for empty input with max', () => {
    expect(filterReportsByRange([], 'max', 2024)).toHaveLength(0)
  })

  it('returns empty array for empty input with 5y', () => {
    expect(filterReportsByRange([], '5y', 2024)).toHaveLength(0)
  })

  it('includes the cutoff year itself', () => {
    const result = filterReportsByRange(reports, '5y', 2024)
    expect(result.some(r => r.year === 2019)).toBe(true)
  })

  it('uses current year by default', () => {
    const currentYear = new Date().getFullYear()
    const old = makeReport(currentYear - 10)
    const recent = makeReport(currentYear - 1)
    const result = filterReportsByRange([old, recent], '5y')
    expect(result).toHaveLength(1)
    expect(result[0].year).toBe(currentYear - 1)
  })

  it('handles all reports within 5y window', () => {
    const recent = [makeReport(2023), makeReport(2024)]
    expect(filterReportsByRange(recent, '5y', 2024)).toHaveLength(2)
  })
})
