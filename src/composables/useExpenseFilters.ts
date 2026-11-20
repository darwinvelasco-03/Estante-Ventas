import { computed, ref, type Ref } from 'vue'

import type { Expense, ExpenseCategory } from '@/types/expense'
import { normalizeText } from '@/utils/search'

export type ExpenseFilter = 'todas' | 'pendientes' | 'pagadas'

export function useExpenseFilters(expenses: Ref<Expense[]>) {
  const query = ref('')
  const filter = ref<ExpenseFilter>('todas')
  const category = ref<ExpenseCategory | 'todas'>('todas')

  const filtered = computed(() => {
    const term = normalizeText(query.value.trim())
    return expenses.value.filter((expense) => {
      if (filter.value === 'pendientes' && expense.status === 'pagado') return false
      if (filter.value === 'pagadas' && expense.status !== 'pagado') return false
      if (category.value !== 'todas' && expense.category !== category.value) return false
      if (!term) return true
      return [expense.folio, expense.concept, expense.supplierName, expense.category, expense.note].some(
        (field) => normalizeText(field).includes(term),
      )
    })
  })

  const counts = computed(() => ({
    todas: expenses.value.length,
    pendientes: expenses.value.filter((expense) => expense.status === 'pendiente').length,
    pagadas: expenses.value.filter((expense) => expense.status === 'pagado').length,
  }))

  const hasFilters = computed(
    () => !!query.value.trim() || filter.value !== 'todas' || category.value !== 'todas',
  )

  function reset() {
    query.value = ''
    filter.value = 'todas'
    category.value = 'todas'
  }

  return { query, filter, category, filtered, counts, hasFilters, reset }
}
