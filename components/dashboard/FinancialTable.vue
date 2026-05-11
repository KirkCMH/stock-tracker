<script setup lang="ts">
import type { FinancialReport } from '~/types/stock'

const props = defineProps<{
  reports: FinancialReport[]
  isFinancial: boolean
  loading: boolean
  stockName: string
}>()

const { exportToExcel } = useExcelExport()

function fmt(v: number | null): string {
  if (v == null) return '--'
  return v.toFixed(2)
}

function periodLabel(r: FinancialReport): string {
  if (r.is_full_year || r.quarter === 0) return '全年'
  return `Q${r.quarter}`
}

const displayReports = computed(() => [...props.reports].reverse())

function handleExport() {
  exportToExcel(props.reports, props.stockName, props.isFinancial)
}
</script>

<template>
  <div class="rounded-lg border bg-card shadow-sm">
    <div class="flex items-center justify-between border-b px-4 py-3">
      <h3 class="font-semibold">財報明細</h3>
      <button
        class="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        @click="handleExport"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
        下載 Excel
      </button>
    </div>

    <div v-if="loading" class="p-4 space-y-2">
      <div v-for="i in 5" :key="i" class="h-8 animate-pulse rounded bg-muted" />
    </div>

    <div v-else-if="reports.length === 0" class="py-12 text-center text-sm text-muted-foreground">
      暫無財報資料
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b bg-muted/50 text-left text-xs font-medium text-muted-foreground">
            <th class="px-4 py-2">年度</th>
            <th class="px-4 py-2">季度</th>
            <th v-if="!isFinancial" class="px-4 py-2 text-right">毛利率 (%)</th>
            <th class="px-4 py-2 text-right">營業利益率 (%)</th>
            <th class="px-4 py-2 text-right">淨利率 (%)</th>
            <th class="px-4 py-2 text-right">EPS (元)</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in displayReports"
            :key="`${r.year}-${r.quarter}`"
            class="border-b transition-colors last:border-0 hover:bg-muted/30"
          >
            <td class="px-4 py-2.5 font-medium">{{ r.year }}</td>
            <td class="px-4 py-2.5 text-muted-foreground">{{ periodLabel(r) }}</td>
            <td v-if="!isFinancial" class="px-4 py-2.5 text-right font-mono">{{ fmt(r.gross_margin) }}</td>
            <td class="px-4 py-2.5 text-right font-mono">{{ fmt(r.operating_margin) }}</td>
            <td class="px-4 py-2.5 text-right font-mono">{{ fmt(r.net_margin) }}</td>
            <td class="px-4 py-2.5 text-right font-mono">{{ fmt(r.eps) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
