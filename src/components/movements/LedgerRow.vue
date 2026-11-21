<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import type { LedgerEntry, LedgerKind } from '@/types/reversal'
import { formatCurrency, formatMovementDate } from '@/utils/format'
import { ledgerGrid } from './grid'

const props = defineProps<{ entry: LedgerEntry; selected: boolean; canRevert: boolean }>()

const emit = defineEmits<{ select: [id: string]; revert: [entry: LedgerEntry] }>()

const kindLabels: Record<LedgerKind, string> = {
  venta: 'Venta',
  inventario: 'Inventario',
  compra: 'Compra',
  gasto: 'Gasto',
}

const kindClasses: Record<LedgerKind, string> = {
  venta: 'bg-ok-soft text-ink',
  inventario: 'bg-paper text-ink-soft',
  compra: 'bg-brick-soft text-brick',
  gasto: 'bg-mustard-soft text-mustard',
}
</script>

<template>
  <div
    :class="[
      ledgerGrid,
      'px-3 py-3 transition-colors',
      props.selected ? 'bg-paper' : 'hover:bg-paper/60',
    ]"
  >
    <span class="hidden text-xs text-ink-soft md:block">
      {{ formatMovementDate(props.entry.date) }}
    </span>

    <button type="button" class="min-w-0 text-left" @click="emit('select', props.entry.id)">
      <span class="block truncate font-display text-sm font-semibold text-ink">
        {{ props.entry.folio }}
      </span>
      <span class="mt-0.5 block truncate text-xs text-ink-soft">{{ props.entry.title }}</span>
      <span class="mt-0.5 block text-[11px] text-ink-soft md:hidden">
        {{ formatMovementDate(props.entry.date) }} · {{ kindLabels[props.entry.kind] }}
      </span>
      <span v-if="props.entry.reversal" class="mt-0.5 block text-[11px] text-brick md:hidden">
        Anulado · {{ formatMovementDate(props.entry.reversal.reversedAt) }}
      </span>
    </button>

    <span class="hidden md:block">
      <span
        class="inline-flex rounded-sm px-2 py-1 text-[11px] font-medium"
        :class="kindClasses[props.entry.kind]"
      >
        {{ kindLabels[props.entry.kind] }}
      </span>
    </span>

    <span class="hidden truncate text-xs text-ink-soft md:block">
      {{ props.entry.detail }}
    </span>

    <span class="hidden text-right md:block">
      <span
        class="tnum block text-sm font-medium"
        :class="props.entry.reversal ? 'text-ink-soft line-through' : 'text-ink'"
      >
        {{ props.entry.amount === null ? '—' : formatCurrency(props.entry.amount, 0, props.entry.currency) }}
      </span>
      <span v-if="props.entry.paymentMethod" class="block text-[10px] text-ink-soft">
        {{ props.entry.paymentMethod }}
      </span>
    </span>

    <StatusTag
      class="hidden md:inline-flex"
      :label="props.entry.reversal ? 'Anulado' : 'Activo'"
      :tone="props.entry.reversal ? 'danger' : 'ok'"
    />

    <span class="flex justify-end">
      <button
        v-if="props.canRevert && !props.entry.reversal"
        type="button"
        class="inline-flex items-center gap-1 rounded-sm border border-brick/40 px-2 py-1 text-xs text-brick hover:border-brick"
        :aria-label="`Anular ${props.entry.kind} ${props.entry.folio}`"
        @click="emit('revert', props.entry)"
      >
        <AppIcon name="close" :size="12" />
        <span class="hidden sm:inline">Anular</span>
      </button>
      <span v-else-if="props.entry.reversal" class="text-[11px] text-ink-soft md:hidden">
        Anulado
      </span>
    </span>
  </div>
</template>
