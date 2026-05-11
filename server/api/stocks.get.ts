import { getSupabaseAdmin } from '../services/supabase'

export default defineEventHandler(async () => {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('tracking_stocks')
    .select('*')
    .order('stock_id', { ascending: true })

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data
})
