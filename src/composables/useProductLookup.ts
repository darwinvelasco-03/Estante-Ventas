import { onScopeDispose, ref } from 'vue'

import { catalogProducts } from '@/stores/catalog'
import type { Product } from '@/types/pos'
import { normalizeText } from '@/utils/search'

/** Búsqueda local sobre el catálogo de ejemplo. `?pos=error` permite revisar el estado de error. */
export function useProductLookup() {
  const query = ref('')
  const results = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let timer: number | undefined

  function search(term: string = query.value) {
    window.clearTimeout(timer)
    const value = normalizeText(term.trim())
    loading.value = true
    error.value = null

    timer = window.setTimeout(() => {
      if (new URLSearchParams(window.location.search).get('pos') === 'error') {
        loading.value = false
        error.value = 'No pudimos consultar el catálogo.'
        return
      }

      results.value = value
        ? catalogProducts.value
            .filter((product) =>
              [product.name, product.sku, product.barcode].some((field) =>
                normalizeText(field).includes(value),
              ),
            )
            .slice(0, 6)
        : []
      loading.value = false
    }, 160)
  }

  function clear() {
    window.clearTimeout(timer)
    query.value = ''
    results.value = []
    loading.value = false
    error.value = null
  }

  onScopeDispose(() => window.clearTimeout(timer))

  return { query, results, loading, error, search, clear }
}
