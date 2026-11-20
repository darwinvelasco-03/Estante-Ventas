<script setup lang="ts">
import { computed } from 'vue'

import type { MovementType, StockMovement } from '@/types/inventory'
import { formatMovementDate } from '@/utils/format'
import { movementGrid } from './grid'
import SaldoRail from './SaldoRail.vue'

const props = defineProps<{ movement: StockMovement; last: boolean }>()

const typeLabels: Record<MovementType, string> = {
  entrada: 'Entrada',
  salida: 'Salida',
  conteo: 'Conteo',
}

const tone = computed(() => {
  if (props.movement.type === 'conteo') return 'mustard' as const
  if (props.movement.type === 'salida' && props.movement.reason === 'Merma') return 'brick' as const
  return 'ink' as const
})

const toneText = {
  ink: 'text-ink',
  mustard: 'text-mustard',
  brick: 'text-brick',
}
const date = computed(() => formatMovementDate(props.movement.createdAt))
const sign = computed(() => (props.movement.delta >= 0 ? '+' : '−'))
const amount = computed(() => Math.abs(props.movement.delta))
</script>

<template>
  <div :class="[movementGrid, 'px-3 py-3']">
    <span class="hidden font-data text-[11px] text-ink-soft md:block">{{ date }}</span>

    <span class="min-w-0">
      <span class="block truncate font-display text-sm font-semibold text-ink">
        {{ props.movement.productName }}
      </span>
      <span class="mt-0.5 block truncate text-[11px] text-ink-soft md:hidden">
        {{ date }} · {{ typeLabels[props.movement.type] }} · {{ props.movement.reason }}
        <template v-if="props.movement.note"> · {{ props.movement.note }}</template>
      </span>
      <span class="mt-0.5 hidden truncate font-data text-[11px] text-ink-soft md:block">
        {{ props.movement.productSku }}
        <template v-if="props.movement.note"> · {{ props.movement.note }}</template>
      </span>
    </span>

    <span class="hidden text-xs text-ink-soft md:block">
      {{ typeLabels[props.movement.type] }}
    </span>

    <span class="text-right font-display text-sm font-semibold" :class="toneText[tone]">
      {{ sign }}{{ amount }}
    </span>

    <span class="hidden truncate text-xs text-ink-soft md:block">
      {{ props.movement.reason }}
    </span>

    <span class="col-span-2 flex items-center justify-end gap-2 md:col-auto">
      <SaldoRail :tone="tone" :last="props.last" />
      <span class="tnum w-6 text-right text-sm text-ink">{{ props.movement.balance }}</span>
    </span>
  </div>
</template>
