import { getSupabaseAdmin } from '../../services/supabase'

export default defineEventHandler(async (event) => {
  const stockId = getRouterParam(event, 'stockId')
  if (!stockId) throw createError({ statusCode: 400, message: 'stockId is required' })

  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('financial_reports')
    .select('*')
    .eq('stock_id', stockId)
    .order('year', { ascending: true })
    .order('quarter', { ascending: true })

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data
})
