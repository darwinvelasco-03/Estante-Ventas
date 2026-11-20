<script setup lang="ts">
import { computed } from 'vue'

import AlertList from '@/components/dashboard/AlertList.vue'
import MetricBand, { type BandMetric } from '@/components/dashboard/MetricBand.vue'
import PulsePanel from '@/components/dashboard/PulsePanel.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'
import RecentMovements from '@/components/dashboard/RecentMovements.vue'
import TrendChart from '@/components/dashboard/TrendChart.vue'
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import { useDashboard } from '@/composables/useDashboard'
import { isAllBranches } from '@/stores/branch'
import { currentUser } from '@/stores/users'
import { formatCurrency, formatNumber, formatPercent } from '@/utils/format'

defineProps<{ branch: string }>()

const { data, loading, error, reload } = useDashboard()

/** El saludo usa el nombre de la sesión, no un nombre fijo de ejemplo. */
const heading = computed(() => {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buen día' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'
  const name = currentUser.value?.name.trim().split(/\s+/)[0] ?? 'Equipo'
  return `${greeting}, ${name}`
})

const metrics = computed<BandMetric[]>(() => [
  {
    label: 'Cobros registrados',
    value: data.value ? formatNumber(data.value.transactions) : '—',
    hint: 'Hoy, todas las cajas',
  },
  {
    label: 'Ticket promedio',
    value: data.value ? formatCurrency(data.value.averageTicket) : '—',
    hint: 'Por venta',
  },
  {
    label: 'Efectivo en caja',
    value: data.value ? formatCurrency(data.value.cashOnHand) : '—',
    hint: 'Caja 01 · turno mañana',
  },
  {
    label: 'Stock sano',
    value: data.value ? formatPercent(data.value.stockHealth) : '—',
    hint: 'Productos sobre su mínimo',
    tone: data.value && data.value.stockHealth < 70 ? 'warn' : 'default',
  },
])
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="font-display text-xl font-semibold tracking-tight text-ink">{{ heading }}</h2>
        <p class="mt-0.5 text-sm text-ink-soft">{{ data?.dateLabel ?? 'Hoy' }} · {{ branch }}</p>
      </div>
      <div class="text-right">
        <p class="text-xs text-ink-soft">Resumen del día en tiempo real</p>
        <p v-if="isAllBranches" class="text-[11px] text-mustard">Agregado · solo lectura</p>
        <a
          href="#/mi-sucursal"
          class="mt-1 inline-block text-[11px] text-ink-soft underline decoration-rail underline-offset-2 hover:text-ink"
        >
          Ver mi sucursal
        </a>
      </div>
    </div>

    <PulsePanel
      v-if="data"
      :sales-today="data.salesToday"
      :sales-goal="data.salesGoal"
      :sales-delta="data.salesDelta"
      :loading="loading"
    />
    <SkeletonBlock v-else-if="loading" class="h-40 w-full" />
    <StatePanel
      v-else
      icon="alert"
      tone="danger"
      title="No pudimos cargar el resumen"
      :message="error ?? 'Inténtalo de nuevo en unos segundos.'"
    >
      <button
        type="button"
        class="rounded-sm bg-ink px-3 py-1.5 text-xs font-medium text-surface hover:bg-ink-soft"
        @click="reload"
      >
        Reintentar
      </button>
    </StatePanel>

    <template v-if="data">
      <MetricBand :metrics="metrics" :loading="loading" />

      <div class="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <div class="min-w-0 space-y-6">
          <div class="rounded-sm border border-rail bg-surface px-5 py-5">
            <TrendChart :values="data.trend" :loading="loading" />
          </div>
          <RecentMovements
            :movements="data.movements"
            :loading="loading"
            :error="error"
            @retry="reload"
          />
        </div>

        <aside class="min-w-0 space-y-6" aria-label="Atención del día">
          <div class="rounded-sm border border-rail bg-surface px-5 py-5">
            <AlertList :items="data.lowStock" :loading="loading" />
          </div>
          <div class="rounded-sm border border-rail bg-surface px-5 py-5">
            <QuickActions :branch-label="branch" :read-only="isAllBranches" />
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>
