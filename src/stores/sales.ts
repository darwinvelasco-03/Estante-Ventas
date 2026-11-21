import { computed, reactive } from 'vue'

import type { BranchKey } from '@/config/branches'
import { branchId, isAllBranches, writableBranch } from '@/stores/branch'
import type { ReversalStamp } from '@/types/reversal'
import type { SaleInput, SaleLineRecord, SaleRecord } from '@/types/sale'

const STORAGE_KEY = 'estante.sales.v1'

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

interface SeedLine {
  id: string
  name: string
  sku: string
  price: number
  quantity: number
}

const basket: SeedLine[][] = [
  [
    { id: 'p01', name: 'Harina de trigo 1 kg', sku: 'HAR-001', price: 28, quantity: 2 },
    { id: 'p06', name: 'Leche entera 1 L', sku: 'LEC-011', price: 27, quantity: 1 },
  ],
  [
    { id: 'p07', name: 'Café molido 500 g', sku: 'CAF-009', price: 92, quantity: 1 },
  ],
  [
    { id: 'p05', name: 'Arroz blanco 1 kg', sku: 'ARR-002', price: 38, quantity: 2 },
    { id: 'p12', name: 'Tomate, por kg', sku: 'TOM-015', price: 24, quantity: 2 },
    { id: 'p13', name: 'Cebolla, por kg', sku: 'CEB-016', price: 19, quantity: 1 },
  ],
  [
    { id: 'p15', name: 'Agua natural 1 L', sku: 'AGU-023', price: 14, quantity: 2 },
    { id: 'p17', name: 'Galletas de sal, paquete', sku: 'GAL-018', price: 26, quantity: 1 },
  ],
  [
    { id: 'p11', name: 'Queso fresco 500 g', sku: 'QUE-004', price: 78, quantity: 1 },
    { id: 'p09', name: 'Pan de caja 500 g', sku: 'PAN-020', price: 35, quantity: 1 },
  ],
  [
    { id: 'p04', name: 'Frijol negro 1 kg', sku: 'FRI-003', price: 55, quantity: 1 },
    { id: 'p02', name: 'Aceite vegetal 1 L', sku: 'ACE-014', price: 46, quantity: 1 },
    { id: 'p20', name: 'Sal refinada 1 kg', sku: 'SAL-007', price: 16, quantity: 1 },
  ],
  [
    { id: 'p08', name: 'Huevo, docena', sku: 'HUE-005', price: 68, quantity: 1 },
  ],
]

const timeline = [
  { hours: 50, method: 'efectivo' },
  { hours: 46, method: 'tarjeta' },
  { hours: 26, method: 'efectivo' },
  { hours: 20, method: 'efectivo' },
  { hours: 14, method: 'tarjeta' },
  { hours: 3, method: 'efectivo' },
  { hours: 1, method: 'efectivo' },
] as const

function seedFor(key: BranchKey): SaleRecord[] {
  const prefix = key === 'norte' ? 'V-30' : 'V-20'
  const priceFactor = key === 'norte' ? 1.08 : 1

  return timeline.map((entry, index) => {
    const lines: SaleLineRecord[] = basket[index]!.map((line) => {
      const unitPrice = Math.round(line.price * priceFactor * 100) / 100
      // Las canastas de ejemplo representan el movimiento de varias ventas agrupadas.
      const quantity = line.quantity * 5
      return {
        productId: key === 'norte' ? `${line.id}-n` : line.id,
        name: line.name,
        sku: key === 'norte' ? `${line.sku}-N` : line.sku,
        quantity,
        unitPrice,
        total: Math.round(unitPrice * quantity * 100) / 100,
      }
    })
    const total = Math.round(lines.reduce((sum, line) => sum + line.total, 0) * 100) / 100
    const received = entry.method === 'efectivo' ? Math.ceil(total / 10) * 10 : total

    return {
      id: `v${index + 1}${key === 'norte' ? '-n' : ''}`,
      folio: `${prefix}${String(35 + index).padStart(2, '0')}`,
      createdAt: hoursAgo(entry.hours),
      total,
      paymentMethod: entry.method,
      received,
      change: Math.round((received - total) * 100) / 100,
      itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
      lines,
    }
  })
}

function isSale(value: unknown): value is SaleRecord {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.folio === 'string' &&
    typeof item.createdAt === 'string' &&
    typeof item.total === 'number' &&
    Array.isArray(item.lines)
  )
}

function loadBranch(key: BranchKey): SaleRecord[] {
  try {
    const raw =
      window.localStorage.getItem(`${STORAGE_KEY}:${key}`) ??
      (key === 'centro' ? window.localStorage.getItem(STORAGE_KEY) : null)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every(isSale)) return parsed
    }
  } catch {
    // Historial de ejemplo si el almacenamiento no está disponible.
  }
  return seedFor(key)
}

const state = reactive<{ byBranch: Record<BranchKey, SaleRecord[]> }>({
  byBranch: { centro: loadBranch('centro'), norte: loadBranch('norte') },
})

/** Ventas activas; en «Todas» se concatenan ambas sucursales. */
export const sales = computed(() => {
  const list = isAllBranches.value
    ? [...state.byBranch.centro, ...state.byBranch.norte]
    : state.byBranch[branchId.value as BranchKey]
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})

/** Acceso por sucursal para que Caja pueda cuadrar sesiones de cualquiera de las dos. */
export function salesFor(key: BranchKey): SaleRecord[] {
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
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

/** Registra el cobro del POS. Devuelve el folio para que el recibo y Caja coincidan. */
export function registerSale(input: SaleInput): SaleRecord {
  const key = writableBranch()
  if (!key) throw new Error('No se puede registrar una venta desde todas las sucursales')

  const record: SaleRecord = { ...input, id: newId(), createdAt: new Date().toISOString() }
  state.byBranch[key].push(record)
  persist(key)
  return record
}

/** Anula un cobro conservando el registro original y su huella de auditoría. */
export function voidSale(id: string, stamp: ReversalStamp): SaleRecord | null {
  const key = writableBranch()
  if (!key) return null
  const sale = state.byBranch[key].find((item) => item.id === id)
  if (!sale || sale.reversal) return null
  sale.reversal = stamp
  persist(key)
  return sale
}
