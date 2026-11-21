<script setup lang="ts">
import { computed } from 'vue'

import CashAdjustments from './CashAdjustments.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import { orderedTotal } from '@/stores/purchases'
import type { CashSessionEntry } from '@/types/cash'
import {
  formatCurrency,
  formatMovementDate,
  formatVisitParts,
} from '@/utils/format'

const props = defineProps<{ entry: CashSessionEntry | null; branchName?: string }>()

const balanced = computed(() => {
  const difference = props.entry?.summary.difference
  return difference === null || difference === undefined || Math.abs(difference) < 0.005
})

const methodLabel = (method: string) => (method === 'efectivo' ? 'Efectivo' : 'Tarjeta')

const period = computed(() => {
  const session = props.entry?.session
  if (!session) return ''
  const end = session.closedAt ? formatVisitParts(session.closedAt).full : 'ahora'
  return `${formatVisitParts(session.openedAt).full} · ${formatMovementDate(session.openedAt)} → ${end}`
})
</script>

<template>
  <div>
    <StatePanel
      v-if="!props.entry"
      icon="cash"
      title="Selecciona una sesión"
      message="Abre una sesión cerrada para revisar el arqueo y los movimientos que lo integran."
    />

    <template v-else>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="font-data text-[11px] tracking-wide text-ink-soft">
            {{ props.entry.session.folio }}
            <template v-if="props.branchName"> · {{ props.branchName }}</template>
          </p>
          <h3 class="mt-0.5 font-display text-lg font-semibold text-ink">
            Arqueo de sesión
          </h3>
          <p class="mt-1 text-xs leading-relaxed text-ink-soft">{{ period }}</p>
        </div>
        <StatusTag
          :tone="
            !props.entry.session.closedAt ? 'ok' : balanced ? 'neutral' : 'danger'
          "
          :label="
            !props.entry.session.closedAt ? 'Abierta' : balanced ? 'Cuadra' : 'Descuadre'
          "
        />
      </div>

      <dl class="mt-5 divide-y divide-rail text-sm">
        <div class="flex items-center justify-between gap-3 py-2.5">
          <dt class="text-ink-soft">Fondo inicial</dt>
          <dd class="tnum font-medium text-ink">
            {{ formatCurrency(props.entry.session.openingAmount, 2) }}
          </dd>
        </div>
        <div class="flex items-center justify-between gap-3 py-2.5">
          <dt class="text-ink-soft">Ventas del turno</dt>
          <dd class="tnum text-ink">{{ formatCurrency(props.entry.summary.salesTotal, 2) }}</dd>
        </div>
        <div class="flex items-center justify-between gap-3 py-2.5">
          <dt class="text-ink-soft">Gastos pagados</dt>
          <dd class="tnum text-ink">-{{ formatCurrency(props.entry.summary.expensesTotal, 2) }}</dd>
        </div>
        <div class="flex items-center justify-between gap-3 py-2.5">
          <dt class="text-ink-soft">Compras pagadas</dt>
          <dd class="tnum text-ink">-{{ formatCurrency(props.entry.summary.purchasesTotal, 2) }}</dd>
        </div>
        <div class="flex items-center justify-between gap-3 py-2.5">
          <dt class="text-ink-soft">Efectivo esperado</dt>
          <dd class="tnum font-medium text-ink">
            {{ formatCurrency(props.entry.summary.expectedCash, 2) }}
          </dd>
        </div>
        <div class="flex items-center justify-between gap-3 py-2.5">
          <dt class="text-ink-soft">Efectivo contado</dt>
          <dd class="tnum text-ink">
            {{ props.entry.session.countedCash === null
              ? 'Pendiente'
              : formatCurrency(props.entry.session.countedCash, 2) }}
          </dd>
        </div>
        <div class="flex items-center justify-between gap-3 py-2.5">
          <dt class="text-ink-soft">Descuadre</dt>
          <dd
            class="tnum font-semibold"
            :class="balanced ? 'text-ink' : 'text-brick'"
          >
            {{ props.entry.summary.difference === null
              ? '—'
              : `${props.entry.summary.difference >= 0 ? '+' : ''}${formatCurrency(props.entry.summary.difference, 2)}` }}
          </dd>
        </div>
      </dl>

      <p v-if="props.entry.session.note" class="mt-4 rounded-sm bg-paper px-3 py-2 text-xs text-ink-soft">
        {{ props.entry.session.note }}
      </p>

      <div class="mt-5">
        <p class="mb-2 text-[11px] font-medium tracking-wide text-ink-soft">
          Cobros del turno ({{ props.entry.summary.sales.length }})
        </p>
        <ul v-if="props.entry.summary.sales.length" class="divide-y divide-rail border-y border-rail">
          <li
            v-for="sale in props.entry.summary.sales"
            :key="sale.id"
            class="flex items-center justify-between gap-3 py-2 text-xs"
          >
            <span class="min-w-0">
              <span class="block font-medium text-ink">{{ sale.folio }}</span>
              <span class="block text-[11px] text-ink-soft">
                {{ formatMovementDate(sale.createdAt) }} · {{ methodLabel(sale.paymentMethod) }}
              </span>
            </span>
            <span class="tnum shrink-0 font-medium text-ink">
              {{ formatCurrency(sale.total, 2) }}
            </span>
          </li>
        </ul>
        <p v-else class="rounded-sm bg-paper px-3 py-2 text-xs text-ink-soft">
          No hubo cobros en este periodo.
        </p>
      </div>

      <div class="mt-5">
        <p class="mb-2 text-[11px] font-medium tracking-wide text-ink-soft">
          Gastos en efectivo ({{ props.entry.summary.cashExpenses.length }})
        </p>
        <ul
          v-if="props.entry.summary.cashExpenses.length"
          class="divide-y divide-rail border-y border-rail"
        >
          <li
            v-for="expense in props.entry.summary.cashExpenses"
            :key="expense.id"
            class="flex items-center justify-between gap-3 py-2 text-xs"
          >
            <span class="min-w-0">
              <span class="block truncate font-medium text-ink">{{ expense.concept }}</span>
              <span class="block text-[11px] text-ink-soft">
                {{ expense.folio }} · {{ formatMovementDate(expense.paidAt ?? expense.date) }}
              </span>
            </span>
            <span class="tnum shrink-0 font-medium text-brick">
              -{{ formatCurrency(expense.amount, 2) }}
            </span>
          </li>
        </ul>
        <p v-else class="rounded-sm bg-paper px-3 py-2 text-xs text-ink-soft">
          No hubo gastos pagados en efectivo en este periodo.
        </p>
      </div>

      <div class="mt-5">
        <p class="mb-2 text-[11px] font-medium tracking-wide text-ink-soft">
          Compras pagadas ({{ props.entry.summary.purchases.length }})
        </p>
        <ul
          v-if="props.entry.summary.purchases.length"
          class="divide-y divide-rail border-y border-rail"
        >
          <li
            v-for="purchase in props.entry.summary.purchases"
            :key="purchase.id"
            class="flex items-center justify-between gap-3 py-2 text-xs"
          >
            <span class="min-w-0">
              <span class="block truncate font-medium text-ink">
                {{ purchase.folio }} · {{ purchase.supplierName }}
              </span>
              <span class="block text-[11px] text-ink-soft">
                {{ formatMovementDate(purchase.paidAt ?? purchase.createdAt) }} ·
                {{ methodLabel(purchase.paymentMethod) }}
              </span>
            </span>
            <span class="tnum shrink-0 font-medium text-brick">
              -{{ formatCurrency(orderedTotal(purchase), 2) }}
            </span>
          </li>
        </ul>
        <p v-else class="rounded-sm bg-paper px-3 py-2 text-xs text-ink-soft">
          No hubo compras pagadas en este periodo.
        </p>
      </div>

      <div class="mt-5">
        <CashAdjustments :adjustments="props.entry.summary.adjustments" />
      </div>
    </template>
  </div>
</template>
