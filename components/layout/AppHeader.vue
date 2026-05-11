<script setup lang="ts">
const { selectedStock } = useSelectedStock()
</script>

<template>
  <header class="flex h-14 items-center gap-4 border-b bg-card px-6">
    <div v-if="selectedStock" class="flex items-center gap-2">
      <span class="font-mono text-sm text-muted-foreground">{{ selectedStock.stock_id }}</span>
      <span class="font-semibold">{{ selectedStock.stock_name }}</span>
      <span
        v-if="selectedStock.industry_type === 'Financial'"
        class="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
      >金融業</span>
    </div>
    <span v-else class="text-sm text-muted-foreground">請從左側選擇股票</span>

    <div class="ml-auto">
      <SyncSyncStatusBadge />
    </div>
  </header>
</template>
