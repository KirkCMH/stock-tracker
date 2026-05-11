import type { TrackingStock } from '~/types/stock'

export const useSelectedStock = () => {
  const selectedStock = useState<TrackingStock | null>('selectedStock', () => null)

  function setStock(stock: TrackingStock) {
    selectedStock.value = stock
  }

  return { selectedStock, setStock }
}
