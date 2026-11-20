import { computed, ref, watch } from 'vue'

import { branchOptions, type BranchId, type BranchKey } from '@/config/branches'

const STORAGE_KEY = 'estante.branch.v1'

function isBranchId(value: unknown): value is BranchId {
  return value === 'centro' || value === 'norte' || value === 'all'
}

function load(): BranchId {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (isBranchId(raw)) return raw
  } catch {
    // Preferencia inicial si el almacenamiento no está disponible.
  }
  return 'centro'
}

const state = ref<BranchId>(load())

export const branchId = computed(() => state.value)
export const isAllBranches = computed(() => state.value === 'all')
export const branchLabel = computed(
  () => branchOptions.find((option) => option.id === state.value)?.label ?? 'Sucursal Centro',
)

export function setBranch(id: BranchId) {
  if (!isBranchId(id)) return
  state.value = id
}

/** El selector de la barra lateral trabaja con etiquetas; aquí se traducen a identificadores. */
export function setBranchByLabel(label: string) {
  const option = branchOptions.find((branch) => branch.label === label)
  if (option) setBranch(option.id)
}

/** Sucursal concreta donde se escriben los cambios. Nunca es la vista agregada. */
export function writableBranch(): BranchKey | null {
  return state.value === 'all' ? null : state.value
}

watch(branchId, (id) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // La selección sigue activa durante la sesión.
  }
})
