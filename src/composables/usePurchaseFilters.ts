import { computed, ref, type Ref } from 'vue'

import type { Purchase } from '@/types/purchase'
import { normalizeText } from '@/utils/search'

export type PurchaseFilter = 'todas' | 'pendientes' | 'recibidas'

export function usePurchaseFilters(purchases: Ref<Purchase[]>) {
  const query = ref('')
  const filter = ref<PurchaseFilter>('todas')

  const filtered = computed(() => {
    const term = normalizeText(query.value.trim())
    return purchases.value.filter((purchase) => {
      if (filter.value === 'pendientes' && purchase.receivedAt) return false
      if (filter.value === 'recibidas' && !purchase.receivedAt) return false
      if (!term) return true
      const haystack = [
        purchase.folio,
        purchase.supplierName,
        purchase.note,
        ...purchase.lines.map((line) => `${line.name} ${line.sku}`),
      ]
      return haystack.some((field) => normalizeText(field).includes(term))
    })
  })

  const counts = computed(() => ({
    todas: purchases.value.length,
    pendientes: purchases.value.filter((purchase) => !purchase.receivedAt).length,
    recibidas: purchases.value.filter((purchase) => purchase.receivedAt).length,
  }))

  const hasFilters = computed(() => !!query.value.trim() || filter.value !== 'todas')

  function reset() {
    query.value = ''
    filter.value = 'todas'
  }

  return { query, filter, filtered, counts, hasFilters, reset }
}
