<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import LedgerTable from '@/components/movements/LedgerTable.vue'
import ReversalSheet from '@/components/movements/ReversalSheet.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import { isAllBranches, writableBranch } from '@/stores/branch'
import { ledger, revertLedgerEntry } from '@/stores/ledger'
import type { LedgerEntry, LedgerKind } from '@/types/reversal'
import { formatCurrency, formatMovementDate, formatVisitParts } from '@/utils/format'

const props = defineProps<{ branch: string }>()

const params = new URLSearchParams(window.location.search)
const error = ref(params.get('movimientos') === 'error' ? 'Revisa tu conexión e inténtalo de nuevo.' : null)
const loading = ref(params.get('movimientos') === 'cargando')

const query = ref('')
const status = ref<'todos' | 'activos' | 'anulados'>('todos')
const kind = ref<'todos' | LedgerKind>('todos')
const selectedId = ref<string | null>(null)
const notice = ref<{ text: string; tone: 'ok' | 'error' } | null>(null)

const sheetOpen = ref(false)
const sheetTarget = ref<LedgerEntry | null>(null)

const statusTabs = [
  { id: 'todos', label: 'Todos' },
  { id: 'activos', label: 'Activos' },
  { id: 'anulados', label: 'Anulados' },
] as const

const kindTabs: { id: 'todos' | LedgerKind; label: string }[] = [
  { id: 'todos', label: 'Todos los tipos' },
  { id: 'venta', label: 'Ventas' },
  { id: 'inventario', label: 'Inventario' },
  { id: 'compra', label: 'Compras' },
  { id: 'gasto', label: 'Gastos' },
]

const kindLabels: Record<LedgerKind, string> = {
  venta: 'Venta',
  inventario: 'Movimiento de inventario',
  compra: 'Compra pagada',
  gasto: 'Gasto pagado',
}

const canRevert = computed(() => !isAllBranches.value && writableBranch() !== null)

const statusCounts = computed(() => ({
  todos: ledger.value.length,
  activos: ledger.value.filter((entry) => !entry.reversal).length,
  anulados: ledger.value.filter((entry) => !!entry.reversal).length,
}))

const normalizedQuery = computed(() => query.value.trim().toLocaleLowerCase('es'))
const filtered = computed(() =>
  ledger.value.filter((entry) => {
    if (status.value === 'activos' && entry.reversal) return false
    if (status.value === 'anulados' && !entry.reversal) return false
    if (kind.value !== 'todos' && entry.kind !== kind.value) return false
    if (!normalizedQuery.value) return true
    return `${entry.folio} ${entry.title} ${entry.detail} ${entry.paymentMethod ?? ''}`
      .toLocaleLowerCase('es')
      .includes(normalizedQuery.value)
  }),
)

const hasFilters = computed(
  () => !!normalizedQuery.value || status.value !== 'todos' || kind.value !== 'todos',
)

const selected = computed(
  () => filtered.value.find((entry) => entry.id === selectedId.value) ?? null,
)

watch(
  filtered,
  (entries) => {
    if (!entries.some((entry) => entry.id === selectedId.value)) {
      selectedId.value = entries[0]?.id ?? null
    }
  },
  { immediate: true },
)

const activeSalesTotal = computed(() =>
  ledger.value
    .filter((entry) => entry.kind === 'venta' && !entry.reversal)
    .reduce((sum, entry) => sum + (entry.amount ?? 0), 0),
)

function resetFilters() {
  query.value = ''
  status.value = 'todos'
  kind.value = 'todos'
}

function openRevert(entry: LedgerEntry) {
  if (!canRevert.value || entry.reversal) return
  notice.value = null
  sheetTarget.value = entry
  sheetOpen.value = true
}

function onConfirm(reason: string) {
  if (!sheetTarget.value) return
  const result = revertLedgerEntry(sheetTarget.value, reason)
  notice.value = { text: result.message, tone: result.ok ? 'ok' : 'error' }
  if (result.ok) {
    sheetOpen.value = false
    sheetTarget.value = null
  }
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="font-display text-xl font-semibold tracking-tight text-ink">Movimientos</h2>
        <p class="mt-0.5 text-sm text-ink-soft">Bitácora y anulaciones · {{ props.branch }}</p>
      </div>
      <button
        v-if="!canRevert"
        type="button"
        disabled
        class="rounded-sm border border-rail bg-paper px-3 py-2 font-display text-sm font-semibold text-ink-soft"
      >
        Solo lectura
      </button>
    </div>

    <p v-if="notice" class="flex items-center gap-1.5 text-xs" :class="notice.tone === 'ok' ? 'text-ok' : 'text-brick'" aria-live="polite">
      <AppIcon :name="notice.tone === 'ok' ? 'check' : 'alert'" :size="14" />
      {{ notice.text }}
    </p>

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-sm border border-rail bg-surface px-4 py-3">
        <p class="text-[11px] tracking-wide text-ink-soft">Registros activos</p>
        <p class="tnum mt-1 font-display text-lg font-semibold text-ink">{{ statusCounts.activos }}</p>
      </div>
      <div class="rounded-sm border border-rail bg-surface px-4 py-3">
        <p class="text-[11px] tracking-wide text-ink-soft">Anulados</p>
        <p class="tnum mt-1 font-display text-lg font-semibold text-brick">{{ statusCounts.anulados }}</p>
      </div>
      <div class="rounded-sm border border-rail bg-surface px-4 py-3">
        <p class="text-[11px] tracking-wide text-ink-soft">Ventas activas</p>
        <p class="tnum mt-1 font-display text-lg font-semibold text-ink">
          {{ formatCurrency(activeSalesTotal) }}
        </p>
      </div>
    </div>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(280px,5fr)]">
      <section aria-label="Bitácora de movimientos" class="min-w-0 rounded-sm border border-rail bg-surface">
        <div class="space-y-3 p-4 pb-3">
          <div class="relative">
            <AppIcon
              name="search"
              :size="16"
              class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft"
            />
            <input
              id="movements-search"
              :value="query"
              type="search"
              autocomplete="off"
              placeholder="Buscar folio, documento o detalle"
              class="w-full rounded-sm border border-rail bg-surface py-2 pr-3 pl-9 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              @input="query = ($event.target as HTMLInputElement).value"
            />
          </div>

          <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div class="flex flex-wrap gap-x-3 gap-y-1">
              <button
                v-for="tab in statusTabs"
                :key="tab.id"
                type="button"
                class="text-xs transition-colors"
                :class="
                  status === tab.id
                    ? 'font-semibold text-ink underline decoration-2 underline-offset-4'
                    : 'text-ink-soft hover:text-ink'
                "
                :aria-pressed="status === tab.id"
                @click="status = tab.id"
              >
                {{ tab.label }} <span class="tnum">{{ statusCounts[tab.id] }}</span>
              </button>
            </div>

            <label class="flex items-center gap-2 text-xs text-ink-soft" for="movements-kind">
              Tipo
              <select
                id="movements-kind"
                v-model="kind"
                class="rounded-sm border border-rail bg-surface px-2 py-1.5 text-xs text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              >
                <option v-for="tab in kindTabs" :key="tab.id" :value="tab.id">
                  {{ tab.label }}
                </option>
              </select>
            </label>
          </div>
        </div>

        <LedgerTable
          :entries="filtered"
          :loading="loading"
          :error="error"
          :has-filters="hasFilters"
          :can-revert="canRevert"
          :selected-id="selectedId"
          @retry="error = null"
          @clear-filters="resetFilters"
          @select="selectedId = $event"
          @revert="openRevert"
        />

        <div class="flex flex-wrap items-center justify-between gap-2 border-t border-rail px-4 py-2.5 text-xs text-ink-soft">
          <span class="tnum">{{ filtered.length }} de {{ ledger.length }} movimientos</span>
          <button v-if="hasFilters" type="button" class="text-ink underline" @click="resetFilters">
            Quitar filtros
          </button>
        </div>
      </section>

      <aside aria-label="Detalle del movimiento" class="min-w-0 space-y-4">
        <StatePanel
          v-if="!canRevert"
          icon="branches"
          title="Solo lectura"
          message="La bitácora agregada reúne ambas sucursales. Selecciona una sucursal concreta para anular movimientos."
        />

        <StatePanel
          v-else-if="!selected"
          icon="history"
          title="Selecciona un movimiento"
          message="Elige un registro de la bitácora para ver su detalle o anularlo."
        />

        <template v-else>
          <div class="rounded-sm border border-rail bg-surface p-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-data text-[11px] tracking-wide text-ink-soft">
                  {{ selected.folio }}
                </p>
                <h3 class="mt-0.5 font-display text-lg font-semibold text-ink">
                  {{ selected.title }}
                </h3>
              </div>
              <StatusTag
                :label="selected.reversal ? 'Anulado' : 'Activo'"
                :tone="selected.reversal ? 'danger' : 'ok'"
              />
            </div>

            <dl class="mt-4 divide-y divide-rail text-sm">
              <div class="flex items-center justify-between gap-3 py-2.5">
                <dt class="text-ink-soft">Tipo</dt>
                <dd class="text-right text-ink">{{ kindLabels[selected.kind] }}</dd>
              </div>
              <div class="flex items-center justify-between gap-3 py-2.5">
                <dt class="text-ink-soft">Fecha</dt>
                <dd class="text-right text-ink">
                  {{ formatVisitParts(selected.date).full }}
                </dd>
              </div>
              <div class="flex items-center justify-between gap-3 py-2.5">
                <dt class="text-ink-soft">Detalle</dt>
                <dd class="max-w-[60%] text-right text-ink">{{ selected.detail }}</dd>
              </div>
              <div v-if="selected.amount !== null" class="flex items-center justify-between gap-3 py-2.5">
                <dt class="text-ink-soft">Importe</dt>
                <dd class="tnum font-medium text-ink">
                  {{ formatCurrency(selected.amount, 2, selected.currency) }}
                </dd>
              </div>
              <div v-if="selected.paymentMethod" class="flex items-center justify-between gap-3 py-2.5">
                <dt class="text-ink-soft">Forma de pago</dt>
                <dd class="text-right text-ink">{{ selected.paymentMethod }}</dd>
              </div>
            </dl>

            <div
              v-if="selected.reversal"
              class="mt-4 rounded-sm border border-brick/30 bg-brick-soft px-3 py-2.5"
            >
              <p class="text-xs font-semibold text-brick">
                Anulado el {{ formatVisitParts(selected.reversal.reversedAt).full }}
              </p>
              <p class="mt-1 text-xs leading-relaxed text-brick">
                {{ selected.reversal.reason }} · {{ selected.reversal.by }}
              </p>
            </div>

            <button
              v-if="!selected.reversal"
              type="button"
              class="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-sm border border-brick/40 px-3 py-2 text-sm text-brick hover:border-brick"
              @click="openRevert(selected)"
            >
              <AppIcon name="close" :size="15" />
              Anular movimiento
            </button>
          </div>

          <div class="rounded-sm border border-rail bg-paper px-4 py-3">
            <p class="font-display text-sm font-semibold text-ink">Cómo funciona la anulación</p>
            <p class="mt-1.5 text-xs leading-relaxed text-ink-soft">
              Nada se borra. El documento conserva su fecha y su historial; un ajuste negativo
              descuenta el importe en Caja y Reportes el día de la anulación, y el inventario recibe
              un contra-movimiento cuando corresponde.
            </p>
          </div>
        </template>
      </aside>
    </div>

    <ReversalSheet
      :open="sheetOpen"
      :entry="sheetTarget"
      @close="sheetOpen = false"
      @confirm="onConfirm"
    />
  </div>
</template>
