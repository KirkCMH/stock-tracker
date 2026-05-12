import { defineComponent, h } from 'vue'

export default defineNuxtPlugin(async (nuxtApp) => {
  if (import.meta.client) {
    const { default: VueApexCharts } = await import('vue3-apexcharts')
    nuxtApp.vueApp.component('VueApexCharts', VueApexCharts)
  }
  else {
    // No-op stub so Vue resolves the component name during SSR without warning.
    // <ClientOnly> in MarginChart.vue prevents it from actually rendering server-side.
    nuxtApp.vueApp.component('VueApexCharts', defineComponent({
      render: () => h('div'),
    }))
  }
})
