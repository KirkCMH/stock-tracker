import type { SyncLog, TrackingStock } from '~/types/stock'
import { fetchTW50List, fetchQuarterlyFinancials } from '../services/finmind'
import { getSupabaseAdmin } from '../services/supabase'

// Maps FinMind industry_category to a normalized label
const FINANCIAL_KEYWORDS = ['金融', 'financial', 'insurance', '保險', '銀行', 'bank']

function isFinancialIndustry(category: string): boolean {
  const lower = category.toLowerCase()
  return FINANCIAL_KEYWORDS.some(k => lower.includes(k))
}

export async function runSync(): Promise<SyncLog> {
  const config = useRuntimeConfig()
  const supabase = getSupabaseAdmin()
  const token = config.finmindToken
  const startedAt = new Date().toISOString()

  let stocksSynced = 0

  try {
    // 1. Fetch TW50 constituent list
    const tw50 = await fetchTW50List(token)

    // 2. UPSERT tracking_stocks
    const stockRows: Omit<TrackingStock, 'id'>[] = tw50.map(s => ({
      stock_id: s.stock_id,
      stock_name: s.stock_name,
      industry_type: isFinancialIndustry(s.industry_category) ? 'Financial' : s.industry_category,
    }))

    const { error: stocksError } = await supabase
      .from('tracking_stocks')
      .upsert(stockRows, { onConflict: 'stock_id' })

    if (stocksError) throw new Error(`tracking_stocks upsert failed: ${stocksError.message}`)

    // 3. Per-stock financial sync (with 2s rate-limit delay inside fetchQuarterlyFinancials)
    for (const stock of tw50) {
      try {
        const reports = await fetchQuarterlyFinancials(stock.stock_id, token)

        if (reports.length === 0) continue

        const rows = reports.map(r => ({ ...r, stock_id: stock.stock_id }))

        const { error: reportsError } = await supabase
          .from('financial_reports')
          .upsert(rows, { onConflict: 'stock_id,year,quarter' })

        if (reportsError) {
          console.error(`financial_reports upsert failed for ${stock.stock_id}:`, reportsError.message)
        } else {
          stocksSynced++
        }
      } catch (err) {
        console.error(`Skipping ${stock.stock_id}:`, err)
      }
    }

    // 4. Write success log
    const { data: log } = await supabase
      .from('sync_logs')
      .insert({ status: 'success', message: `Synced ${stocksSynced} stocks`, stocks_synced: stocksSynced })
      .select()
      .single()

    return log as SyncLog
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)

    const { data: log } = await supabase
      .from('sync_logs')
      .insert({ status: 'fail', message, stocks_synced: stocksSynced })
      .select()
      .single()

    return log as SyncLog
  }
}
