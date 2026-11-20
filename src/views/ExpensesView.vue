<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ExpenseDetail from '@/components/expenses/ExpenseDetail.vue'
import ExpenseList from '@/components/expenses/ExpenseList.vue'
import ExpenseSheet from '@/components/expenses/ExpenseSheet.vue'
import { useExpenseFilters, type ExpenseFilter } from '@/composables/useExpenseFilters'
import { isAllBranches } from '@/stores/branch'
import {
  expenses,
  findExpense,
  payExpense,
  removeExpense,
  saveExpense,
} from '@/stores/expenses'
import {
  expenseCategories,
  type ExpenseCategory,
  type ExpenseError,
  type ExpenseInput,
} from '@/types/expense'

const props = defineProps<{ branch: string }>()

const { query, filter, category, filtered, counts, hasFilters, reset } = useExpenseFilters(expenses)

const params = new URLSearchParams(window.location.search)
const error = ref(
  params.get('gastos') === 'error' ? 'Revisa tu conexión e inténtalo de nuevo.' : null,
)
const loading = ref(params.get('gastos') === 'cargando')
const selectedId = ref<string | null>(null)
const sheetOpen = ref(false)
const editing = ref<string | null>(null)
const confirmOpen = ref(false)
const notice = ref<{ text: string; tone: 'ok' | 'error' } | null>(null)
let timer: number | undefined

onMounted(() => {
  selectedId.value = filtered.value[0]?.id ?? null
  if (loading.value) timer = window.setTimeout(() => (loading.value = false), 1200)
})
onUnmounted(() => window.clearTimeout(timer))

const tabs: { id: ExpenseFilter; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendientes', label: 'Pendientes' },
  { id: 'pagadas', label: 'Pagadas' },
]

const selected = computed(() => findExpense(selectedId.value))
const editingExpense = computed(() => findExpense(editing.value))

watch(filtered, (list) => {
  if (list.length === 0) {
    selectedId.value = null
  } else if (!list.some((expense) => expense.id === selectedId.value)) {
    selectedId.value = list[0]?.id ?? null
  }
})

function openNew() {
  if (isAllBranches.value) return
  editing.value = null
  sheetOpen.value = true
  notice.value = null
}

function openEdit(id: string) {
  if (isAllBranches.value) return
  editing.value = id
  sheetOpen.value = true
  notice.value = null
}

function onSave(input: ExpenseInput, id: string | null) {
  if (isAllBranches.value) return
  const result = saveExpense(input, id)
  if (result.error || !result.expense) {
    notice.value = {
      text: `No pudimos guardar el gasto. ${errorText[result.error ?? 'concepto']}`,
      tone: 'error',
    }
    return
  }
  sheetOpen.value = false
  selectedId.value = result.expense.id
  notice.value = {
    text: id ? 'Gasto actualizado' : `Gasto ${result.expense.folio} registrado`,
    tone: 'ok',
  }
}

function onPay() {
  if (isAllBranches.value || !selected.value) return
  const result = payExpense(selected.value.id, selected.value.paymentMethod)
  if (result.error || !result.expense) {
    notice.value = {
      text: `No pudimos registrar el pago. ${errorText[result.error ?? 'no-encontrado']}`,
      tone: 'error',
    }
    return
  }
  notice.value = {
    text: `${result.expense.folio} marcado como pagado`,
    tone: 'ok',
  }
}

function onRemove() {
  if (isAllBranches.value || !selected.value) return
  const folio = selected.value.folio
  removeExpense(selected.value.id)
  confirmOpen.value = false
  selectedId.value = filtered.value[0]?.id ?? null
  notice.value = { text: `Gasto ${folio} eliminado`, tone: 'ok' }
}

const errorText: Record<ExpenseError, string> = {
  concepto: 'Falta el concepto.',
  monto: 'Revisa el monto.',
  fecha: 'Revisa la fecha.',
  'no-encontrado': 'El gasto ya no existe.',
  pagado: 'Un gasto pagado no se puede modificar.',
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="font-display text-xl font-semibold tracking-tight text-ink">Gastos</h2>
        <p class="mt-0.5 text-sm text-ink-soft">Egresos · {{ props.branch }}</p>
      </div>
      <button
        v-if="!isAllBranches"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 font-display text-sm font-semibold text-surface hover:bg-ink-soft"
        @click="openNew"
      >
        <AppIcon name="plus" :size="15" />
        Nuevo gasto
      </button>
    </div>

    <p v-if="isAllBranches" class="text-xs text-ink-soft">
      Vista agregada de solo lectura. Selecciona una sucursal para registrar o pagar gastos.
    </p>

    <p
      v-if="notice"
      class="flex items-center gap-1.5 text-xs"
      :class="notice.tone === 'ok' ? 'text-ok' : 'text-brick'"
      aria-live="polite"
    >
      <AppIcon :name="notice.tone === 'ok' ? 'check' : 'alert'" :size="14" />
      {{ notice.text }}
    </p>

    <div class="space-y-3">
      <div class="relative">
        <AppIcon
          name="search"
          :size="16"
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft"
        />
        <input
          id="expense-search"
          :value="query"
          type="search"
          autocomplete="off"
          placeholder="Buscar folio, concepto o proveedor"
          class="w-full rounded-sm border border-rail bg-surface py-2 pr-3 pl-9 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
          @input="query = ($event.target as HTMLInputElement).value"
        />
      </div>

      <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div class="flex flex-wrap gap-x-3 gap-y-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="text-xs transition-colors"
            :class="
              filter === tab.id
                ? 'font-semibold text-ink underline decoration-2 underline-offset-4'
                : 'text-ink-soft hover:text-ink'
            "
            :aria-pressed="filter === tab.id"
            @click="filter = tab.id"
          >
            {{ tab.label }} <span class="tnum">{{ counts[tab.id] }}</span>
          </button>
        </div>
        <div class="flex items-center gap-2">
          <label for="expense-category-filter" class="text-[11px] text-ink-soft">Categoría</label>
          <select
            id="expense-category-filter"
            v-model="category"
            class="rounded-sm border border-rail bg-surface px-2 py-1.5 text-xs text-ink focus-visible:border-ink"
          >
            <option value="todas">Todas</option>
            <option v-for="item in expenseCategories" :key="item" :value="item as ExpenseCategory">
              {{ item }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(300px,5fr)]">
      <section aria-label="Gastos registrados" class="min-w-0 rounded-sm border border-rail bg-surface">
        <ExpenseList
          :expenses="filtered"
          :loading="loading"
          :error="error"
          :has-filters="hasFilters"
          :selected-id="selectedId"
          @retry="error = null"
          @clear-filters="reset"
          @select="selectedId = $event"
        />

        <div
          class="flex flex-wrap items-center justify-between gap-2 border-t border-rail px-4 py-2.5 text-xs text-ink-soft"
        >
          <span class="tnum">{{ filtered.length }} de {{ expenses.length }} gastos</span>
          <span v-if="selected">
            Gasto abierto ·
            <strong class="font-semibold text-ink">{{ selected.folio }}</strong>
          </span>
        </div>
      </section>

      <section aria-label="Detalle del gasto" class="rounded-sm border border-rail bg-surface p-4">
        <ExpenseDetail
          :expense="selected"
          :readonly="isAllBranches"
          @create="openNew"
          @edit="openEdit(selected?.id ?? '')"
          @pay="onPay"
          @remove="confirmOpen = true"
        />
      </section>
    </div>

    <ExpenseSheet
      v-if="!isAllBranches"
      :open="sheetOpen"
      :expense="editingExpense"
      @close="sheetOpen = false"
      @save="onSave"
    />

    <ConfirmDialog
      v-if="confirmOpen && selected && !isAllBranches"
      tone="danger"
      title="Eliminar gasto"
      :message="`¿Eliminar el gasto ${selected.folio}? Desaparecerá también de Caja y Reportes.`"
      confirm-label="Eliminar gasto"
      @confirm="onRemove"
      @cancel="confirmOpen = false"
    />
  </div>
</template>
