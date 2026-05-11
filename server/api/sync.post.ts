import { runSync } from '../utils/syncEngine'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secret = getHeader(event, 'x-sync-secret')

  if (!config.syncSecret || secret !== config.syncSecret) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const log = await runSync()
  return log
})
