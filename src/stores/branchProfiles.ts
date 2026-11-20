import { computed, reactive } from 'vue'

import { branchOptions, type BranchKey } from '@/config/branches'
import type { BranchProfile, BranchProfileError, BranchProfileInput } from '@/types/branchProfile'

const STORAGE_KEY = 'estante.branchProfiles.v1'

function seed(): Record<BranchKey, BranchProfile> {
  return {
    centro: {
      id: 'centro',
      code: 'CEN',
      name: 'Sucursal Centro',
      street: 'Av. Central 120, Col. Centro',
      city: 'Ciudad de México',
      phone: '55 1234 5678',
      email: 'centro@estante.local',
      manager: 'Carlos Ruiz',
      schedule: 'Lunes a domingo · 07:00 a 22:00',
      status: 'operativa',
      note: 'Sucursal original. Atención al público y recibo de proveedores.',
    },
    norte: {
      id: 'norte',
      code: 'NOR',
      name: 'Sucursal Norte',
      street: 'Blvd. Industrial 845, Col. Norte',
      city: 'Ciudad de México',
      phone: '55 8765 4321',
      email: 'norte@estante.local',
      manager: 'Lucía Soto',
      schedule: 'Lunes a sábado · 08:00 a 21:00',
      status: 'operativa',
      note: 'Sucursal de mayoría para venta al por menor y distribución.',
    },
  }
}

function isProfile(value: unknown): value is BranchProfile {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.street === 'string' &&
    typeof item.city === 'string' &&
    typeof item.phone === 'string' &&
    typeof item.email === 'string' &&
    typeof item.manager === 'string' &&
    typeof item.schedule === 'string' &&
    (item.status === 'operativa' || item.status === 'pausa') &&
    typeof item.note === 'string'
  )
}

function load(): Record<BranchKey, BranchProfile> {
  const initial = seed()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return initial
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return initial
    for (const key of ['centro', 'norte'] as const) {
      const value = (parsed as Record<string, unknown>)[key]
      if (isProfile(value)) initial[key] = { ...initial[key]!, ...value }
    }
  } catch {
    // Fichas de ejemplo si el almacenamiento no está disponible.
  }
  return initial
}

const state = reactive<{ profiles: Record<BranchKey, BranchProfile> }>({ profiles: load() })

export const branchProfiles = computed<BranchProfile[]>(() =>
  branchOptions
    .filter((option) => option.id !== 'all')
    .map((option) => state.profiles[option.id as BranchKey]!)
    .filter(Boolean),
)

export function findBranchProfile(id: BranchKey | null | undefined) {
  if (!id) return null
  return state.profiles[id] ?? null
}

/** Prefijos de folio de cada sucursal; se muestran solo como referencia. */
export function folioPrefixes(id: BranchKey) {
  const series = id === 'centro' ? '00' : '10'
  const sales = id === 'centro' ? '20' : '30'
  return {
    ordenes: `OC-${series}xx`,
    gastos: `G-${series}xx`,
    caja: `CJ-${series}xx`,
    ventas: `V-${sales}xx`,
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.profiles))
  } catch {
    // Las fichas siguen disponibles en memoria.
  }
}

export function saveBranchProfile(
  id: BranchKey,
  input: BranchProfileInput,
): { profile: BranchProfile | null; error?: BranchProfileError } {
  const profile = findBranchProfile(id)
  if (!profile) return { profile: null, error: 'direccion' }
  const street = input.street.trim()
  const manager = input.manager.trim()
  if (!street) return { profile: null, error: 'direccion' }
  if (!manager) return { profile: null, error: 'responsable' }

  Object.assign(profile, {
    street,
    city: input.city.trim(),
    phone: input.phone.trim(),
    email: input.email.trim().toLowerCase(),
    manager,
    schedule: input.schedule.trim(),
    status: input.status === 'pausa' ? 'pausa' : 'operativa',
    note: input.note.trim(),
  })
  persist()
  return { profile }
}

export const branchProfileErrorText: Record<BranchProfileError, string> = {
  direccion: 'Escribe la dirección de la sucursal.',
  responsable: 'Escribe el nombre del responsable.',
}
