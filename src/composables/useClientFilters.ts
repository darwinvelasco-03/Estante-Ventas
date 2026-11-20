import { computed, ref, type Ref } from 'vue'

import type { Client } from '@/types/client'
import { normalizeText } from '@/utils/search'

export type ClientFilter = 'todos' | 'frecuentes' | 'sin-visita'

export function useClientFilters(clients: Ref<Client[]>) {
  const query = ref('')
  const filter = ref<ClientFilter>('todos')

  const filtered = computed(() => {
    const term = normalizeText(query.value.trim())
    return clients.value.filter((client) => {
      if (filter.value === 'frecuentes' && !client.frequent) return false
      if (filter.value === 'sin-visita' && client.lastVisit) return false
      if (!term) return true
      return [client.name, client.alias, client.phone, client.note].some((field) =>
        normalizeText(field).includes(term),
      )
    })
  })

  const counts = computed(() => ({
    todos: clients.value.length,
    frecuentes: clients.value.filter((client) => client.frequent).length,
    'sin-visita': clients.value.filter((client) => !client.lastVisit).length,
  }))

  const hasFilters = computed(() => !!query.value.trim() || filter.value !== 'todos')

  function reset() {
    query.value = ''
    filter.value = 'todos'
  }

  return { query, filter, filtered, counts, hasFilters, reset }
}
