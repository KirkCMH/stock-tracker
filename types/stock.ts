export interface TrackingStock {
  id: string
  stock_id: string
  stock_name: string
  industry_type: string
}

export interface FinancialReport {
  stock_id: string
  year: number
  quarter: number
  gross_margin: number | null
  operating_margin: number | null
  net_margin: number | null
  eps: number | null
  is_full_year: boolean
}

export interface SyncLog {
  id: string
  created_at: string
  status: 'success' | 'fail'
  message: string
  stocks_synced: number
}
