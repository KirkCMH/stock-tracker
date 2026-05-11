export interface FinMindResponse<T> {
  status: number
  msg: string
  data: T[]
}

export interface FinMindStockInfo {
  stock_id: string
  stock_name: string
  industry_category: string
  type: string
}

export interface FinMindFinancialData {
  stock_id: string
  date: string
  type: string
  value: number
  origin_name: string
}

export interface FinMindIncomeStatement {
  stock_id: string
  date: string
  type: string
  GrossProfit: number | null
  OperatingIncome: number | null
  NetIncome: number | null
  EPS: number | null
  Revenue: number | null
}
