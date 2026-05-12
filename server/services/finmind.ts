import type { FinMindResponse, FinMindStockInfo } from '~/types/finmind'
import type { FinancialReport } from '~/types/stock'

const FINMIND_BASE = 'https://api.finmindtrade.com/api/v4'

// 0050 ETF constituents (2024–2025)
const TW50_STOCK_IDS = new Set([
  '2330', '2317', '2454', '2308', '2382', '2303', '2881', '2882', '2412', '2891',
  '3711', '2886', '2884', '2892', '5880', '2880', '2885', '2883', '2888', '2609',
  '2603', '2615', '2379', '3034', '2357', '2395', '3008', '2376', '2327', '2353',
  '2474', '3045', '4904', '9910', '6505', '1301', '1303', '1326', '2002', '2207',
  '3481', '5871', '2887', '2890', '6669', '2912', '1216', '2610', '2618', '2337',
])

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function fetchTW50List(token: string): Promise<FinMindStockInfo[]> {
  const url = new URL(`${FINMIND_BASE}/data`)
  url.searchParams.set('dataset', 'TaiwanStockInfo')
  url.searchParams.set('token', token)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`FinMind TaiwanStockInfo failed: ${res.status}`)

  const json: FinMindResponse<FinMindStockInfo> = await res.json()
  if (json.status !== 200) throw new Error(`FinMind error: ${json.msg}`)

  return json.data.filter(s => TW50_STOCK_IDS.has(s.stock_id))
}

interface RawIncomeRow {
  stock_id: string
  date: string
  type: string
  value: number
  origin_name: string
}

export async function fetchQuarterlyFinancials(
  stockId: string,
  token: string,
): Promise<Omit<FinancialReport, 'stock_id'>[]> {
  const startDate = (() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - 2)
    return d.toISOString().slice(0, 10)
  })()

  const url = new URL(`${FINMIND_BASE}/data`)
  url.searchParams.set('dataset', 'TaiwanStockFinancialStatements')
  url.searchParams.set('data_id', stockId)
  url.searchParams.set('start_date', startDate)
  url.searchParams.set('token', token)

  await delay(2000)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`FinMind financials failed for ${stockId}: ${res.status}`)

  const json: FinMindResponse<RawIncomeRow> = await res.json()
  if (json.status !== 200) throw new Error(`FinMind error for ${stockId}: ${json.msg}`)

  return parseFinancialRows(json.data)
}

export function parseFinancialRows(rows: RawIncomeRow[]): Omit<FinancialReport, 'stock_id'>[] {
  type PeriodKey = string
  const periods = new Map<PeriodKey, {
    year: number
    quarter: number
    is_full_year: boolean
    gross_margin: number | null
    operating_margin: number | null
    net_margin: number | null
    eps: number | null
  }>()

  for (const row of rows) {
    const date = new Date(row.date)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    let quarter: number
    let is_full_year = false

    if (row.type === 'Annual') {
      quarter = 0
      is_full_year = true
    } else if (row.type === 'Q1' || month === 3) {
      quarter = 1
    } else if (row.type === 'Q2' || month === 6) {
      quarter = 2
    } else if (row.type === 'Q3' || month === 9) {
      quarter = 3
    } else if (row.type === 'Q4' || month === 12) {
      quarter = 4
    } else {
      continue
    }

    const key: PeriodKey = `${year}-${quarter}`
    if (!periods.has(key)) {
      periods.set(key, { year, quarter, is_full_year, gross_margin: null, operating_margin: null, net_margin: null, eps: null })
    }

    const entry = periods.get(key)!
    const name = row.origin_name

    if (name.includes('毛利率') || name.includes('GrossProfit') || name.toLowerCase().includes('gross')) {
      entry.gross_margin = row.value
    } else if (name.includes('營業利益率') || name.toLowerCase().includes('operating')) {
      entry.operating_margin = row.value
    } else if (name.includes('稅後淨利率') || name.includes('淨利率') || name.toLowerCase().includes('net')) {
      entry.net_margin = row.value
    } else if (name.includes('EPS') || name.includes('每股盈餘')) {
      entry.eps = row.value
    }
  }

  return Array.from(periods.values()).sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.quarter - b.quarter,
  )
}
