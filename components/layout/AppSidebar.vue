<script setup lang="ts">
const { filtered, search, pending } = useStockList()
const { selectedStock, setStock } = useSelectedStock()
</script>

<template>
  <aside class="flex h-full w-64 flex-shrink-0 flex-col border-r bg-card">
    <div class="border-b p-4">
      <h1 class="text-lg font-bold tracking-tight">台灣50財報追蹤</h1>
      <p class="text-xs text-muted-foreground">0050 成份股財務趨勢</p>
    </div>

    <div class="p-3">
      <input
        v-model="search"
        type="text"
        placeholder="搜尋股票代碼或名稱..."
        class="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>

    <div class="flex-1 overflow-y-auto p-2">
      <div v-if="pending" class="space-y-1">
        <div
          v-for="i in 12"
          :key="i"
          class="h-10 animate-pulse rounded-md bg-muted"
        />
      </div>

      <div v-else-if="filtered.length === 0" class="py-8 text-center text-sm text-muted-foreground">
        查無符合的股票
      </div>

      <button
        v-for="stock in filtered"
        :key="stock.stock_id"
        class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
        :class="selectedStock?.stock_id === stock.stock_id ? 'bg-accent font-medium' : ''"
        @click="setStock(stock)"
      >
        <span class="font-mono text-xs text-muted-foreground">{{ stock.stock_id }}</span>
        <span class="truncate">{{ stock.stock_name }}</span>
        <span
          v-if="stock.industry_type === 'Financial'"
          class="ml-auto rounded bg-blue-100 px-1 py-0.5 text-xs text-blue-700"
        >金融</span>
      </button>
    </div>
  </aside>
</template>
