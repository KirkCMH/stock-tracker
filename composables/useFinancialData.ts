import type { FinancialReport } from '~/types/stock'

export type RangeFilter = '5y' | 'max'

export const useFinancialData = () => {
  const { selectedStock } = useSelectedStock()
  const range = useState<RangeFilter>('financialRange', () => '5y')

  const { data: reports, pending, error } = useFetch<FinancialReport[]>(
    () => selectedStock.value ? `/api/financials/${selectedStock.value.stock_id}` : null as unknown as string,
    { watch: [selectedStock] },
  )

  const filtered = computed<FinancialReport[]>(() => {
    if (!reports.value) return []
    if (range.value === 'max') return reports.value

    const cutoff = new Date().getFullYear() - 5
    return reports.value.filter(r => r.year >= cutoff)
  })

  return { reports: filtered, allReports: reports, range, pending, error }
}
