import type { TrackingStock } from '~/types/stock'

export function filterStocks(stocks: TrackingStock[], query: string): TrackingStock[] {
  const q = query.trim().toLowerCase()
  if (!q) return stocks
  return stocks.filter(s =>
    s.stock_id.toLowerCase().includes(q) || s.stock_name.toLowerCase().includes(q),
  )
}

export const useStockList = () => {
  const { data: stocks, pending, error } = useFetch<TrackingStock[]>('/api/stocks')

  const search = ref('')

  const filtered = computed(() => {
    if (!stocks.value) return []
    return filterStocks(stocks.value, search.value)
  })

  return { stocks, filtered, search, pending, error }
}
