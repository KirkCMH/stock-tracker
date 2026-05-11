import { getSupabaseAdmin } from '../services/supabase'

export default defineEventHandler(async () => {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data
})
