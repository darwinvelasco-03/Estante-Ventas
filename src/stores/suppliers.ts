import { computed, reactive } from 'vue'

import type { BranchKey } from '@/config/branches'
import { branchId, isAllBranches, writableBranch } from '@/stores/branch'
import type { Supplier, SupplierError, SupplierInput } from '@/types/supplier'

const STORAGE_KEY = 'estante.suppliers.v1'

function seedCentro(): Supplier[] {
  return [
    {
      id: 's01',
      name: 'Molinos del Valle',
      contact: 'Ing. Roberto Salas',
      phone: '55 1234 5678',
      line: 'Harina, azúcar, frijol',
      deliveryDays: [2, 4],
      minimum: 30,
      paymentTerms: 'Contado',
      note: 'Deja el pedido en el andén antes de las 10 a. m.',
      createdAt: '2026-03-12T09:00:00.000Z',
    },
    {
      id: 's02',
      name: 'Bebidas La Fuente',
      contact: 'Lupita Ángeles',
      phone: '55 8765 4321',
      line: 'Refrescos, agua natural, jugos',
      deliveryDays: [1, 2, 3, 4, 5],
      minimum: 20,
      paymentTerms: 'Crédito 15 días',
      note: 'Maneja regreso de botella.',
      createdAt: '2026-04-02T09:00:00.000Z',
    },
    {
      id: 's03',
      name: 'Distribuidora San Marcos',
      contact: 'Marcos Herrera',
      phone: '55 2244 8890',
      line: 'Lácteos, mantequilla, queso',
      deliveryDays: [1, 3, 5],
      minimum: 15,
      paymentTerms: 'Contado',
      note: 'Requiere pedido la noche anterior.',
      createdAt: '2026-04-21T09:00:00.000Z',
    },
    {
      id: 's04',
      name: 'Frutas y Verduras La Central',
      contact: 'Doña Chole',
      phone: '55 6677 1122',
      line: 'Tomate, cebolla, papaya, fruta de temporada',
      deliveryDays: [2, 5],
      minimum: 9,
      paymentTerms: 'Contado',
      note: 'El precio cambia según temporada; confirmar por teléfono.',
      createdAt: '2026-05-08T09:00:00.000Z',
    },
    {
      id: 's05',
      name: 'Papelería y Limpieza Azteca',
      contact: 'Sandra Pérez',
      phone: '55 3399 4455',
      line: 'Detergente, papel, limpieza',
      deliveryDays: [4],
      minimum: 22,
      paymentTerms: 'Crédito 30 días',
      note: '',
      createdAt: '2026-05-30T09:00:00.000Z',
    },
    {
      id: 's06',
      name: 'Panadería La Esperanza',
      contact: 'Jesús Ramos',
      phone: '55 4411 7766',
      line: 'Pan de caja, bolillo, pastel',
      deliveryDays: [1, 2, 3, 4, 5, 6],
      minimum: 6,
      paymentTerms: 'Contado',
      note: 'Entrega diaria; pedido mínimo bajo.',
      createdAt: '2026-06-14T09:00:00.000Z',
    },
    {
      id: 's07',
      name: 'Comercial del Centro',
      contact: '',
      phone: '55 9988 3311',
      line: 'Abarrotes en general',
      deliveryDays: [],
      minimum: 0,
      paymentTerms: 'Contado',
      note: 'Sin días de entrega registrados. Confirmar con el vendedor.',
      createdAt: '2026-07-01T09:00:00.000Z',
    },
  ]
}

/** Proveedores que surten la sucursal Norte, con mínimos propios en USD. */
function seedNorte(): Supplier[] {
  return [
    {
      id: 's01-n',
      name: 'Molinos Norte',
      contact: 'Ing. Alicia Treviño',
      phone: '55 1110 9911',
      line: 'Harina, azúcar, frijol',
      deliveryDays: [1, 3],
      minimum: 36,
      paymentTerms: 'Contado',
      note: 'Entrega antes de las 8 a. m.',
      createdAt: '2026-03-20T09:00:00.000Z',
    },
    {
      id: 's02-n',
      name: 'Aguas La Sierra',
      contact: 'Rocío Mendoza',
      phone: '55 2220 8822',
      line: 'Agua natural, refrescos, jugos',
      deliveryDays: [2, 4, 6],
      minimum: 24,
      paymentTerms: 'Crédito 15 días',
      note: 'Maneja regreso de botella.',
      createdAt: '2026-04-10T09:00:00.000Z',
    },
    {
      id: 's03-n',
      name: 'Lácteos del Valle Norte',
      contact: 'Guillermo Vargas',
      phone: '55 3330 7733',
      line: 'Leche, mantequilla, queso',
      deliveryDays: [1, 4],
      minimum: 18,
      paymentTerms: 'Contado',
      note: 'Pedido la noche anterior.',
      createdAt: '2026-05-02T09:00:00.000Z',
    },
    {
      id: 's04-n',
      name: 'Verduras El Cedral',
      contact: 'Doña Tere',
      phone: '55 4440 6644',
      line: 'Tomate, cebolla, papaya, verdura de temporada',
      deliveryDays: [3, 6],
      minimum: 12,
      paymentTerms: 'Contado',
      note: 'Confirmar precio el día del pedido.',
      createdAt: '2026-05-18T09:00:00.000Z',
    },
    {
      id: 's05-n',
      name: 'Limpieza Nova',
      contact: 'Paola Ibarra',
      phone: '55 5550 5544',
      line: 'Detergente, papel, limpieza',
      deliveryDays: [5],
      minimum: 26,
      paymentTerms: 'Crédito 30 días',
      note: '',
      createdAt: '2026-06-01T09:00:00.000Z',
    },
    {
      id: 's06-n',
      name: 'Panadería Boreal',
      contact: 'Fermín Ortega',
      phone: '55 6660 4433',
      line: 'Pan de caja, bolillo, pastel',
      deliveryDays: [1, 2, 3, 4, 5],
      minimum: 8,
      paymentTerms: 'Contado',
      note: 'Entrega diaria en la zona norte.',
      createdAt: '2026-06-22T09:00:00.000Z',
    },
  ]
}

function seedFor(key: BranchKey): Supplier[] {
  return key === 'centro' ? seedCentro() : seedNorte()
}

function isSupplier(value: unknown): value is Supplier {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.createdAt === 'string' &&
    Array.isArray(item.deliveryDays)
  )
}

function loadBranch(key: BranchKey): Supplier[] {
  try {
    const raw =
      window.localStorage.getItem(`${STORAGE_KEY}:${key}`) ??
      (key === 'centro' ? window.localStorage.getItem(STORAGE_KEY) : null)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every(isSupplier)) return parsed
    }
  } catch {
    // Directorio de ejemplo si el almacenamiento no está disponible.
  }
  return seedFor(key)
}

const state = reactive<{ byBranch: Record<BranchKey, Supplier[]> }>({
  byBranch: { centro: loadBranch('centro'), norte: loadBranch('norte') },
})

/** Directorio activo; en la vista agregada se muestran ambos proveedores. */
export const suppliers = computed(() => {
  const list = isAllBranches.value
    ? [...state.byBranch.centro, ...state.byBranch.norte]
    : state.byBranch[branchId.value as BranchKey]
  return [...list].sort((a, b) => a.name.localeCompare(b.name, 'es'))
})

export function findSupplier(id: string | null) {
  if (!id) return null
  return [...state.byBranch.centro, ...state.byBranch.norte].find((supplier) => supplier.id === id) ?? null
}

function findIn(key: BranchKey, id: string | null | undefined) {
  if (!id) return null
  return state.byBranch[key].find((supplier) => supplier.id === id) ?? null
}

function persist(key: BranchKey) {
  try {
    window.localStorage.setItem(`${STORAGE_KEY}:${key}`, JSON.stringify(state.byBranch[key]))
  } catch {
    // La sesión sigue funcionando en memoria.
  }
}

function newId() {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function saveSupplier(
  input: SupplierInput,
  id?: string | null,
): { supplier: Supplier | null; error?: SupplierError } {
  const key = writableBranch()
  if (!key) return { supplier: null, error: 'nombre' }

  const name = input.name.trim()
  if (!name) return { supplier: null, error: 'nombre' }

  const phone = input.phone.trim()
  const digits = phone.replace(/\D/g, '')
  if (digits && digits.length !== 10) return { supplier: null, error: 'telefono' }

  const minimum = Number(input.minimum)
  if (!Number.isFinite(minimum) || minimum < 0) return { supplier: null, error: 'minimo' }

  const existing = findIn(key, id)
  if (id && !existing) return { supplier: null, error: 'nombre' }

  const supplier: Supplier = {
    id: existing?.id ?? newId(),
    name,
    contact: input.contact.trim(),
    phone,
    line: input.line.trim(),
    deliveryDays: [...input.deliveryDays].sort((a, b) => a - b),
    // Base USD: conservar decimales aunque la captura venga de COP o CRC.
    minimum: Math.round(minimum * 1e4) / 1e4,
    paymentTerms: input.paymentTerms,
    note: input.note.trim(),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  }

  if (existing) {
    Object.assign(existing, supplier)
  } else {
    state.byBranch[key].push(supplier)
  }
  persist(key)
  return { supplier }
}

export function removeSupplier(id: string) {
  const key = writableBranch()
  if (!key) return false
  const index = state.byBranch[key].findIndex((supplier) => supplier.id === id)
  if (index === -1) return false
  state.byBranch[key].splice(index, 1)
  persist(key)
  return true
}
