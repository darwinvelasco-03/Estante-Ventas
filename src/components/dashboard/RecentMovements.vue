<script setup lang="ts">
import { computed, ref } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import CurrencyText from '@/components/ui/CurrencyText.vue'
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import type { IconName } from '@/types/icons'
import type { Movement, MovementKind } from '@/types/dashboard'

const props = withDefaults(
  defineProps<{ movements: Movement[]; loading?: boolean; error?: string | null }>(),
  { loading: false, error: null },
)
const emit = defineEmits<{ retry: [] }>()

const filters = [
  { id: 'todos', label: 'Todos' },
  { id: 'venta', label: 'Ventas' },
  { id: 'compra', label: 'Compras' },
  { id: 'gasto', label: 'Gastos' },
  { id: 'caja', label: 'Caja' },
] as const
type Filter = (typeof filters)[number]['id']

const activeFilter = ref<Filter>('todos')
const query = ref('')
const page = ref(1)
const pageSize = 3

const filtered = computed(() => {
  const term = query.value.trim().toLowerCase()
  return props.movements.filter((movement) => {
    const matchesFilter = activeFilter.value === 'todos' || movement.kind === activeFilter.value
    const matchesQuery =
      !term ||
      `${movement.title} ${movement.folio} ${movement.detail}`.toLowerCase().includes(term)
    return matchesFilter && matchesQuery
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const pageItems = computed(() =>
  filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize),
)
const firstItem = computed(() => (filtered.value.length ? (page.value - 1) * pageSize + 1 : 0))
const lastItem = computed(() => Math.min(page.value * pageSize, filtered.value.length))

function setFilter(filter: Filter) {
  activeFilter.value = filter
  page.value = 1
}

function clearFilters() {
  activeFilter.value = 'todos'
  query.value = ''
  page.value = 1
}

const kindIcon: Record<MovementKind, IconName> = {
  venta: 'pos',
  compra: 'purchases',
  gasto: 'expenses',
  caja: 'cash',
}
</script>

<template>
  <section aria-label="Últimos movimientos">
    <div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 class="font-display text-base font-semibold text-ink">Últimos movimientos</h2>
        <p class="text-xs text-ink-soft">Ventas, compras y caja del día</p>
      </div>
      <div class="relative w-full sm:w-56">
        <AppIcon name="search" :size="15" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft" />
        <input
          v-model="query"
          type="search"
          aria-label="Buscar movimiento"
          placeholder="Buscar folio o concepto"
          class="w-full rounded-sm border border-rail bg-surface py-1.5 pr-3 pl-8 text-xs text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
          @input="page = 1"
        />
      </div>
    </div>

    <div class="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Filtrar movimientos">
      <button
        v-for="filter in filters"
        :key="filter.id"
        type="button"
        :aria-pressed="activeFilter === filter.id"
        class="rounded-sm border px-2.5 py-1 text-xs transition-colors duration-150"
        :class="
          activeFilter === filter.id
            ? 'border-ink bg-ink text-surface'
            : 'border-rail bg-surface text-ink-soft hover:border-ink hover:text-ink'
        "
        @click="setFilter(filter.id)"
      >
        {{ filter.label }}
      </button>
    </div>

    <div v-if="loading" class="space-y-2 rounded-sm border border-rail bg-surface p-4">
      <SkeletonBlock v-for="row in 3" :key="row" class="h-8 w-full" />
    </div>

    <StatePanel
      v-else-if="error"
      icon="alert"
      tone="danger"
      title="No pudimos cargar los movimientos"
      :message="error"
    >
      <button
        type="button"
        class="rounded-sm border border-ink px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink hover:text-surface"
        @click="emit('retry')"
      >
        Reintentar
      </button>
    </StatePanel>

    <template v-else>
      <div v-if="pageItems.length" class="overflow-x-auto rounded-sm border border-rail bg-surface">
        <table class="w-full min-w-[620px] border-collapse text-sm">
          <thead>
            <tr class="border-b border-rail bg-paper text-left">
              <th scope="col" class="px-4 py-2.5 text-xs font-medium text-ink-soft">Concepto</th>
              <th scope="col" class="px-4 py-2.5 text-xs font-medium text-ink-soft">Folio</th>
              <th scope="col" class="px-4 py-2.5 text-right text-xs font-medium text-ink-soft">Monto</th>
              <th scope="col" class="px-4 py-2.5 text-xs font-medium text-ink-soft">Hora</th>
              <th scope="col" class="px-4 py-2.5 text-xs font-medium text-ink-soft">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-rail">
            <tr v-for="movement in pageItems" :key="movement.id" class="transition-colors duration-150 hover:bg-paper">
              <td class="px-4 py-3">
                <span class="flex items-center gap-3">
                  <span class="flex size-7 shrink-0 items-center justify-center rounded-sm bg-paper text-ink-soft">
                    <AppIcon :name="kindIcon[movement.kind]" :size="15" />
                  </span>
                  <span class="min-w-0">
                    <span class="block truncate font-medium text-ink">{{ movement.title }}</span>
                    <span class="block truncate text-[11px] text-ink-soft">{{ movement.detail }}</span>
                  </span>
                </span>
              </td>
              <td class="tnum px-4 py-3 text-ink-soft">{{ movement.folio }}</td>
              <td class="px-4 py-3 text-right font-medium text-ink">
                <CurrencyText :value="movement.amount" />
              </td>
              <td class="tnum px-4 py-3 text-ink-soft">{{ movement.time }}</td>
              <td class="px-4 py-3">
                <StatusTag
                  :tone="movement.pending ? 'warn' : 'ok'"
                  :label="movement.pending ? 'Pendiente' : 'Completado'"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <StatePanel
        v-else
        icon="search"
        title="Sin movimientos con estos filtros"
        message="Prueba con otro concepto o vuelve a ver todos los movimientos del día."
      >
        <button
          type="button"
          class="rounded-sm border border-ink px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink hover:text-surface"
          @click="clearFilters"
        >
          Limpiar filtros
        </button>
      </StatePanel>

      <div v-if="pageItems.length" class="mt-3 flex items-center justify-between gap-3 text-xs text-ink-soft">
        <span class="tnum">{{ firstItem }}–{{ lastItem }} de {{ filtered.length }}</span>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="rounded-sm border border-rail px-2.5 py-1 transition-colors duration-150 enabled:hover:border-ink enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="page === 1"
            @click="page--"
          >
            Anterior
          </button>
          <button
            type="button"
            class="rounded-sm border border-rail px-2.5 py-1 transition-colors duration-150 enabled:hover:border-ink enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="page === totalPages"
            @click="page++"
          >
            Siguiente
          </button>
        </div>
      </div>
    </template>
  </section>
</template>
