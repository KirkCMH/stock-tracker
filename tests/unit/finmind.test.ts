import { describe, it, expect } from 'vitest'
import { parseFinancialRows } from '~/server/services/finmind'

const row = (overrides: Partial<{
  stock_id: string; date: string; type: string; value: number; origin_name: string
}>) => ({
  stock_id: '2330', date: '2024-03-31', type: 'Q1', value: 0, origin_name: '', ...overrides,
})

describe('parseFinancialRows', () => {
  it('returns empty array for empty input', () => {
    expect(parseFinancialRows([])).toEqual([])
  })

  it('detects quarter from type field (Q1–Q4)', () => {
    const rows = [
      row({ date: '2024-03-31', type: 'Q1', value: 30, origin_name: '毛利率' }),
      row({ date: '2024-06-30', type: 'Q2', value: 28, origin_name: '毛利率' }),
      row({ date: '2024-09-30', type: 'Q3', value: 26, origin_name: '毛利率' }),
      row({ date: '2024-12-31', type: 'Q4', value: 24, origin_name: '毛利率' }),
    ]
    const result = parseFinancialRows(rows)
    expect(result.map(r => r.quarter)).toEqual([1, 2, 3, 4])
  })

  it('detects quarter from date month when type is unrecognized', () => {
    const rows = [
      row({ date: '2024-03-31', type: 'OTHER', value: 10, origin_name: '毛利率' }),
      row({ date: '2024-06-30', type: 'OTHER', value: 10, origin_name: '毛利率' }),
      row({ date: '2024-09-30', type: 'OTHER', value: 10, origin_name: '毛利率' }),
      row({ date: '2024-12-31', type: 'OTHER', value: 10, origin_name: '毛利率' }),
    ]
    const result = parseFinancialRows(rows)
    expect(result.map(r => r.quarter)).toEqual([1, 2, 3, 4])
  })

  it('marks Annual rows as is_full_year with quarter 0', () => {
    const rows = [row({ type: 'Annual', value: 5.2, origin_name: 'EPS' })]
    const result = parseFinancialRows(rows)
    expect(result[0].quarter).toBe(0)
    expect(result[0].is_full_year).toBe(true)
    expect(result[0].eps).toBe(5.2)
  })

  it('skips rows with unrecognised type and non-quarter month', () => {
    const rows = [row({ date: '2024-05-15', type: 'UNKNOWN', value: 10, origin_name: '毛利率' })]
    expect(parseFinancialRows(rows)).toHaveLength(0)
  })

  it('groups multiple rows into the same period', () => {
    const rows = [
      row({ type: 'Q1', value: 30, origin_name: '毛利率' }),
      row({ type: 'Q1', value: 20, origin_name: '營業利益率' }),
      row({ type: 'Q1', value: 15, origin_name: '稅後淨利率' }),
      row({ type: 'Q1', value: 5.5, origin_name: 'EPS' }),
    ]
    const result = parseFinancialRows(rows)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ gross_margin: 30, operating_margin: 20, net_margin: 15, eps: 5.5 })
  })

  it('maps Chinese origin_name keywords correctly', () => {
    const rows = [
      row({ type: 'Q1', value: 30, origin_name: '毛利率' }),
      row({ type: 'Q1', value: 20, origin_name: '營業利益率' }),
      row({ type: 'Q1', value: 15, origin_name: '淨利率' }),
      row({ type: 'Q1', value: 5, origin_name: '每股盈餘' }),
    ]
    const result = parseFinancialRows(rows)
    expect(result[0]).toMatchObject({ gross_margin: 30, operating_margin: 20, net_margin: 15, eps: 5 })
  })

  it('maps English origin_name keywords correctly', () => {
    const rows = [
      row({ type: 'Q1', value: 30, origin_name: 'GrossProfit Margin' }),
      row({ type: 'Q1', value: 20, origin_name: 'Operating Income Ratio' }),
      row({ type: 'Q1', value: 15, origin_name: 'Net Income Rate' }),
      row({ type: 'Q1', value: 5, origin_name: 'EPS' }),
    ]
    const result = parseFinancialRows(rows)
    expect(result[0]).toMatchObject({ gross_margin: 30, operating_margin: 20, net_margin: 15, eps: 5 })
  })

  it('leaves unmatched fields as null', () => {
    const rows = [row({ type: 'Q1', value: 30, origin_name: '毛利率' })]
    const result = parseFinancialRows(rows)
    expect(result[0].operating_margin).toBeNull()
    expect(result[0].net_margin).toBeNull()
    expect(result[0].eps).toBeNull()
  })

  it('sorts results by year then quarter ascending', () => {
    const rows = [
      row({ date: '2024-12-31', type: 'Q4', value: 1, origin_name: '毛利率' }),
      row({ date: '2023-03-31', type: 'Q1', value: 2, origin_name: '毛利率' }),
      row({ date: '2024-03-31', type: 'Q1', value: 3, origin_name: '毛利率' }),
    ]
    const result = parseFinancialRows(rows)
    expect(result.map(r => `${r.year}-Q${r.quarter}`)).toEqual(['2023-Q1', '2024-Q1', '2024-Q4'])
  })

  it('handles multiple years correctly', () => {
    const rows = [
      row({ date: '2023-03-31', type: 'Q1', value: 25, origin_name: '毛利率' }),
      row({ date: '2024-03-31', type: 'Q1', value: 30, origin_name: '毛利率' }),
    ]
    const result = parseFinancialRows(rows)
    expect(result).toHaveLength(2)
    expect(result[0].year).toBe(2023)
    expect(result[1].year).toBe(2024)
  })
})
