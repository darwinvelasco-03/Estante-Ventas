<script setup lang="ts">
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import type { Supplier } from '@/types/supplier'
import { supplierGrid } from './grid'
import SupplierRow from './SupplierRow.vue'

const props = defineProps<{
  suppliers: Supplier[]
  loading: boolean
  error: string | null
  hasFilters: boolean
  selectedId: string | null
  readonly?: boolean
}>()

const emit = defineEmits<{
  retry: []
  clearFilters: []
  select: [id: string]
  edit: [id: string]
}>()
</script>

<template>
  <div>
    <div v-if="props.loading" class="space-y-2 p-3" aria-hidden="true">
      <SkeletonBlock v-for="row in 6" :key="row" class="h-14 w-full" />
    </div>

    <StatePanel
      v-else-if="props.error"
      icon="alert"
      tone="danger"
      title="No pudimos cargar los proveedores"
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
      v-else-if="props.suppliers.length === 0"
      icon="providers"
      :title="props.hasFilters ? 'No hay proveedores con ese filtro' : 'Todavía no hay proveedores'"
      :message="
        props.hasFilters
          ? 'Prueba con otra razón social, línea o teléfono.'
          : 'Da de alta a tu primer proveedor para tener a la mano sus días de entrega.'
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
      <div :class="[supplierGrid, 'hidden border-y border-rail px-3 py-2 md:grid']">
        <span class="text-[11px] font-medium text-ink-soft">Entrega</span>
        <span class="text-[11px] font-medium text-ink-soft">Proveedor</span>
        <span class="text-[11px] font-medium text-ink-soft">Teléfono</span>
        <span class="text-right text-[11px] font-medium text-ink-soft">Mínimo</span>
        <span class="sr-only">Acciones</span>
      </div>
      <div class="divide-y divide-rail">
        <SupplierRow
          v-for="supplier in props.suppliers"
          :key="supplier.id"
          :supplier="supplier"
          :selected="supplier.id === props.selectedId"
          :readonly="props.readonly"
          @select="emit('select', $event)"
          @edit="emit('edit', $event)"
        />
      </div>
    </template>
  </div>
</template>
