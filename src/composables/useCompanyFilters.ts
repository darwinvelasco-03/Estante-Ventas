import { computed, ref, type Ref } from 'vue'

import type { Company } from '@/types/company'

export type CompanyFilter = 'todas' | 'activas' | 'inactivas'

export function useCompanyFilters(source: Ref<Company[]>) {
  const query = ref('')
  const filter = ref<CompanyFilter>('todas')

  const filtered = computed(() => {
    const q = query.value.trim().toLowerCase()
    return source.value.filter((company) => {
      const matchesFilter =
        filter.value === 'todas' ||
        (filter.value === 'activas' ? company.active : !company.active)
      const matchesQuery =
        !q ||
        company.legalName.toLowerCase().includes(q) ||
        company.tradeName.toLowerCase().includes(q) ||
        company.taxId.toLowerCase().includes(q)
      return matchesFilter && matchesQuery
    })
  })

  const counts = computed(() => ({
    todas: source.value.length,
    activas: source.value.filter((company) => company.active).length,
    inactivas: source.value.filter((company) => !company.active).length,
  }))

  const hasFilters = computed(() => !!query.value.trim() || filter.value !== 'todas')

  function reset() {
    query.value = ''
    filter.value = 'todas'
  }

  return { query, filter, filtered, counts, hasFilters, reset }
}
