import { computed, ref, type Ref } from 'vue'

import type { Product } from '@/types/pos'
import { normalizeText } from '@/utils/search'

export const RESTOCK_THRESHOLD = 5

export function isOutOfStock(product: Product) {
  return product.stock <= 0
}

export function needsRestock(product: Product) {
  return product.stock <= RESTOCK_THRESHOLD
}

export function useProductFilters(products: Ref<Product[]>) {
  const query = ref('')
  const category = ref('Todas')
  const onlyRestock = ref(false)

  const categories = computed(() => {
    const values = new Set(products.value.map((product) => product.category))
    return ['Todas', ...[...values].sort((a, b) => a.localeCompare(b, 'es'))]
  })

  const filtered = computed(() => {
    const term = normalizeText(query.value.trim())
    return products.value.filter((product) => {
      if (category.value !== 'Todas' && product.category !== category.value) return false
      if (onlyRestock.value && !needsRestock(product)) return false
      if (!term) return true
      return [product.name, product.sku, product.barcode].some((field) =>
        normalizeText(field).includes(term),
      )
    })
  })

  const restockCount = computed(() => products.value.filter(needsRestock).length)

  function reset() {
    query.value = ''
    category.value = 'Todas'
    onlyRestock.value = false
  }

  return { query, category, onlyRestock, categories, filtered, restockCount, reset }
}
