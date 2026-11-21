<script setup lang="ts">
import { computed, ref } from 'vue'

import BreakdownPanel from '@/components/reports/BreakdownPanel.vue'
import PeriodFilter from '@/components/reports/PeriodFilter.vue'
import ReportMetrics from '@/components/reports/ReportMetrics.vue'
import ReportTrend from '@/components/reports/ReportTrend.vue'
import TopProducts from '@/components/reports/TopProducts.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import { useReportData } from '@/composables/useReportData'
import { useReportPeriod } from '@/composables/useReportPeriod'
import { isAllBranches } from '@/stores/branch'
import { expenses } from '@/stores/expenses'
import { purchases } from '@/stores/purchases'
import { adjustments } from '@/stores/reversals'
import { sales } from '@/stores/sales'
import { dateInputValue } from '@/composables/useReportPeriod'
import { buildReportCsv, downloadCsv } from '@/utils/reportCsv'

const props = defineProps<{ branch: string }>()

const params = new URLSearchParams(window.location.search)
const forcedEmpty = params.get('reportes') === 'vacio'
const error = ref(params.get('reportes') === 'error' ? 'Revisa tu conexión e inténtalo de nuevo.' : null)

const { preset, from, to, range, label, setPreset } = useReportPeriod()
const visibleSales = computed(() => (forcedEmpty ? [] : sales.value))
const visibleExpenses = computed(() => (forcedEmpty ? [] : expenses.value))
const visiblePurchases = computed(() => (forcedEmpty ? [] : purchases.value))
const visibleAdjustments = computed(() => (forcedEmpty ? [] : adjustments.value))
const data = useReportData(
  visibleSales,
  visibleExpenses,
  visiblePurchases,
  range,
  visibleAdjustments,
)

const hasData = computed(
  () =>
    data.value.sales.length > 0 ||
    data.value.expenses.length > 0 ||
    data.value.purchases.length > 0 ||
    data.value.adjustments.length > 0,
)

function updatePreset(value: typeof preset.value) {
  setPreset(value)
}

function exportCsv() {
  if (!hasData.value) return
  const suffix = dateInputValue(new Date())
  downloadCsv(`estante-reporte-${suffix}.csv`, buildReportCsv(data.value))
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="font-display text-xl font-semibold tracking-tight text-ink">Reportes</h2>
        <p class="mt-0.5 text-sm text-ink-soft">
          Ventas, gastos, compras y utilidad · {{ props.branch }}
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-sm border border-rail bg-surface px-3 py-2 font-display text-sm font-semibold text-ink hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!hasData"
        @click="exportCsv"
      >
        <AppIcon name="save" :size="15" />
        Exportar CSV
      </button>
    </div>

    <p v-if="isAllBranches" class="text-xs text-ink-soft">
      Agregado de las dos sucursales. Cambia a una sucursal concreta para enfocar el análisis.
    </p>

    <p
      v-if="error"
      class="flex items-center gap-1.5 text-xs text-brick"
      role="alert"
    >
      <AppIcon name="alert" :size="14" />
      {{ error }}
    </p>

    <div class="rounded-sm border border-rail bg-surface px-4 py-3">
      <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <PeriodFilter
          :preset="preset"
          :from="from"
          :to="to"
          @update:preset="updatePreset"
          @update:from="from = $event"
          @update:to="to = $event"
        />
        <span class="text-[11px] text-ink-soft">{{ label }}</span>
      </div>
    </div>

    <template v-if="hasData">
      <ReportMetrics :data="data" />

      <div class="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(280px,4fr)]">
        <div class="min-w-0 space-y-5">
          <div class="rounded-sm border border-rail bg-surface px-5 py-5">
            <ReportTrend :days="data.days" />
            <div class="grid gap-5 pt-5 sm:grid-cols-2">
              <BreakdownPanel
                title="Gastos por categoría"
                :slices="data.categories"
                accent="mustard"
                empty-message="No hay gastos pagados en el periodo."
              />
              <BreakdownPanel
                title="Ventas por forma de pago"
                :slices="data.methods"
                empty-message="No hay cobros en el periodo."
              />
            </div>
          </div>
        </div>

        <aside class="min-w-0 space-y-5" aria-label="Detalle del reporte">
          <div class="rounded-sm border border-rail bg-surface px-5 py-5">
            <TopProducts :products="data.products" />
          </div>
          <div class="rounded-sm border border-rail bg-surface px-5 py-5">
            <BreakdownPanel
              title="Compras por proveedor"
              :slices="data.suppliers"
              accent="brick"
              empty-message="No hay compras pagadas en el periodo."
            />
          </div>
          <div class="rounded-sm border border-rail bg-paper px-5 py-4">
            <p class="font-display text-sm font-semibold text-ink">Cómo se calcula</p>
            <p class="mt-1.5 text-xs leading-relaxed text-ink-soft">
              Solo se contabilizan los gastos y las órdenes de compra marcados como pagados. La
              utilidad resta esos egresos de los cobros registrados, siempre en USD. Las anulaciones
              conservan el documento en su fecha original y descuentan el importe con un ajuste en
              la fecha en que se anularon; el CSV incluye ambos renglones.
            </p>
          </div>
        </aside>
      </div>
    </template>

    <div v-else class="rounded-sm border border-rail bg-surface">
      <StatePanel
        icon="reports"
        :title="error ? 'No pudimos cargar el reporte' : 'Sin datos en este periodo'"
        :message="
          error
            ? error
            : 'Prueba con un periodo más amplio o registra cobros, gastos y compras pagadas.'
        "
        :tone="error ? 'danger' : 'neutral'"
      />
    </div>
  </div>
</template>
