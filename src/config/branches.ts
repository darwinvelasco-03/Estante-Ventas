/** Sucursales reales y la vista agregada de solo lectura. */
export type BranchKey = 'centro' | 'norte'
export type BranchId = BranchKey | 'all'

export interface BranchOption {
  id: BranchId
  label: string
}

export const branchOptions: BranchOption[] = [
  { id: 'centro', label: 'Sucursal Centro' },
  { id: 'norte', label: 'Sucursal Norte' },
  { id: 'all', label: 'Todas las sucursales' },
]

export function isConcreteBranch(id: BranchId): id is BranchKey {
  return id !== 'all'
}
