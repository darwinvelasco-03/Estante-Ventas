<script setup lang="ts">
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import type { Purchase } from '@/types/purchase'
import { purchaseRowGrid } from './grid'
import PurchaseRow from './PurchaseRow.vue'

const props = defineProps<{
  purchases: Purchase[]
  loading: boolean
  error: string | null
  hasFilters: boolean
  selectedId: string | null
}>()

const emit = defineEmits<{
  retry: []
  clearFilters: []
  select: [id: string]
}>()
</script>

<template>
  <div>
    <div v-if="props.loading" class="space-y-2 p-3" aria-hidden="true">
      <SkeletonBlock v-for="row in 4" :key="row" class="h-16 w-full" />
    </div>

    <StatePanel
      v-else-if="props.error"
      icon="alert"
      tone="danger"
      title="No pudimos cargar las compras"
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
      v-else-if="props.purchases.length === 0"
      icon="purchases"
      :title="props.hasFilters ? 'No hay órdenes con ese filtro' : 'Todavía no hay órdenes de compra'"
      :message="
        props.hasFilters
          ? 'Prueba con otro folio, proveedor o producto.'
          : 'Registra una orden para controlar lo que pediste y lo que ya llegó.'
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
      <div :class="[purchaseRowGrid, 'hidden border-y border-rail px-3 py-2 md:grid']">
        <span class="text-[11px] font-medium text-ink-soft">Orden / proveedor</span>
        <span class="text-[11px] font-medium text-ink-soft">Recepción</span>
        <span class="text-right text-[11px] font-medium text-ink-soft">Total</span>
        <span class="sr-only">Estatus</span>
      </div>
      <div class="divide-y divide-rail">
        <PurchaseRow
          v-for="purchase in props.purchases"
          :key="purchase.id"
          :purchase="purchase"
          :selected="purchase.id === props.selectedId"
          @select="emit('select', $event)"
        />
      </div>
    </template>
  </div>
</template>
