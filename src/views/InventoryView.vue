<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import MovementForm from '@/components/inventory/MovementForm.vue'
import MovementLedger from '@/components/inventory/MovementLedger.vue'
import { useMovementFilters, type MovementFilter } from '@/composables/useMovementFilters'
import { isAllBranches } from '@/stores/branch'
import { catalogProducts } from '@/stores/catalog'
import { movements, registerMovement } from '@/stores/inventory'
import StatePanel from '@/components/ui/StatePanel.vue'
import type { MovementError, MovementInput } from '@/types/inventory'

const props = defineProps<{ branch: string }>()

const { query, type, productId, filtered, counts, hasFilters, reset } = useMovementFilters(movements)

const params = new URLSearchParams(window.location.search)
const error = ref(params.get('inventario') === 'error' ? 'Revisa tu conexión e inténtalo de nuevo.' : null)
const loading = ref(params.get('inventario') === 'cargando')
const formError = ref<string | null>(null)
const formKey = ref(0)
const notice = ref<string | null>(null)
let timer: number | undefined

onMounted(() => {
  if (loading.value) timer = window.setTimeout(() => (loading.value = false), 1200)
})
onUnmounted(() => window.clearTimeout(timer))

const tabs: { id: MovementFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'entrada', label: 'Entradas' },
  { id: 'salida', label: 'Salidas' },
  { id: 'conteo', label: 'Conteos' },
]

const filteredProduct = computed(
  () => catalogProducts.value.find((product) => product.id === productId.value) ?? null,
)

const errorMessages: Record<MovementError, string> = {
  producto: 'Selecciona un producto del catálogo.',
  cantidad: 'Escribe una cantidad válida.',
  'sin-stock': 'No hay existencias suficientes para esa salida.',
  'sin-cambio': 'La cantidad contada es igual a la registrada.',
}

function onSave(input: MovementInput) {
  if (isAllBranches.value) return
  const result = registerMovement(input)
  if (result.error) {
    formError.value = errorMessages[result.error]
    notice.value = null
    return
  }
  formError.value = null
  formKey.value += 1
  notice.value = `Movimiento registrado · saldo ${result.movement?.balance ?? 0}`
}

function onSelectProduct(id: string | null) {
  productId.value = id
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="font-display text-xl font-semibold tracking-tight text-ink">Inventario</h2>
        <p class="mt-0.5 text-sm text-ink-soft">Bitácora · {{ props.branch }}</p>
      </div>
      <a
        v-if="!isAllBranches"
        href="#movement-form"
        class="rounded-sm bg-ink px-3 py-2 font-display text-sm font-semibold text-surface md:hidden"
      >
        Registrar movimiento
      </a>
    </div>

    <p v-if="notice" class="flex items-center gap-1.5 text-xs text-ok" aria-live="polite">
      <AppIcon name="check" :size="14" />
      {{ notice }}
    </p>

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
              id="movement-search"
              :value="query"
              type="search"
              autocomplete="off"
              placeholder="Buscar producto, motivo o nota"
              class="w-full rounded-sm border border-rail bg-surface py-2 pr-3 pl-9 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              @input="query = ($event.target as HTMLInputElement).value"
            />
          </div>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div class="flex flex-wrap gap-x-3 gap-y-1">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                class="text-xs transition-colors"
                :class="
                  type === tab.id
                    ? 'font-semibold text-ink underline decoration-2 underline-offset-4'
                    : 'text-ink-soft hover:text-ink'
                "
                :aria-pressed="type === tab.id"
                @click="type = tab.id"
              >
                {{ tab.label }} <span class="tnum">{{ counts[tab.id] }}</span>
              </button>
            </div>

            <button
              v-if="filteredProduct"
              type="button"
              class="ml-auto inline-flex items-center gap-1.5 rounded-sm border border-ink bg-paper px-2 py-1 text-xs text-ink"
              :aria-label="`Quitar el filtro de ${filteredProduct.name}`"
              @click="productId = null"
            >
              {{ filteredProduct.name }}
              <AppIcon name="close" :size="12" />
            </button>
          </div>
        </div>

        <MovementLedger
          :movements="filtered"
          :loading="loading"
          :error="error"
          :has-filters="hasFilters"
          @retry="error = null"
          @clear-filters="reset"
        />

        <div
          class="flex flex-wrap items-center justify-between gap-2 border-t border-rail px-4 py-2.5 text-xs text-ink-soft"
        >
          <span class="tnum">{{ filtered.length }} de {{ movements.length }} movimientos</span>
          <span v-if="filteredProduct">
            Saldo de {{ filteredProduct.name }} ·
            <strong class="tnum font-semibold text-ink">{{ filteredProduct.stock }}</strong>
          </span>
        </div>
      </section>

      <section v-if="!isAllBranches" aria-label="Registrar movimiento" class="rounded-sm border border-rail bg-surface p-4">
        <MovementForm
          :key="formKey"
          :catalog="catalogProducts"
          :initial-product-id="productId"
          :error="formError"
          @save="onSave"
          @select-product="onSelectProduct"
          @clear-error="formError = null"
        />
      </section>
      <StatePanel
        v-else
        icon="branches"
        title="Solo lectura"
        message="La bitácora agregada muestra movimientos de ambas sucursales. Selecciona una sucursal para registrar ajustes."
      />
    </div>
  </div>
</template>
