import { computed, reactive } from 'vue'

import type { BranchKey } from '@/config/branches'
import { branchId, isAllBranches, writableBranch } from '@/stores/branch'
import type { ReversalAdjustment } from '@/types/reversal'

const STORAGE_KEY = 'estante.reversals.v1'

function isAdjustment(value: unknown): value is ReversalAdjustment {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.sourceId === 'string' &&
    typeof item.createdAt === 'string' &&
    typeof item.amount === 'number' &&
    typeof item.category === 'string'
  )
}

function loadBranch(key: BranchKey): ReversalAdjustment[] {
  try {
    const raw =
      window.localStorage.getItem(`${STORAGE_KEY}:${key}`) ??
      (key === 'centro' ? window.localStorage.getItem(STORAGE_KEY) : null)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every(isAdjustment)) return parsed
    }
  } catch {
    // El historial de ajustes sigue disponible en memoria.
  }
  return []
}

const state = reactive<{ byBranch: Record<BranchKey, ReversalAdjustment[]> }>({
  byBranch: { centro: loadBranch('centro'), norte: loadBranch('norte') },
})

/** Ajustes de la sucursal activa; en «Todas» se concatenan ambas. */
export const adjustments = computed(() => {
  const list = isAllBranches.value
    ? [...state.byBranch.centro, ...state.byBranch.norte]
    : state.byBranch[branchId.value as BranchKey]
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})

/** Acceso por sucursal para Caja, que cuadra sesiones de cualquiera de las dos. */
export function adjustmentsFor(key: BranchKey): ReversalAdjustment[] {
  return state.byBranch[key]
}

function persist(key: BranchKey) {
  try {
    window.localStorage.setItem(`${STORAGE_KEY}:${key}`, JSON.stringify(state.byBranch[key]))
  } catch {
    // La sesión sigue funcionando en memoria.
  }
}

function newId() {
  return `aj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

/** Registra la compensación de una anulación en la sucursal donde ocurrió. */
export function recordAdjustment(
  branch: BranchKey,
  input: Omit<ReversalAdjustment, 'id' | 'branch'>,
): ReversalAdjustment | null {
  const key = writableBranch()
  if (!key || key !== branch) return null
  const adjustment: ReversalAdjustment = { ...input, id: newId(), branch: key }
  state.byBranch[key].push(adjustment)
  persist(key)
  return adjustment
}
