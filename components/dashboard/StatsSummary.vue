<script setup lang="ts">
import type { FinancialReport } from '~/types/stock'

const props = defineProps<{
  reports: FinancialReport[]
  isFinancial: boolean
}>()

function fmt(v: number | null | undefined): string {
  if (v == null) return '--'
  return v.toFixed(2)
}

const latest = computed(() => props.reports[props.reports.length - 1] ?? null)
const prev = computed(() => props.reports[props.reports.length - 2] ?? null)

function delta(curr: number | null | undefined, previous: number | null | undefined): number | null {
  if (curr == null || previous == null || previous === 0) return null
  return ((curr - previous) / Math.abs(previous)) * 100
}
</script>

<template>
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4" :class="isFinancial ? 'lg:grid-cols-3' : ''">
    <StatCard
      v-if="!isFinancial"
      label="毛利率"
      :value="fmt(latest?.gross_margin)"
      unit="%"
      :delta="delta(latest?.gross_margin, prev?.gross_margin)"
    />
    <StatCard
      label="營業利益率"
      :value="fmt(latest?.operating_margin)"
      unit="%"
      :delta="delta(latest?.operating_margin, prev?.operating_margin)"
    />
    <StatCard
      label="淨利率"
      :value="fmt(latest?.net_margin)"
      unit="%"
      :delta="delta(latest?.net_margin, prev?.net_margin)"
    />
    <StatCard
      label="EPS"
      :value="fmt(latest?.eps)"
      unit="元"
      :delta="delta(latest?.eps, prev?.eps)"
    />
  </div>
</template>
