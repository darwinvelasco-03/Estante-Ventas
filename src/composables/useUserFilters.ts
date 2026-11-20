import { computed, ref, type Ref } from 'vue'

import type { User } from '@/types/user'

export type UserFilter = 'todos' | 'superuser' | 'branch' | 'inactivos'

export function useUserFilters(source: Ref<User[]>) {
  const query = ref('')
  const filter = ref<UserFilter>('todos')

  const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    return source.value.filter((user) => {
      const matchesFilter =
        filter.value === 'todos' ||
        (filter.value === 'inactivos' ? !user.active : user.role === filter.value)
      const matchesQuery =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q)
      return matchesFilter && matchesQuery
    })
  })

  const counts = computed(() => ({
    todos: source.value.length,
    superuser: source.value.filter((user) => user.role === 'superuser').length,
    branch: source.value.filter((user) => user.role === 'branch').length,
    inactivos: source.value.filter((user) => !user.active).length,
  }))

  const hasFilters = computed(() => !!query.value.trim() || filter.value !== 'todos')

  function reset() {
    query.value = ''
    filter.value = 'todos'
  }

  return { query, filter, filtered, counts, hasFilters, reset }
}
