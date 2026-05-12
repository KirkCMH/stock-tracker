import { describe, it, expect } from 'vitest'
import { filterStocks } from '~/composables/useStockList'
import type { TrackingStock } from '~/types/stock'

const stocks: TrackingStock[] = [
  { id: '1', stock_id: '2330', stock_name: '台積電', industry_type: 'Semiconductor' },
  { id: '2', stock_id: '2882', stock_name: '國泰金', industry_type: 'Financial' },
  { id: '3', stock_id: '2317', stock_name: '鴻海', industry_type: 'Electronics' },
  { id: '4', stock_id: '2412', stock_name: '中華電', industry_type: 'Telecom' },
]

describe('filterStocks', () => {
  it('returns all stocks for empty query', () => {
    expect(filterStocks(stocks, '')).toHaveLength(4)
  })

  it('returns all stocks for whitespace-only query', () => {
    expect(filterStocks(stocks, '   ')).toHaveLength(4)
  })

  it('filters by exact stock_id', () => {
    const result = filterStocks(stocks, '2330')
    expect(result).toHaveLength(1)
    expect(result[0].stock_id).toBe('2330')
  })

  it('filters by partial stock_id', () => {
    const result = filterStocks(stocks, '23')
    expect(result.map(s => s.stock_id)).toContain('2330')
    expect(result.map(s => s.stock_id)).toContain('2317')
  })

  it('filters by stock_name', () => {
    const result = filterStocks(stocks, '台積電')
    expect(result).toHaveLength(1)
    expect(result[0].stock_id).toBe('2330')
  })

  it('filters by partial stock_name', () => {
    const result = filterStocks(stocks, '電')
    const ids = result.map(s => s.stock_id)
    expect(ids).toContain('2330') // 台積電
    expect(ids).toContain('2412') // 中華電
  })

  it('is case-insensitive for ASCII characters', () => {
    const asciiStocks: TrackingStock[] = [
      { id: '1', stock_id: 'TSMC', stock_name: 'Taiwan Semi', industry_type: 'Semi' },
    ]
    expect(filterStocks(asciiStocks, 'tsmc')).toHaveLength(1)
    expect(filterStocks(asciiStocks, 'TSMC')).toHaveLength(1)
    expect(filterStocks(asciiStocks, 'taiwan')).toHaveLength(1)
  })

  it('trims leading and trailing whitespace from query', () => {
    expect(filterStocks(stocks, '  2330  ')).toHaveLength(1)
  })

  it('returns empty array when no stocks match', () => {
    expect(filterStocks(stocks, '9999')).toHaveLength(0)
  })

  it('returns empty array for empty stocks input', () => {
    expect(filterStocks([], '2330')).toHaveLength(0)
  })
})
