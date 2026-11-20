import { onScopeDispose, ref, shallowRef, watch } from 'vue'

import { emptyFor, snapshotFor } from '@/data/dashboardMock'
import { branchId } from '@/stores/branch'
import type { DashboardSnapshot } from '@/types/dashboard'

/**
 * Separa la obtención de datos de los componentes visuales.
 * El snapshot depende de la sucursal activa: «Todas» es un agregado de solo lectura.
 * `?estado=vacio` y `?estado=error` permiten revisar esos estados sin ensuciar la interfaz.
 */
export function useDashboard() {
  const data = shallowRef<DashboardSnapshot | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  let timer: number | undefined

  function load() {
    window.clearTimeout(timer)
    loading.value = true
    error.value = null

    const demoState = new URLSearchParams(window.location.search).get('estado')
    if (demoState === 'error') {
      loading.value = false
      error.value = 'No pudimos cargar el resumen de hoy.'
      return
    }

    timer = window.setTimeout(() => {
      data.value = demoState === 'vacio' ? emptyFor(branchId.value) : snapshotFor(branchId.value)
      loading.value = false
    }, 380)
  }

  watch(branchId, load)
  onScopeDispose(() => window.clearTimeout(timer))
  load()

  return { data, loading, error, reload: load }
}
