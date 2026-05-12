/**
 * Seeds mock Taiwan 50 data into Supabase for local testing.
 * Use when FinMind API is unavailable.
 *
 * Run: npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.NUXT_SUPABASE_SERVICE_KEY!,
)

const STOCKS = [
  { stock_id: '2330', stock_name: '台積電', industry_type: 'Semiconductor' },
  { stock_id: '2317', stock_name: '鴻海', industry_type: 'Electronics' },
  { stock_id: '2454', stock_name: '聯發科', industry_type: 'Semiconductor' },
  { stock_id: '2882', stock_name: '國泰金', industry_type: 'Financial' },
  { stock_id: '2881', stock_name: '富邦金', industry_type: 'Financial' },
  { stock_id: '2412', stock_name: '中華電', industry_type: 'Telecom' },
  { stock_id: '2308', stock_name: '台達電', industry_type: 'Electronics' },
  { stock_id: '2303', stock_name: '聯電', industry_type: 'Semiconductor' },
]

function makeReports(stockId: string, isFinancial: boolean) {
  const reports = []
  const currentYear = new Date().getFullYear()

  for (let year = currentYear - 9; year <= currentYear; year++) {
    const quarters = year < currentYear ? [1, 2, 3, 4] : [1, 2]
    for (const quarter of quarters) {
      const base = 20 + Math.random() * 30
      reports.push({
        stock_id: stockId,
        year,
        quarter,
        gross_margin: isFinancial ? null : +(base + Math.random() * 10).toFixed(2),
        operating_margin: +(base - 5 + Math.random() * 8).toFixed(2),
        net_margin: +(base - 8 + Math.random() * 6).toFixed(2),
        eps: +(2 + Math.random() * 8).toFixed(2),
        is_full_year: false,
      })
    }

    // Add full-year record for completed years
    if (year < currentYear) {
      const base = 22 + Math.random() * 28
      reports.push({
        stock_id: stockId,
        year,
        quarter: 0,
        gross_margin: isFinancial ? null : +(base + Math.random() * 10).toFixed(2),
        operating_margin: +(base - 5 + Math.random() * 8).toFixed(2),
        net_margin: +(base - 8 + Math.random() * 6).toFixed(2),
        eps: +(8 + Math.random() * 20).toFixed(2),
        is_full_year: true,
      })
    }
  }

  return reports
}

async function seed() {
  console.log('Seeding tracking_stocks...')
  const { error: stocksErr } = await supabase
    .from('tracking_stocks')
    .upsert(STOCKS, { onConflict: 'stock_id' })

  if (stocksErr) {
    console.error('Failed to seed stocks:', stocksErr.message)
    process.exit(1)
  }
  console.log(`  ✓ ${STOCKS.length} stocks inserted`)

  console.log('Seeding financial_reports...')
  let totalReports = 0
  for (const stock of STOCKS) {
    const isFinancial = stock.industry_type === 'Financial'
    const reports = makeReports(stock.stock_id, isFinancial)

    const { error } = await supabase
      .from('financial_reports')
      .upsert(reports, { onConflict: 'stock_id,year,quarter' })

    if (error) {
      console.error(`  ✗ ${stock.stock_id}: ${error.message}`)
    } else {
      console.log(`  ✓ ${stock.stock_id} ${stock.stock_name}: ${reports.length} records`)
      totalReports += reports.length
    }
  }

  console.log('Seeding sync_logs...')
  const { error: logErr } = await supabase
    .from('sync_logs')
    .insert({ status: 'success', message: `Seeded ${STOCKS.length} stocks (mock data)`, stocks_synced: STOCKS.length })

  if (logErr) console.warn('  ⚠ sync_log insert failed:', logErr.message)

  console.log(`\nDone! ${STOCKS.length} stocks, ${totalReports} financial records seeded.`)
  console.log('Run "npm run dev" and open http://localhost:3000 to see data.')
}

seed().catch(console.error)
