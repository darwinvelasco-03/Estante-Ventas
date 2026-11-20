import { computed, ref, watch } from 'vue'

import { branchOptions, type BranchId, type BranchKey } from '@/config/branches'
import { canUseBranch, canWriteBranch } from '@/stores/users'

const STORAGE_KEY = 'estante.branch.v1'

function isBranchId(value: unknown): value is BranchId {
  return value === 'centro' || value === 'norte' || value === 'all'
}

function firstAllowed(): BranchId {
  return branchOptions.find((option) => canUseBranch(option.id))?.id ?? 'centro'
}

function load(): BranchId {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (isBranchId(raw) && canUseBranch(raw)) return raw
    const fallback = firstAllowed()
    // Solo reescribe si había una preferencia inválida; sin clave no se crea ninguna.
    if (raw) window.localStorage.setItem(STORAGE_KEY, fallback)
    return fallback
  } catch {
    // Preferencia inicial si el almacenamiento no está disponible.
  }
  return firstAllowed()
}

const state = ref<BranchId>(load())

export const branchId = computed(() => state.value)
export const isAllBranches = computed(() => state.value === 'all')
export const branchLabel = computed(
  () => branchOptions.find((option) => option.id === state.value)?.label ?? 'Sucursal Centro',
)

export function setBranch(id: BranchId) {
  if (!isBranchId(id) || !canUseBranch(id)) return
  state.value = id
}

/** El selector de la barra lateral trabaja con etiquetas; aquí se traducen a identificadores. */
export function setBranchByLabel(label: string) {
  const option = branchOptions.find((branch) => branch.label === label)
  if (option) setBranch(option.id)
}

/** Sucursal concreta donde se escriben los cambios. Nunca es la vista agregada ni una sucursal ajena. */
export function writableBranch(): BranchKey | null {
  return canWriteBranch(state.value) ? (state.value as BranchKey) : null
}

watch(branchId, (id) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // La selección sigue activa durante la sesión.
  }
})
