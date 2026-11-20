<script setup lang="ts">
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import type { Product } from '@/types/pos'
import { productGrid } from './grid'
import ProductRow from './ProductRow.vue'

const props = defineProps<{
  products: Product[]
  selectedId: string | null
  loading: boolean
  error: string | null
  hasFilters: boolean
}>()

const emit = defineEmits<{ select: [product: Product]; retry: []; clearFilters: [] }>()
</script>

<template>
  <div>
    <div v-if="props.loading" class="space-y-2 p-3" aria-hidden="true">
      <SkeletonBlock v-for="row in 6" :key="row" class="h-12 w-full" />
    </div>

    <StatePanel
      v-else-if="props.error"
      icon="alert"
      tone="danger"
      title="No pudimos cargar el catálogo"
      :message="props.error"
    >
      <button
        type="button"
        class="rounded-sm border border-rail px-3 py-1.5 text-xs font-medium text-ink hover:border-ink"
        @click="emit('retry')"
      >
        Reintentar
      </button>
    </StatePanel>

    <StatePanel
      v-else-if="props.products.length === 0"
      icon="search"
      :title="props.hasFilters ? 'No hay productos con ese filtro' : 'El catálogo está vacío'"
      :message="
        props.hasFilters
          ? 'Prueba con otro nombre, categoría o quita el filtro de reposición.'
          : 'Agrega el primer producto para empezar a llenar el estante.'
      "
    >
      <button
        v-if="props.hasFilters"
        type="button"
        class="rounded-sm border border-rail px-3 py-1.5 text-xs font-medium text-ink hover:border-ink"
        @click="emit('clearFilters')"
      >
        Quitar filtros
      </button>
    </StatePanel>

    <template v-else>
      <div :class="[productGrid, 'hidden border-y border-rail px-3 py-2 md:grid']">
        <span class="text-[11px] font-medium text-ink-soft">Producto</span>
        <span class="text-right text-[11px] font-medium text-ink-soft">Precio</span>
        <span class="text-[11px] font-medium text-ink-soft">SKU</span>
        <span class="text-[11px] font-medium text-ink-soft">Categoría</span>
        <span class="text-right text-[11px] font-medium text-ink-soft">Existencia</span>
      </div>
      <div class="divide-y divide-rail">
        <ProductRow
          v-for="product in props.products"
          :key="product.id"
          :product="product"
          :selected="product.id === props.selectedId"
          @select="emit('select', $event)"
        />
      </div>
    </template>
  </div>
</template>
