<script setup lang="ts">
import { computed } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import { currencyCode } from '@/stores/currency'
import type { Expense, ExpensePaymentMethod } from '@/types/expense'
import { formatCurrency, formatVisitParts } from '@/utils/format'

const props = defineProps<{ expense: Expense | null; readonly?: boolean }>()

const emit = defineEmits<{ edit: []; pay: []; remove: []; create: [] }>()

const methodLabels: Record<ExpensePaymentMethod, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
}

const date = computed(() => formatVisitParts(props.expense?.date ?? null).full)
const differentCurrency = computed(
  () => !!props.expense && props.expense.currency !== currencyCode.value,
)
</script>

<template>
  <div>
    <StatePanel
      v-if="!props.expense"
      icon="expenses"
      title="Selecciona un gasto"
      message="Abre un gasto para ver su detalle, o registra uno nuevo."
    >
      <button
        v-if="!props.readonly"
        type="button"
        class="rounded-sm border border-rail px-3 py-1.5 text-xs font-medium text-ink hover:border-ink"
        @click="emit('create')"
      >
        Nuevo gasto
      </button>
    </StatePanel>

    <template v-else>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="font-data text-[11px] tracking-wide text-ink-soft">{{ props.expense.folio }}</p>
          <h3 class="mt-0.5 font-display text-lg font-semibold text-ink">
            {{ props.expense.concept }}
          </h3>
          <p class="mt-1 text-xs text-ink-soft">{{ date }}</p>
        </div>
        <StatusTag
          :label="props.expense.status === 'pagado' ? 'Pagado' : 'Pendiente de pago'"
          :tone="props.expense.status === 'pagado' ? 'ok' : 'warn'"
        />
      </div>

      <div class="mt-5 rounded-sm border border-rail bg-paper p-4">
        <p class="text-[11px] tracking-wide text-ink-soft">Monto del gasto</p>
        <p class="tnum mt-1 font-display text-2xl font-semibold text-ink">
          {{ formatCurrency(props.expense.amount, 2, props.expense.currency) }}
        </p>
        <p v-if="differentCurrency" class="mt-1 text-[11px] text-ink-soft">
          Equivale a {{ formatCurrency(props.expense.amount, 2) }} con la tasa actual.
        </p>
      </div>

      <dl class="mt-5 divide-y divide-rail text-sm">
        <div class="flex items-center justify-between gap-3 py-2.5">
          <dt class="text-ink-soft">Categoría</dt>
          <dd class="font-medium text-ink">{{ props.expense.category }}</dd>
        </div>
        <div class="flex items-center justify-between gap-3 py-2.5">
          <dt class="text-ink-soft">Proveedor</dt>
          <dd class="text-right text-ink">{{ props.expense.supplierName || 'Sin proveedor' }}</dd>
        </div>
        <div class="flex items-center justify-between gap-3 py-2.5">
          <dt class="text-ink-soft">Forma de pago</dt>
          <dd class="text-ink">{{ methodLabels[props.expense.paymentMethod] }}</dd>
        </div>
        <div class="flex items-center justify-between gap-3 py-2.5">
          <dt class="text-ink-soft">Registrado</dt>
          <dd class="text-ink">{{ formatVisitParts(props.expense.createdAt).full }}</dd>
        </div>
        <div v-if="props.expense.paidAt" class="flex items-center justify-between gap-3 py-2.5">
          <dt class="text-ink-soft">Pagado el</dt>
          <dd class="text-ink">{{ formatVisitParts(props.expense.paidAt).full }}</dd>
        </div>
      </dl>

      <p v-if="props.expense.note" class="mt-4 rounded-sm bg-paper px-3 py-2 text-xs text-ink-soft">
        {{ props.expense.note }}
      </p>

      <div v-if="!props.readonly" class="mt-5 flex flex-wrap gap-2">
        <button
          v-if="props.expense.status === 'pendiente'"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 font-display text-sm font-semibold text-surface hover:bg-ink-soft"
          @click="emit('pay')"
        >
          <AppIcon name="check" :size="15" />
          Marcar pagado
        </button>
        <button
          v-if="props.expense.status === 'pendiente'"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-sm border border-rail px-3 py-2 text-sm text-ink hover:border-ink"
          @click="emit('edit')"
        >
          Editar gasto
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-sm border border-brick/40 px-3 py-2 text-sm text-brick hover:border-brick"
          @click="emit('remove')"
        >
          <AppIcon name="trash" :size="15" />
          Eliminar
        </button>
      </div>
    </template>
  </div>
</template>
