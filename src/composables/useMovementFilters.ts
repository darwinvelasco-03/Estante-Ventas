import { computed, ref, type Ref } from 'vue'

import type { MovementType, StockMovement } from '@/types/inventory'
import { normalizeText } from '@/utils/search'

export type MovementFilter = 'todos' | MovementType

export function useMovementFilters(movements: Ref<StockMovement[]>) {
  const query = ref('')
  const type = ref<MovementFilter>('todos')
  const productId = ref<string | null>(null)

  const filtered = computed(() => {
    const term = normalizeText(query.value.trim())
    return movements.value.filter((movement) => {
      if (type.value !== 'todos' && movement.type !== type.value) return false
      if (productId.value && movement.productId !== productId.value) return false
      if (!term) return true
      return [movement.productName, movement.productSku, movement.reason, movement.note].some(
        (field) => normalizeText(field).includes(term),
      )
    })
  })

  const counts = computed(() => ({
    todos: movements.value.length,
    entrada: movements.value.filter((movement) => movement.type === 'entrada').length,
    salida: movements.value.filter((movement) => movement.type === 'salida').length,
    conteo: movements.value.filter((movement) => movement.type === 'conteo').length,
  }))

  const hasFilters = computed(
    () => !!query.value.trim() || type.value !== 'todos' || !!productId.value,
  )

  function reset() {
    query.value = ''
    type.value = 'todos'
    productId.value = null
  }

  return { query, type, productId, filtered, counts, hasFilters, reset }
}
