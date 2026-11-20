<script setup lang="ts">
import StatusTag from '@/components/ui/StatusTag.vue'
import type { CashSessionEntry } from '@/types/cash'
import { formatCurrency, formatMovementDate, formatVisitParts } from '@/utils/format'
import { sessionRowGrid } from './grid'

const props = defineProps<{
  entry: CashSessionEntry
  selected: boolean
  branchName?: string
}>()
const emit = defineEmits<{ select: [id: string] }>()

const balanced = () =>
  props.entry.summary.difference === null || Math.abs(props.entry.summary.difference) < 0.005
</script>

<template>
  <button
    type="button"
    :class="[
      sessionRowGrid,
      'w-full px-3 py-3 text-left transition-colors',
      props.selected ? 'bg-paper' : 'hover:bg-paper/60',
    ]"
    @click="emit('select', props.entry.session.id)"
  >
    <span class="min-w-0">
      <span class="block font-display text-sm font-semibold text-ink">
        {{ props.entry.session.folio }}
      </span>
      <span v-if="props.branchName" class="mt-0.5 block truncate text-[11px] text-ink-soft">
        {{ props.branchName }}
      </span>
      <span class="mt-0.5 block truncate text-[11px] text-ink-soft">
        {{ formatVisitParts(props.entry.session.openedAt).full }}
      </span>
    </span>

    <span class="hidden text-xs text-ink-soft md:block">
      {{ formatMovementDate(props.entry.session.openedAt) }} –
      {{ formatMovementDate(props.entry.session.closedAt ?? props.entry.session.openedAt) }}
    </span>

    <span class="tnum hidden text-right text-xs text-ink md:block">
      {{ formatCurrency(props.entry.summary.expectedCash, 2) }}
    </span>
    <span class="tnum text-right text-xs font-medium text-ink">
      {{ props.entry.session.countedCash === null ? '—' : formatCurrency(props.entry.session.countedCash, 2) }}
    </span>
    <span
      class="tnum text-right text-xs font-semibold"
      :class="balanced() ? 'text-ink' : 'text-brick'"
    >
      {{ props.entry.summary.difference === null
        ? '—'
        : `${props.entry.summary.difference >= 0 ? '+' : ''}${formatCurrency(props.entry.summary.difference, 2)}` }}
    </span>

    <StatusTag
      :label="props.entry.session.closedAt ? (balanced() ? 'Cuadra' : 'Descuadre') : 'Abierta'"
      :tone="
        !props.entry.session.closedAt ? 'ok' : balanced() ? 'neutral' : 'danger'
      "
    />
  </button>
</template>
