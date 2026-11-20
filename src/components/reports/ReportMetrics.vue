<script setup lang="ts">
import { computed } from 'vue'

import type { ReportData } from '@/composables/useReportData'
import { formatCurrency, formatNumber, formatPercent } from '@/utils/format'

const props = defineProps<{ data: ReportData }>()

const metrics = computed(() => [
  {
    label: 'Ventas del periodo',
    value: formatCurrency(props.data.salesTotal),
    hint: `${formatNumber(props.data.sales.length)} cobros registrados`,
    tone: 'default',
  },
  {
    label: 'Gastos pagados',
    value: formatCurrency(props.data.expensesTotal),
    hint: `${formatNumber(props.data.expenses.length)} egresos pagados`,
    tone: 'default',
  },
  {
    label: 'Utilidad',
    value: formatCurrency(props.data.profit),
    hint: 'Ventas menos gastos del periodo',
    tone: props.data.profit < 0 ? 'warn' : 'default',
  },
  {
    label: 'Margen',
    value: formatPercent(Math.round(props.data.margin * 10) / 10),
    hint: `Ticket promedio ${formatCurrency(props.data.avgTicket)}`,
    tone: props.data.margin < 0 ? 'warn' : 'default',
  },
])
</script>

<template>
  <section
    class="grid grid-cols-2 divide-x divide-y divide-rail rounded-sm border border-rail bg-surface md:grid-cols-4 md:divide-y-0"
    aria-label="Indicadores del periodo"
  >
    <div v-for="metric in metrics" :key="metric.label" class="min-w-0 px-4 py-4 sm:px-5">
      <p class="truncate text-xs text-ink-soft">{{ metric.label }}</p>
      <p
        class="tnum mt-1.5 font-display text-xl font-semibold tracking-tight sm:text-2xl"
        :class="metric.tone === 'warn' ? 'text-brick' : 'text-ink'"
      >
        {{ metric.value }}
      </p>
      <p class="mt-0.5 truncate text-[11px] text-ink-soft">{{ metric.hint }}</p>
    </div>
  </section>
</template>
