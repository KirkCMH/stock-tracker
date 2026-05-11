<script setup lang="ts">
const { selectedStock } = useSelectedStock()
const { reports, pending } = useFinancialData()
const { chartData } = useChartData()

const isFinancial = computed(() => selectedStock.value?.industry_type === 'Financial')
</script>

<template>
  <div>
    <div v-if="!selectedStock" class="flex h-full flex-col items-center justify-center gap-4 py-24 text-center">
      <div class="text-5xl">📊</div>
      <h2 class="text-xl font-semibold">選擇一支股票開始分析</h2>
      <p class="text-sm text-muted-foreground">從左側清單中點擊任一 0050 成份股</p>
    </div>

    <div v-else class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold">
            {{ selectedStock.stock_id }} {{ selectedStock.stock_name }}
          </h2>
          <p class="text-sm text-muted-foreground">{{ selectedStock.industry_type }}</p>
        </div>
        <RangeToggle />
      </div>

      <StatsSummary :reports="reports" :is-financial="isFinancial" />

      <MarginChart :chart-data="chartData" :loading="pending" />

      <FinancialTable
        :reports="reports"
        :is-financial="isFinancial"
        :loading="pending"
        :stock-name="selectedStock.stock_name"
      />
    </div>
  </div>
</template>
