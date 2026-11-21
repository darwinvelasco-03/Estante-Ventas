<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import type { CashSession, CashSummary } from '@/types/cash'
import { formatCurrency, formatMovementDate, formatVisitParts } from '@/utils/format'

const props = defineProps<{ session: CashSession; summary: CashSummary }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <section aria-label="Sesión de caja abierta" class="rounded-sm border border-rail bg-surface">
    <div class="flex flex-wrap items-start justify-between gap-3 border-b border-rail px-4 py-3.5">
      <div class="min-w-0">
        <p class="font-data text-[11px] tracking-wide text-ink-soft">{{ props.session.folio }}</p>
        <h3 class="mt-0.5 font-display text-lg font-semibold text-ink">Sesión en curso</h3>
        <p class="mt-0.5 text-xs text-ink-soft">
          Abierta el {{ formatVisitParts(props.session.openedAt).full }} ·
          {{ formatMovementDate(props.session.openedAt) }}
        </p>
      </div>
      <StatusTag tone="ok" label="Caja abierta" />
    </div>

    <div class="grid grid-cols-2 gap-px bg-rail sm:grid-cols-3 xl:grid-cols-6">
      <div class="bg-surface px-4 py-3.5">
        <p class="text-[11px] text-ink-soft">Fondo inicial</p>
        <p class="tnum mt-1 text-sm font-semibold text-ink">
          {{ formatCurrency(props.session.openingAmount, 2) }}
        </p>
      </div>
      <div class="bg-surface px-4 py-3.5">
        <p class="text-[11px] text-ink-soft">Ventas en efectivo</p>
        <p class="tnum mt-1 text-sm font-semibold text-ink">
          {{ formatCurrency(props.summary.cashSales, 2) }}
        </p>
        <p class="tnum mt-0.5 text-[11px] text-ink-soft">
          {{ props.summary.sales.filter((sale) => sale.paymentMethod === 'efectivo').length }}
          {{ props.summary.sales.filter((sale) => sale.paymentMethod === 'efectivo').length === 1 ? 'cobro' : 'cobros' }}
        </p>
      </div>
      <div class="bg-surface px-4 py-3.5">
        <p class="text-[11px] text-ink-soft">Ventas con tarjeta</p>
        <p class="tnum mt-1 text-sm font-semibold text-ink">
          {{ formatCurrency(props.summary.cardSales, 2) }}
        </p>
      </div>
      <div class="bg-surface px-4 py-3.5">
        <p class="text-[11px] text-ink-soft">Gastos en efectivo</p>
        <p class="tnum mt-1 text-sm font-semibold text-brick">
          -{{ formatCurrency(props.summary.cashExpenseTotal, 2) }}
        </p>
      </div>
      <div class="bg-surface px-4 py-3.5">
        <p class="text-[11px] text-ink-soft">Compras en efectivo</p>
        <p class="tnum mt-1 text-sm font-semibold text-brick">
          -{{ formatCurrency(props.summary.cashPurchaseTotal, 2) }}
        </p>
        <p class="tnum mt-0.5 text-[11px] text-ink-soft">
          {{ props.summary.cashPurchases.length }}
          {{ props.summary.cashPurchases.length === 1 ? 'orden pagada' : 'órdenes pagadas' }}
        </p>
      </div>
      <div class="bg-mustard-soft px-4 py-3.5">
        <p class="text-[11px] text-mustard">Efectivo esperado</p>
        <p class="tnum mt-1 font-display text-lg font-semibold text-ink">
          {{ formatCurrency(props.summary.expectedCash, 2) }}
        </p>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <p class="flex items-start gap-1.5 text-xs text-ink-soft">
        <AppIcon name="clock" :size="14" class="mt-px shrink-0" />
        Los cobros, gastos y compras pagadas se asocian automáticamente según su hora.
      </p>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 font-display text-sm font-semibold text-surface hover:bg-ink-soft"
        @click="emit('close')"
      >
        <AppIcon name="check" :size="15" />
        Cerrar y arquear
      </button>
    </div>
  </section>
</template>
