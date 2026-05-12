import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  const config = useRuntimeConfig()
  const url = process.env.SUPABASE_URL ?? config.public.supabaseUrl
  return createClient(url, config.supabaseServiceKey)
}
