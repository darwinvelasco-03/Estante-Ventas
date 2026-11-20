<script setup lang="ts">
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import type { StockMovement } from '@/types/inventory'
import { movementGrid } from './grid'
import MovementRow from './MovementRow.vue'

const props = defineProps<{
  movements: StockMovement[]
  loading: boolean
  error: string | null
  hasFilters: boolean
}>()

const emit = defineEmits<{ retry: []; clearFilters: [] }>()
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
      title="No pudimos cargar la bitácora"
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
      v-else-if="props.movements.length === 0"
      icon="inventory"
      :title="props.hasFilters ? 'No hay movimientos con ese filtro' : 'Todavía no hay movimientos'"
      :message="
        props.hasFilters
          ? 'Prueba con otro producto, tipo o texto.'
          : 'Registra una entrada, una salida o un conteo para empezar la bitácora.'
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
      <div :class="[movementGrid, 'hidden border-y border-rail px-3 py-2 md:grid']">
        <span class="text-[11px] font-medium text-ink-soft">Fecha</span>
        <span class="text-[11px] font-medium text-ink-soft">Producto</span>
        <span class="text-[11px] font-medium text-ink-soft">Tipo</span>
        <span class="text-right text-[11px] font-medium text-ink-soft">Cantidad</span>
        <span class="text-[11px] font-medium text-ink-soft">Motivo</span>
        <span class="text-right text-[11px] font-medium text-ink-soft">Saldo</span>
      </div>
      <div class="divide-y divide-rail">
        <MovementRow
          v-for="(movement, index) in props.movements"
          :key="movement.id"
          :movement="movement"
          :last="index === props.movements.length - 1"
        />
      </div>
    </template>
  </div>
</template>
