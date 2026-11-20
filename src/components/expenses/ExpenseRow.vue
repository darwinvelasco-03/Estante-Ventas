<script setup lang="ts">
import StatusTag from '@/components/ui/StatusTag.vue'
import type { Expense } from '@/types/expense'
import { formatCurrency, formatMovementDate } from '@/utils/format'
import { expenseRowGrid } from './grid'

const props = defineProps<{ expense: Expense; selected: boolean }>()

const emit = defineEmits<{ select: [id: string] }>()
</script>

<template>
  <button
    type="button"
    :class="[
      expenseRowGrid,
      'w-full px-3 py-3 text-left transition-colors',
      props.selected ? 'bg-paper' : 'hover:bg-paper/60',
    ]"
    @click="emit('select', props.expense.id)"
  >
    <span class="min-w-0">
      <span class="block truncate font-display text-sm font-semibold text-ink">
        {{ props.expense.folio }}
      </span>
      <span class="mt-0.5 block truncate text-xs text-ink-soft">{{ props.expense.concept }}</span>
      <span v-if="props.expense.supplierName" class="mt-1 block truncate text-[11px] text-ink-soft">
        {{ props.expense.supplierName }}
      </span>
    </span>

    <span>
      <span class="inline-flex rounded-sm bg-mustard-soft px-2 py-1 text-[11px] text-mustard">
        {{ props.expense.category }}
      </span>
    </span>

    <span class="hidden text-xs text-ink-soft md:block">
      {{ formatMovementDate(props.expense.date) }}
    </span>

    <span class="hidden text-right md:block">
      <span class="tnum block text-sm font-medium text-ink">
        {{ formatCurrency(props.expense.amount, 0, props.expense.currency) }}
      </span>
      <span class="block text-[10px] tracking-wide text-ink-soft">{{ props.expense.currency }}</span>
    </span>

    <StatusTag
      :label="props.expense.status === 'pagado' ? 'Pagado' : 'Pendiente'"
      :tone="props.expense.status === 'pagado' ? 'ok' : 'warn'"
    />
  </button>
</template>
