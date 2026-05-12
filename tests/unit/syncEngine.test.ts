import { describe, it, expect } from 'vitest'
import { isFinancialIndustry } from '~/server/utils/syncEngine'

describe('isFinancialIndustry', () => {
  it.each([
    '金融業',
    '金融控股',
    'Financial Services',
    'financial',
    'Insurance Corp',
    'insurance',
    '保險',
    '人壽保險',
    '銀行',
    '商業銀行',
    'Bank of Taiwan',
    'bank',
  ])('returns true for "%s"', (category) => {
    expect(isFinancialIndustry(category)).toBe(true)
  })

  it.each([
    'Technology',
    '電子',
    'Semiconductor',
    '半導體',
    'Biotechnology',
    '食品',
    'Steel',
    '',
  ])('returns false for "%s"', (category) => {
    expect(isFinancialIndustry(category)).toBe(false)
  })

  it('is case-insensitive for English keywords', () => {
    expect(isFinancialIndustry('FINANCIAL')).toBe(true)
    expect(isFinancialIndustry('BANK')).toBe(true)
    expect(isFinancialIndustry('INSURANCE')).toBe(true)
  })

  it('matches keyword anywhere in the string', () => {
    expect(isFinancialIndustry('International Financial Group')).toBe(true)
    expect(isFinancialIndustry('First Commercial Bank Ltd')).toBe(true)
  })
})
