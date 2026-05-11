<script setup lang="ts">
import type { ChartDataResult } from '~/composables/useChartData'

const props = defineProps<{
  chartData: ChartDataResult
  loading: boolean
}>()

const allSeries = computed(() => {
  if (props.chartData.hasIncompleteYear) {
    const merged: { name: string; data: { x: string; y: number | null }[] }[] = []
    for (let i = 0; i < props.chartData.seriesSolid.length; i++) {
      merged.push(props.chartData.seriesSolid[i])
      if (props.chartData.seriesDashed[i]) {
        merged.push(props.chartData.seriesDashed[i])
      }
    }
    return merged
  }
  return props.chartData.seriesSolid
})

const chartOptions = computed(() => ({
  chart: {
    type: 'line' as const,
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: true, speed: 400 },
  },
  stroke: {
    curve: 'smooth' as const,
    width: 2.5,
    dashArray: props.chartData.dashArray,
  },
  colors: props.chartData.colors,
  xaxis: {
    type: 'category' as const,
    labels: { rotate: -30, style: { fontSize: '11px' } },
  },
  yaxis: {
    labels: {
      formatter: (v: number) => `${v.toFixed(1)}`,
    },
  },
  tooltip: {
    shared: true,
    y: { formatter: (v: number | null) => v != null ? `${v.toFixed(2)}` : '--' },
  },
  legend: {
    position: 'top' as const,
    horizontalAlign: 'left' as const,
  },
  grid: { borderColor: '#e5e7eb' },
}))
</script>

<template>
  <div class="rounded-lg border bg-card p-4 shadow-sm">
    <div v-if="loading" class="flex h-64 items-center justify-center">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
    <div v-else-if="allSeries.length === 0" class="flex h-64 items-center justify-center text-sm text-muted-foreground">
      暫無資料
    </div>
    <ClientOnly v-else>
      <VueApexCharts
        type="line"
        height="320"
        :options="chartOptions"
        :series="allSeries"
      />
      <template #fallback>
        <div class="h-80 animate-pulse rounded bg-muted" />
      </template>
    </ClientOnly>
    <p v-if="chartData.hasIncompleteYear" class="mt-2 text-xs text-muted-foreground">
      * 虛線部分為當年度尚未公布完整財報（前幾季累計）
    </p>
  </div>
</template>
