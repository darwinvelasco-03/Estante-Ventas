<script setup lang="ts">
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import type { Expense } from '@/types/expense'
import { expenseRowGrid } from './grid'
import ExpenseRow from './ExpenseRow.vue'

const props = defineProps<{
  expenses: Expense[]
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
      title="No pudimos cargar los gastos"
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
      v-else-if="props.expenses.length === 0"
      icon="expenses"
      :title="props.hasFilters ? 'No hay gastos con ese filtro' : 'Todavía no hay gastos registrados'"
      :message="
        props.hasFilters
          ? 'Prueba con otro folio, concepto o categoría.'
          : 'Registra un gasto para controlar lo que pagas y lo que aún quedó pendiente.'
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
      <div :class="[expenseRowGrid, 'hidden border-y border-rail px-3 py-2 md:grid']">
        <span class="text-[11px] font-medium text-ink-soft">Gasto / concepto</span>
        <span class="text-[11px] font-medium text-ink-soft">Categoría</span>
        <span class="text-[11px] font-medium text-ink-soft">Fecha</span>
        <span class="text-right text-[11px] font-medium text-ink-soft">Monto</span>
        <span class="sr-only">Estatus</span>
      </div>
      <div class="divide-y divide-rail">
        <ExpenseRow
          v-for="expense in props.expenses"
          :key="expense.id"
          :expense="expense"
          :selected="expense.id === props.selectedId"
          @select="emit('select', $event)"
        />
      </div>
    </template>
  </div>
</template>
