<script setup lang="ts">
import StatePanel from '@/components/ui/StatePanel.vue'
import type { Company } from '@/types/company'
import { companyGrid } from './grid'
import CompanyRow from './CompanyRow.vue'

const props = defineProps<{
  companies: Company[]
  error: string | null
  hasFilters: boolean
  selectedId: string | null
  activeId: string | null
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
    <StatePanel
      v-if="props.error"
      icon="alert"
      tone="danger"
      title="No pudimos cargar las empresas"
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
      v-else-if="props.companies.length === 0"
      icon="companies"
      :title="props.hasFilters ? 'Sin resultados' : 'Todavía no hay empresas'"
      :message="
        props.hasFilters
          ? 'Prueba con otra búsqueda o quita los filtros aplicados.'
          : 'Registra la primera razón social para empezar.'
      "
    >
      <button
        v-if="props.hasFilters"
        type="button"
        class="rounded-sm border border-rail px-3 py-1.5 text-xs font-medium text-ink hover:border-ink"
        @click="emit('clearFilters')"
      >
        Limpiar filtros
      </button>
    </StatePanel>

    <template v-else>
      <div :class="[companyGrid, 'hidden border-y border-rail px-3 py-2 md:grid']">
        <span class="text-[11px] font-medium text-ink-soft">Empresa</span>
        <span class="text-[11px] font-medium text-ink-soft">Identificación fiscal</span>
        <span class="text-[11px] font-medium text-ink-soft">Ciudad</span>
        <span class="text-[11px] font-medium text-ink-soft">Estado</span>
        <span class="sr-only">Acciones</span>
      </div>
      <div class="divide-y divide-rail">
        <CompanyRow
          v-for="company in props.companies"
          :key="company.id"
          :company="company"
          :selected="company.id === props.selectedId"
          :is-active="company.id === props.activeId"
          @select="emit('select', $event)"
          @edit="emit('edit', $event)"
        />
      </div>
    </template>
  </div>
</template>
