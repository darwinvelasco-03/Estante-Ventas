<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import ProductEditor from '@/components/products/ProductEditor.vue'
import ProductFilters from '@/components/products/ProductFilters.vue'
import ProductLedger from '@/components/products/ProductLedger.vue'
import { useProductFilters } from '@/composables/useProductFilters'
import { isAllBranches } from '@/stores/branch'
import { addProduct, catalogProducts, removeProduct, updateProduct } from '@/stores/catalog'
import type { Product, ProductInput } from '@/types/pos'

const props = defineProps<{ branch: string }>()

const { query, category, onlyRestock, categories, filtered, restockCount, reset } =
  useProductFilters(catalogProducts)

const params = new URLSearchParams(window.location.search)
const error = ref(
  params.get('productos') === 'error' ? 'Revisa tu conexión e inténtalo de nuevo.' : null,
)
const loading = ref(params.get('productos') === 'cargando')

const selectedId = ref<string | null>(catalogProducts.value[0]?.id ?? null)
const previousId = ref<string | null>(null)
const mode = ref<'edit' | 'create'>('edit')
const formKey = ref(0)
const notice = ref<string | null>(null)
const confirmRemove = ref(false)
let timer: number | undefined

onMounted(() => {
  if (loading.value) timer = window.setTimeout(() => (loading.value = false), 1200)
})
onUnmounted(() => window.clearTimeout(timer))

const selected = computed(
  () => catalogProducts.value.find((product) => product.id === selectedId.value) ?? null,
)
const hasFilters = computed(
  () => !!query.value.trim() || category.value !== 'Todas' || onlyRestock.value,
)

function select(product: Product) {
  selectedId.value = product.id
  mode.value = 'edit'
}

function newProduct() {
  if (isAllBranches.value) return
  previousId.value = selectedId.value
  selectedId.value = null
  mode.value = 'create'
  notice.value = null
}

function save(input: ProductInput) {
  if (isAllBranches.value) return
  if (mode.value === 'create') {
    const created = addProduct(input)
    if (!created) return
    selectedId.value = created.id
    mode.value = 'edit'
    notice.value = `${created.name} agregado al catálogo`
    return
  }
  if (!selectedId.value) return
  updateProduct(selectedId.value, input)
  notice.value = 'Cambios guardados'
}

function cancelEdit() {
  if (mode.value === 'create') {
    mode.value = 'edit'
    selectedId.value = previousId.value ?? catalogProducts.value[0]?.id ?? null
  }
  formKey.value += 1
  notice.value = null
}

function removeConfirmed() {
  if (isAllBranches.value || !selectedId.value) return
  const name = selected.value?.name ?? 'Producto'
  removeProduct(selectedId.value)
  selectedId.value = catalogProducts.value[0]?.id ?? null
  mode.value = 'edit'
  confirmRemove.value = false
  notice.value = `${name} quitado del catálogo`
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="font-display text-xl font-semibold tracking-tight text-ink">Productos</h2>
        <p class="mt-0.5 text-sm text-ink-soft">Catálogo del mostrador · {{ props.branch }}</p>
      </div>
      <button
        v-if="!isAllBranches"
        type="button"
        class="inline-flex items-center gap-2 rounded-sm bg-ink px-3 py-2 font-display text-sm font-semibold text-surface transition-colors hover:bg-ink-soft"
        @click="newProduct"
      >
        <AppIcon name="plus" :size="15" />
        Nuevo producto
      </button>
    </div>

    <p v-if="isAllBranches" class="text-xs text-ink-soft">
      Vista agregada de solo lectura. Selecciona Centro o Norte para modificar el catálogo.
    </p>

    <p v-if="notice" class="flex items-center gap-1.5 text-xs text-ok" aria-live="polite">
      <AppIcon name="check" :size="14" />
      {{ notice }}
    </p>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,8fr)_minmax(260px,4fr)]">
      <section aria-label="Catálogo" class="min-w-0 rounded-sm border border-rail bg-surface">
        <div class="p-4 pb-3">
          <ProductFilters
            :query="query"
            :category="category"
            :categories="categories"
            :only-restock="onlyRestock"
            :restock-count="restockCount"
            @update:query="query = $event"
            @update:category="category = $event"
            @update:only-restock="onlyRestock = $event"
          />
        </div>

        <ProductLedger
          :products="filtered"
          :selected-id="selectedId"
          :loading="loading"
          :error="error"
          :has-filters="hasFilters"
          @select="select"
          @retry="error = null"
          @clear-filters="reset"
        />

        <div
          class="flex items-center justify-between gap-3 border-t border-rail px-4 py-2.5 text-xs text-ink-soft"
        >
          <span class="tnum">{{ filtered.length }} de {{ catalogProducts.length }} productos</span>
          <span>{{ restockCount }} por reponer</span>
        </div>
      </section>

      <section aria-label="Ficha del producto" class="rounded-sm border border-rail bg-surface p-4">
        <ProductEditor
          v-if="mode === 'create' || selected"
          :key="`${mode}-${selectedId ?? 'new'}-${formKey}`"
          :product="selected"
          :categories="categories"
          :mode="mode"
          :readonly="isAllBranches"
          @save="save"
          @cancel="cancelEdit"
          @remove="confirmRemove = true"
        />
        <StatePanel
          v-else
          icon="search"
          title="Selecciona un producto"
          message="Elige una fila del catálogo para ver y corregir su ficha."
        />
      </section>
    </div>

    <ConfirmDialog
      v-if="confirmRemove && !isAllBranches"
      :title="`Quitar ${selected?.name ?? 'producto'}`"
      message="Desaparecerá del catálogo y del punto de venta. Esta acción no se puede deshacer."
      confirm-label="Quitar del catálogo"
      cancel-label="Seguir editando"
      tone="danger"
      @confirm="removeConfirmed"
      @cancel="confirmRemove = false"
    />
  </div>
</template>
