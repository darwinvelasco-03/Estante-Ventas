<script setup lang="ts">
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import type { Client } from '@/types/client'
import { clientGrid } from './grid'
import ClientRow from './ClientRow.vue'

const props = defineProps<{
  clients: Client[]
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
      title="No pudimos cargar el directorio"
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
      v-else-if="props.clients.length === 0"
      icon="clients"
      :title="props.hasFilters ? 'No hay clientes con ese filtro' : 'Todavía no hay clientes'"
      :message="
        props.hasFilters
          ? 'Prueba con otro nombre, apodo o teléfono.'
          : 'Da de alta a tu primer cliente para encontrarlo rápido al cobrar.'
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
      <div :class="[clientGrid, 'hidden border-y border-rail px-3 py-2 md:grid']">
        <span class="text-[11px] font-medium text-ink-soft">Última</span>
        <span class="text-[11px] font-medium text-ink-soft">Cliente</span>
        <span class="text-[11px] font-medium text-ink-soft">Teléfono</span>
        <span class="text-[11px] font-medium text-ink-soft">Señal</span>
        <span class="sr-only">Acciones</span>
      </div>
      <div class="divide-y divide-rail">
        <ClientRow
          v-for="client in props.clients"
          :key="client.id"
          :client="client"
          :selected="client.id === props.selectedId"
          :readonly="props.readonly"
          @select="emit('select', $event)"
          @edit="emit('edit', $event)"
        />
      </div>
    </template>
  </div>
</template>
