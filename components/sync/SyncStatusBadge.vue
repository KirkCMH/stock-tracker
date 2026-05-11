<script setup lang="ts">
import type { SyncLog } from '~/types/stock'

const { data: logs } = useFetch<SyncLog[]>('/api/sync-logs', {
  server: false,
})

const latest = computed(() => logs.value?.[0] ?? null)

const timeAgo = computed(() => {
  if (!latest.value) return ''
  const diff = Date.now() - new Date(latest.value.created_at).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} 分鐘前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小時前`
  return `${Math.floor(hours / 24)} 天前`
})
</script>

<template>
  <div v-if="latest" class="flex items-center gap-2 text-xs text-muted-foreground">
    <span
      class="inline-block h-2 w-2 rounded-full"
      :class="latest.status === 'success' ? 'bg-green-500' : 'bg-red-500'"
    />
    <span>上次同步：{{ timeAgo }}</span>
  </div>
</template>
