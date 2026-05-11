import type { TrackingStock } from '~/types/stock'

export const useStockList = () => {
  const { data: stocks, pending, error } = useFetch<TrackingStock[]>('/api/stocks')

  const search = ref('')

  const filtered = computed(() => {
    if (!stocks.value) return []
    const q = search.value.trim().toLowerCase()
    if (!q) return stocks.value
    return stocks.value.filter(s =>
      s.stock_id.toLowerCase().includes(q) || s.stock_name.toLowerCase().includes(q),
    )
  })

  return { stocks, filtered, search, pending, error }
}
