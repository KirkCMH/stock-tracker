<script setup lang="ts">
import type { RangeFilter } from '~/composables/useFinancialData'

const { range } = useFinancialData()

const options: { label: string; value: RangeFilter }[] = [
  { label: '近5年', value: '5y' },
  { label: '全部', value: 'max' },
]
</script>

<template>
  <div class="inline-flex rounded-md border bg-muted p-0.5">
    <button
      v-for="opt in options"
      :key="opt.value"
      class="rounded px-3 py-1 text-sm font-medium transition-colors"
      :class="range === opt.value
        ? 'bg-background text-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground'"
      @click="range = opt.value"
    >
      {{ opt.label }}
    </button>
  </div>
</template>
