<script setup lang="ts">
defineProps<{
  label: string
  value: string
  unit?: string
  delta?: number | null
}>()
</script>

<template>
  <div class="rounded-lg border bg-card p-4 shadow-sm">
    <p class="text-xs font-medium text-muted-foreground">{{ label }}</p>
    <p class="mt-1 text-2xl font-bold">
      {{ value }}<span v-if="unit" class="ml-1 text-sm font-normal text-muted-foreground">{{ unit }}</span>
    </p>
    <p
      v-if="delta !== undefined && delta !== null"
      class="mt-1 text-xs"
      :class="delta >= 0 ? 'text-green-600' : 'text-red-500'"
    >
      {{ delta >= 0 ? '+' : '' }}{{ delta.toFixed(2) }}% YoY
    </p>
  </div>
</template>
