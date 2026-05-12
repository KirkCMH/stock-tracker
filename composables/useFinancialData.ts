import type { FinancialReport } from '~/types/stock'

export type RangeFilter = '5y' | 'max'

export function filterReportsByRange(
  reports: FinancialReport[],
  range: RangeFilter,
  currentYear = new Date().getFullYear(),
): FinancialReport[] {
  if (range === 'max') return reports
  const cutoff = currentYear - 5
  return reports.filter(r => r.year >= cutoff)
}

export const useFinancialData = () => {
  const { selectedStock } = useSelectedStock()
  const range = useState<RangeFilter>('financialRange', () => '5y')

  const { data: reports, pending, error, refresh } = useFetch<FinancialReport[]>(
    () => `/api/financials/${selectedStock.value?.stock_id ?? '_none_'}`,
    { immediate: false },
  )

  watch(selectedStock, (stock) => {
    if (stock) refresh()
  }, { immediate: true })

  const filtered = computed<FinancialReport[]>(() => {
    if (!reports.value) return []
    return filterReportsByRange(reports.value, range.value)
  })

  return { reports: filtered, allReports: reports, range, pending, error }
}
