import { computed, reactive } from 'vue'

import type { Company, CompanyError, CompanyInput } from '@/types/company'

const STORAGE_KEY = 'estante.companies.v1'

function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

/** Dos personas jurídicas de ejemplo; la principal queda activa al iniciar. */
function seed(): Company[] {
  return [
    {
      id: 'co1',
      legalName: 'Estante Abarrotes, S.A. de C.V.',
      tradeName: 'Estante',
      taxId: 'EST-010203-AB5',
      phone: '55 1234 5678',
      email: 'contacto@estante.local',
      street: 'Av. Central 120, Col. Centro',
      city: 'Ciudad de México',
      active: true,
      createdAt: daysAgo(240),
    },
    {
      id: 'co2',
      legalName: 'Bodega Norte, S.A. de C.V.',
      tradeName: 'Bodega Norte',
      taxId: 'BN-980765-XY2',
      phone: '55 8765 4321',
      email: 'bodega@estante.local',
      street: 'Blvd. Industrial 845, Col. Norte',
      city: 'Ciudad de México',
      active: false,
      createdAt: daysAgo(96),
    },
  ]
}

function isCompany(value: unknown): value is Company {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.legalName === 'string' &&
    typeof item.tradeName === 'string' &&
    typeof item.taxId === 'string' &&
    typeof item.phone === 'string' &&
    typeof item.email === 'string' &&
    typeof item.street === 'string' &&
    typeof item.city === 'string' &&
    typeof item.active === 'boolean'
  )
}

function load(): Company[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isCompany)) {
        if (parsed.filter((company) => company.active).length === 1) return parsed
        // Normaliza guardados anteriores para que siempre haya una sola activa.
        let hasActive = false
        return parsed.map((company) => {
          if (company.active && !hasActive) {
            hasActive = true
            return company
          }
          if (!company.active && !hasActive) {
            hasActive = true
            return { ...company, active: true }
          }
          return company.active ? { ...company, active: false } : company
        })
      }
    }
  } catch {
    // Catálogo de ejemplo si el almacenamiento no está disponible.
  }
  return seed()
}

const state = reactive<{ companies: Company[] }>({ companies: load() })

export const companies = computed(() =>
  [...state.companies].sort((a, b) => a.legalName.localeCompare(b.legalName, 'es')),
)

/** Exactamente una empresa activa: es la que aparece en la cabecera. */
export const activeCompany = computed(() => state.companies.find((company) => company.active) ?? null)

export const activeCompanyCount = computed(
  () => state.companies.filter((company) => company.active).length,
)

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.companies))
  } catch {
    // El catálogo sigue funcionando en memoria.
  }
}

export function findCompany(id: string | null | undefined) {
  if (!id) return null
  return state.companies.find((company) => company.id === id) ?? null
}

export function setActiveCompany(id: string): CompanyError | null {
  const found = findCompany(id)
  if (!found) return 'no-encontrado'
  for (const company of state.companies) company.active = company.id === found.id
  persist()
  return null
}

export function saveCompany(
  input: CompanyInput,
  id: string | null = null,
): { company: Company | null; error?: CompanyError } {
  const legalName = input.legalName.trim()
  const tradeName = input.tradeName.trim() || legalName
  const taxId = input.taxId.trim()
  const email = input.email.trim().toLowerCase()
  if (!legalName) return { company: null, error: 'legalName' }
  if (!taxId) return { company: null, error: 'taxId' }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { company: null, error: 'correo' }
  if (
    state.companies.some(
      (company) => company.taxId.toLowerCase() === taxId.toLowerCase() && company.id !== id,
    )
  ) {
    return { company: null, error: 'duplicado' }
  }

  const existing = id ? findCompany(id) : null
  if (id && !existing) return { company: null, error: 'no-encontrado' }

  const active = input.active
  if (existing?.active && !active) return { company: null, error: 'activa' }

  const fields = {
    legalName,
    tradeName,
    taxId,
    phone: input.phone.trim(),
    email,
    street: input.street.trim(),
    city: input.city.trim(),
    active,
  }

  if (existing) {
    Object.assign(existing, fields)
  } else {
    state.companies.push({
      id: `co-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      ...fields,
      createdAt: new Date().toISOString(),
    })
  }

  // Marcar una empresa como activa desactiva a las demás, incluso en el alta.
  if (active) {
    const savedId = existing?.id ?? state.companies[state.companies.length - 1]!.id
    for (const company of state.companies) company.active = company.id === savedId
  }

  persist()
  return { company: existing ?? state.companies[state.companies.length - 1]! }
}

export function removeCompany(id: string): CompanyError | null {
  const index = state.companies.findIndex((company) => company.id === id)
  if (index < 0) return 'no-encontrado'
  const found = state.companies[index]!
  if (found.active) return 'activa'
  state.companies.splice(index, 1)
  persist()
  return null
}

export const companyErrorText: Record<CompanyError, string> = {
  legalName: 'Escribe la razón social de la empresa.',
  taxId: 'Escribe la identificación fiscal.',
  correo: 'Escribe un correo válido.',
  duplicado: 'Ya existe una empresa con esa identificación fiscal.',
  'no-encontrado': 'No pudimos encontrar la empresa.',
  activa: 'Usa «Marcar como activa» en otra empresa antes de desactivar o eliminar esta.',
  'ultima-activa': 'Debe existir al menos una empresa activa.',
}
