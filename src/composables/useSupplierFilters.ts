import { computed, ref, type Ref } from 'vue'

import type { Supplier } from '@/types/supplier'
import { normalizeText } from '@/utils/search'

export type SupplierFilter = 'todos' | 'con-entrega' | 'sin-entrega'

export function useSupplierFilters(suppliers: Ref<Supplier[]>) {
  const query = ref('')
  const filter = ref<SupplierFilter>('todos')

  const filtered = computed(() => {
    const term = normalizeText(query.value.trim())
    return suppliers.value.filter((supplier) => {
      if (filter.value === 'con-entrega' && supplier.deliveryDays.length === 0) return false
      if (filter.value === 'sin-entrega' && supplier.deliveryDays.length > 0) return false
      if (!term) return true
      return [supplier.name, supplier.contact, supplier.line, supplier.phone, supplier.note].some(
        (field) => normalizeText(field).includes(term),
      )
    })
  })

  const counts = computed(() => ({
    todos: suppliers.value.length,
    'con-entrega': suppliers.value.filter((supplier) => supplier.deliveryDays.length > 0).length,
    'sin-entrega': suppliers.value.filter((supplier) => supplier.deliveryDays.length === 0).length,
  }))

  const hasFilters = computed(() => !!query.value.trim() || filter.value !== 'todos')

  function reset() {
    query.value = ''
    filter.value = 'todos'
  }

  return { query, filter, filtered, counts, hasFilters, reset }
}
