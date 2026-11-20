<script setup lang="ts">
import { computed } from 'vue'

import type { DayPoint } from '@/composables/useReportData'
import { formatCurrency } from '@/utils/format'

const props = defineProps<{ days: DayPoint[] }>()

const max = computed(() =>
  props.days.reduce((peak, day) => Math.max(peak, day.sales, day.expenses), 0),
)

const summary = computed(() =>
  props.days
    .map((day) => `${day.label}: ${formatCurrency(day.sales, 0)} en ventas, ${formatCurrency(day.expenses, 0)} en gastos`)
    .join('. '),
)

function height(value: number) {
  if (value <= 0 || max.value <= 0) return '0%'
  return `${Math.max(4, (value / max.value) * 100)}%`
}

/** En periodos largos se muestra cada tercera etiqueta para no saturar el eje. */
function showLabel(index: number) {
  return props.days.length <= 10 || index % Math.ceil(props.days.length / 10) === 0
}
</script>

<template>
  <div class="border-b border-rail pb-5">
    <div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <div>
        <h2 class="font-display text-base font-semibold text-ink">Ventas vs. gastos</h2>
        <p class="text-xs text-ink-soft">Por día · importes en USD</p>
      </div>
      <div class="flex items-center gap-3 text-[11px] text-ink-soft">
        <span class="flex items-center gap-1.5"><span class="size-2 bg-ink" aria-hidden="true" /> Ventas</span>
        <span class="flex items-center gap-1.5"><span class="size-2 bg-mustard" aria-hidden="true" /> Gastos</span>
      </div>
    </div>

    <p v-if="props.days.length === 0" class="rounded-sm bg-paper px-3 py-6 text-center text-xs text-ink-soft">
      Sin días en el periodo seleccionado.
    </p>

    <div
      v-else
      class="flex h-44 items-end gap-1 overflow-x-auto pb-1"
      role="img"
      :aria-label="`Barras diarias de ventas y gastos. ${summary}`"
    >
      <div
        v-for="(day, index) in props.days"
        :key="day.key"
        class="flex min-w-[22px] flex-1 flex-col items-center gap-1.5"
      >
        <div class="flex h-32 w-full items-end justify-center gap-[2px]" aria-hidden="true">
          <div
            class="w-[7px] rounded-t-sm bg-ink transition-[height] duration-300"
            :style="{ height: height(day.sales) }"
            :title="`${day.label} · ventas ${formatCurrency(day.sales, 2)}`"
          />
          <div
            class="w-[7px] rounded-t-sm bg-mustard transition-[height] duration-300"
            :style="{ height: height(day.expenses) }"
            :title="`${day.label} · gastos ${formatCurrency(day.expenses, 2)}`"
          />
        </div>
        <span class="h-3 text-[9px] leading-3 text-ink-soft">
          {{ showLabel(index) ? day.label : '' }}
        </span>
      </div>
    </div>
  </div>
</template>
