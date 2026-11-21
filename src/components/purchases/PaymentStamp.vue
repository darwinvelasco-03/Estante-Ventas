<script setup lang="ts">
import { computed } from 'vue'

import type { PaymentMethod } from '@/types/pos'
import { formatMovementDate, formatVisitParts } from '@/utils/format'

const props = defineProps<{ paid: boolean; date: string | null; method: PaymentMethod }>()

const label = computed(() => (props.paid ? 'PAGADA' : 'SIN PAGAR'))
const methodLabel = computed(() => (props.method === 'efectivo' ? 'Efectivo' : 'Tarjeta'))
const detail = computed(() =>
  props.paid && props.date
    ? `${methodLabel.value} · ${formatVisitParts(props.date).full}`
    : 'Se contabilizará como egreso al marcarla como pagada',
)
</script>

<template>
  <span class="flex flex-col items-start gap-0.5 md:items-end">
    <span
      class="inline-flex items-center gap-1.5 border px-2 py-0.5 font-display text-[10px] font-bold tracking-[0.14em]"
      :class="
        props.paid
          ? 'border-ok/50 bg-ok-soft text-ink'
          : 'border-rail bg-paper text-ink-soft'
      "
      :title="detail"
    >
      <span aria-hidden="true">{{ props.paid ? '✓' : '○' }}</span>
      {{ label }}
    </span>
    <span class="text-[10px] text-ink-soft">
      {{ props.paid && props.date ? `${methodLabel} · ${formatMovementDate(props.date)}` : 'sin pagar' }}
    </span>
  </span>
</template>
