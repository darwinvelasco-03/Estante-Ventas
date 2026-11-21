<script setup lang="ts">
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import type { LedgerEntry } from '@/types/reversal'
import { ledgerGrid } from './grid'
import LedgerRow from './LedgerRow.vue'

const props = defineProps<{
  entries: LedgerEntry[]
  loading: boolean
  error: string | null
  hasFilters: boolean
  canRevert: boolean
  selectedId: string | null
}>()

const emit = defineEmits<{
  retry: []
  clearFilters: []
  select: [id: string]
  revert: [entry: LedgerEntry]
}>()
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
      v-else-if="props.entries.length === 0"
      icon="history"
      :title="props.hasFilters ? 'No hay movimientos con ese filtro' : 'Todavía no hay movimientos'"
      :message="
        props.hasFilters
          ? 'Prueba con otro folio, tipo o texto.'
          : 'Los cobros, pagos y ajustes de inventario aparecerán aquí.'
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
      <div :class="[ledgerGrid, 'hidden border-y border-rail px-3 py-2 md:grid']">
        <span class="text-[11px] font-medium text-ink-soft">Fecha</span>
        <span class="text-[11px] font-medium text-ink-soft">Documento</span>
        <span class="text-[11px] font-medium text-ink-soft">Tipo</span>
        <span class="text-[11px] font-medium text-ink-soft">Detalle</span>
        <span class="text-right text-[11px] font-medium text-ink-soft">Importe</span>
        <span class="text-[11px] font-medium text-ink-soft">Estado</span>
        <span class="sr-only">Acciones</span>
      </div>
      <div class="divide-y divide-rail">
        <LedgerRow
          v-for="entry in props.entries"
          :key="entry.id"
          :entry="entry"
          :selected="entry.id === props.selectedId"
          :can-revert="props.canRevert"
          @select="emit('select', $event)"
          @revert="emit('revert', $event)"
        />
      </div>
    </template>
  </div>
</template>
