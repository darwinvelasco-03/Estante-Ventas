<script setup lang="ts">
import { computed } from 'vue'

import type { Purchase } from '@/types/purchase'
import { formatCurrency, formatMovementDate } from '@/utils/format'
import { purchaseRowGrid } from './grid'
import PaymentStamp from './PaymentStamp.vue'
import ReceivedStamp from './ReceivedStamp.vue'

const props = defineProps<{ purchase: Purchase; selected: boolean }>()

const emit = defineEmits<{ select: [id: string] }>()

const completed = computed(() => props.purchase.lines.filter((line) => line.received >= line.ordered).length)
const progress = computed(() =>
  props.purchase.lines.length === 0 ? 0 : (completed.value / props.purchase.lines.length) * 100,
)
const total = computed(() =>
  formatCurrency(
    props.purchase.lines.reduce((sum, line) => sum + line.ordered * line.unitCost, 0),
    0,
    props.purchase.currency,
  ),
)
</script>

<template>
  <button
    type="button"
    :class="[
      purchaseRowGrid,
      'w-full px-3 py-3 text-left transition-colors',
      props.selected ? 'bg-paper' : 'hover:bg-paper/60',
    ]"
    @click="emit('select', props.purchase.id)"
  >
    <span class="min-w-0">
      <span class="block truncate font-display text-sm font-semibold text-ink">
        {{ props.purchase.folio }}
      </span>
      <span class="mt-0.5 block truncate text-xs text-ink-soft">
        {{ props.purchase.supplierName }}
      </span>
      <span class="mt-1 block text-[11px] text-ink-soft">
        {{ props.purchase.lines.length }} renglones · {{ formatMovementDate(props.purchase.createdAt) }}
      </span>
    </span>

    <span class="flex flex-col gap-1 md:items-start">
      <span class="flex items-center gap-2">
        <span class="h-1.5 w-20 overflow-hidden rounded-full bg-rail" aria-hidden="true">
          <span
            class="block h-full rounded-full"
            :class="props.purchase.receivedAt ? 'bg-ok' : 'bg-mustard'"
            :style="{ width: `${progress}%` }"
          />
        </span>
        <span class="tnum text-[11px] text-ink-soft">
          {{ completed }}/{{ props.purchase.lines.length }} renglones
        </span>
      </span>
      <span class="sr-only">Recepción: {{ completed }} de {{ props.purchase.lines.length }} renglones</span>
    </span>

    <span class="hidden text-right md:block">
      <span class="tnum block text-sm font-medium text-ink">{{ total }}</span>
      <span class="block text-[10px] tracking-wide text-ink-soft">{{ props.purchase.currency }}</span>
    </span>

    <span class="flex flex-wrap items-start justify-end gap-x-3 gap-y-1 md:justify-end">
      <PaymentStamp
        :paid="!!props.purchase.paidAt"
        :date="props.purchase.paidAt"
        :method="props.purchase.paymentMethod"
      />
      <ReceivedStamp :received="!!props.purchase.receivedAt" :date="props.purchase.receivedAt" />
    </span>
  </button>
</template>
