import { computed, reactive } from 'vue'

import type { BranchKey } from '@/config/branches'
import type { CurrencyCode } from '@/config/currency'
import { branchId, isAllBranches, writableBranch } from '@/stores/branch'
import { findProduct } from '@/stores/catalog'
import { registerMovement } from '@/stores/inventory'
import { findSupplier } from '@/stores/suppliers'
import type { PaymentMethod } from '@/types/pos'
import type { Purchase, PurchaseError, PurchaseInput, PurchaseLine, PurchaseStatus } from '@/types/purchase'
import type { ReversalStamp } from '@/types/reversal'

const STORAGE_KEY = 'estante.purchases.v1'

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function seed(): Purchase[] {
  return [
    {
      id: 'oc-0048',
      folio: 'OC-0048',
      supplierId: 's01',
      supplierName: 'Molinos del Valle',
      currency: 'USD',
      createdAt: daysAgo(2),
      receivedAt: null,
      paymentMethod: 'efectivo',
      paidAt: null,
      note: 'Reposición semanal. Confirmar precio de la harina.',
      lines: [
        { id: 'l01', productId: 'p01', name: 'Harina de trigo 1 kg', sku: 'HAR-001', unit: 'und', ordered: 20, received: 12, unitCost: 19.5 },
        { id: 'l02', productId: 'p03', name: 'Azúcar refinada 1 kg', sku: 'AZU-006', unit: 'und', ordered: 10, received: 0, unitCost: 22 },
        { id: 'l03', productId: 'p04', name: 'Frijol negro 1 kg', sku: 'FRI-003', unit: 'und', ordered: 8, received: 0, unitCost: 41 },
        { id: 'l04', productId: 'p20', name: 'Sal refinada 1 kg', sku: 'SAL-007', unit: 'und', ordered: 12, received: 0, unitCost: 11 },
      ],
    },
    {
      id: 'oc-0047',
      folio: 'OC-0047',
      supplierId: 's03',
      supplierName: 'Distribuidora San Marcos',
      currency: 'COP',
      createdAt: daysAgo(3),
      receivedAt: null,
      paymentMethod: 'efectivo',
      paidAt: hoursAgo(2),
      note: 'Pedido la noche anterior.',
      lines: [
        { id: 'l05', productId: 'p06', name: 'Leche entera 1 L', sku: 'LEC-011', unit: 'und', ordered: 24, received: 12, unitCost: 0.4625 },
        { id: 'l06', productId: 'p10', name: 'Mantequilla 200 g', sku: 'MAN-008', unit: 'und', ordered: 10, received: 0, unitCost: 0.8 },
      ],
    },
    {
      id: 'oc-0046',
      folio: 'OC-0046',
      supplierId: 's06',
      supplierName: 'Panadería La Esperanza',
      currency: 'CRC',
      createdAt: daysAgo(6),
      receivedAt: daysAgo(5),
      paymentMethod: 'efectivo',
      paidAt: daysAgo(5),
      note: 'Entrega diaria.',
      lines: [
        { id: 'l07', productId: 'p09', name: 'Pan de caja 500 g', sku: 'PAN-020', unit: 'und', ordered: 30, received: 30, unitCost: 2.9 },
        { id: 'l08', productId: 'p17', name: 'Galletas de sal, paquete', sku: 'GAL-018', unit: 'und', ordered: 16, received: 16, unitCost: 1.96 },
      ],
    },
    {
      id: 'oc-0045',
      folio: 'OC-0045',
      supplierId: 's02',
      supplierName: 'Bebidas La Fuente',
      currency: 'USD',
      createdAt: daysAgo(8),
      receivedAt: daysAgo(7),
      paymentMethod: 'tarjeta',
      paidAt: daysAgo(7),
      note: 'Maneja regreso de botella.',
      lines: [
        { id: 'l09', productId: 'p15', name: 'Agua natural 1 L', sku: 'AGU-023', unit: 'und', ordered: 40, received: 40, unitCost: 9.5 },
        { id: 'l10', productId: 'p16', name: 'Refresco 1.5 L', sku: 'REF-024', unit: 'und', ordered: 24, received: 24, unitCost: 21 },
      ],
    },
  ]
}

/** Norte usa folios 10xx para que el resumen agregado no repita folios. */
function seedFor(key: BranchKey): Purchase[] {
  const base = seed()
  if (key === 'centro') return base
  const supplierNames = [
    'Molinos Norte',
    'Lácteos del Valle Norte',
    'Panadería Boreal',
    'Aguas La Sierra',
  ]
  return base.map((purchase, index) => ({
    ...purchase,
    id: `${purchase.id}-n`,
    folio: purchase.folio.replace('OC-00', 'OC-10'),
    supplierId: `${purchase.supplierId}-n`,
    supplierName: supplierNames[index] ?? purchase.supplierName,
    lines: purchase.lines.map((line) => ({
      ...line,
      id: `${line.id}-n`,
      productId: `${line.productId}-n`,
      sku: `${line.sku}-N`,
      unitCost: Math.round(line.unitCost * 1.08 * 1e4) / 1e4,
    })),
  }))
}

function isPurchase(value: unknown): value is Purchase {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.folio === 'string' &&
    typeof item.createdAt === 'string' &&
    Array.isArray(item.lines)
  )
}

/** Las órdenes guardadas antes del pago se tratan como no pagadas. */
function normalize(value: Purchase): Purchase {
  return {
    ...value,
    paymentMethod: value.paymentMethod === 'tarjeta' ? 'tarjeta' : 'efectivo',
    paidAt: typeof value.paidAt === 'string' ? value.paidAt : null,
  }
}

function loadBranch(key: BranchKey): Purchase[] {
  try {
    const raw =
      window.localStorage.getItem(`${STORAGE_KEY}:${key}`) ??
      (key === 'centro' ? window.localStorage.getItem(STORAGE_KEY) : null)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every(isPurchase)) return parsed.map(normalize)
    }
  } catch {
    // Órdenes de ejemplo si el almacenamiento no está disponible.
  }
  return seedFor(key)
}

const state = reactive<{ byBranch: Record<BranchKey, Purchase[]> }>({
  byBranch: { centro: loadBranch('centro'), norte: loadBranch('norte') },
})

/** Órdenes activas, de la más reciente a la más antigua. */
export const purchases = computed(() => {
  const list = isAllBranches.value
    ? [...state.byBranch.centro, ...state.byBranch.norte]
    : state.byBranch[branchId.value as BranchKey]
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})

export function findPurchase(id: string | null) {
  if (!id) return null
  return [...state.byBranch.centro, ...state.byBranch.norte].find((purchase) => purchase.id === id) ?? null
}

/** Órdenes pagadas de una sucursal, para Caja y Reportes. */
export function paidPurchasesFor(key: BranchKey): Purchase[] {
  return state.byBranch[key].filter((purchase) => !!purchase.paidAt)
}

/** Acceso por sucursal para construir la bitácora unificada de Movimientos. */
export function purchasesFor(key: BranchKey): Purchase[] {
  return state.byBranch[key]
}

function findIn(key: BranchKey, id: string | null | undefined) {
  if (!id) return null
  return state.byBranch[key].find((purchase) => purchase.id === id) ?? null
}

export function purchaseStatus(purchase: Purchase): PurchaseStatus {
  return purchase.receivedAt ? 'recibida' : 'pendiente'
}

export function orderedTotal(purchase: Purchase) {
  return purchase.lines.reduce((sum, line) => sum + line.ordered * line.unitCost, 0)
}

export function receivedTotal(purchase: Purchase) {
  return purchase.lines.reduce((sum, line) => sum + line.received * line.unitCost, 0)
}

export function receivedLineCount(purchase: Purchase) {
  return purchase.lines.filter((line) => line.received >= line.ordered).length
}

function persist(key: BranchKey) {
  try {
    window.localStorage.setItem(`${STORAGE_KEY}:${key}`, JSON.stringify(state.byBranch[key]))
  } catch {
    // La sesión sigue funcionando en memoria.
  }
}

function nextFolio(key: BranchKey) {
  const last = state.byBranch[key].reduce((max, purchase) => {
    const number = Number(purchase.folio.replace(/\D/g, ''))
    return Number.isFinite(number) ? Math.max(max, number) : max
  }, 0)
  return `OC-${String(last + 1).padStart(4, '0')}`
}

function newId() {
  return `oc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function savePurchase(
  input: PurchaseInput,
  id?: string | null,
): { purchase: Purchase | null; error?: PurchaseError } {
  const key = writableBranch()
  if (!key) return { purchase: null, error: 'proveedor' }

  const supplier = input.supplierId ? findSupplier(input.supplierId) : null
  if (!supplier) return { purchase: null, error: 'proveedor' }
  if (!input.currency) return { purchase: null, error: 'proveedor' }
  if (input.lines.length === 0) return { purchase: null, error: 'renglones' }

  const existing = findIn(key, id)
  if (id && !existing) return { purchase: null, error: 'no-encontrado' }
  if (existing?.reversal) return { purchase: null, error: 'anulado' }
  if (existing?.receivedAt) return { purchase: null, error: 'recibida' }

  const lines: PurchaseLine[] = []
  for (const entry of input.lines) {
    const ordered = Math.round(entry.ordered)
    const unitCost = Number(entry.unitCost)
    if (!Number.isFinite(ordered) || ordered <= 0) return { purchase: null, error: 'cantidad' }
    if (!Number.isFinite(unitCost) || unitCost < 0) return { purchase: null, error: 'costo' }
    const product = findProduct(entry.productId)
    if (!product) return { purchase: null, error: 'cantidad' }
    const previous = existing?.lines.find((line) => line.productId === entry.productId)
    lines.push({
      id: previous?.id ?? `l-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      productId: product.id,
      name: product.name,
      sku: product.sku,
      unit: product.unit,
      ordered,
      received: previous?.received ?? 0,
      unitCost,
    })
  }

  const purchase: Purchase = {
    id: existing?.id ?? newId(),
    folio: existing?.folio ?? nextFolio(key),
    supplierId: supplier.id,
    supplierName: supplier.name,
    currency: input.currency as CurrencyCode,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    receivedAt: null,
    paymentMethod: input.paymentMethod,
    // Editar una orden pagada conserva la fecha original; desmarcarla la anula.
    paidAt: input.paid ? (existing?.paidAt ?? new Date().toISOString()) : null,
    note: input.note.trim(),
    lines,
  }

  if (existing) {
    Object.assign(existing, purchase)
  } else {
    state.byBranch[key].push(purchase)
  }
  persist(key)
  return { purchase }
}

/** Registra el cobro de una orden con la forma de pago ya capturada en ella. */
export function markPurchasePaid(
  id: string,
  paymentMethod?: PaymentMethod,
): { purchase: Purchase | null; error?: PurchaseError } {
  const key = writableBranch()
  if (!key) return { purchase: null, error: 'no-encontrado' }
  const purchase = findIn(key, id)
  if (!purchase) return { purchase: null, error: 'no-encontrado' }
  if (purchase.reversal) return { purchase: null, error: 'anulado' }
  if (purchase.paidAt) return { purchase: null, error: 'pagada' }
  purchase.paymentMethod = paymentMethod ?? purchase.paymentMethod
  purchase.paidAt = new Date().toISOString()
  persist(key)
  return { purchase }
}

export function receivePurchase(
  id: string,
  quantities: Record<string, number>,
): { purchase: Purchase | null; error?: PurchaseError; receivedLines: number; completed: boolean } {
  const key = writableBranch()
  if (!key) return { purchase: null, error: 'no-encontrado', receivedLines: 0, completed: false }
  const purchase = findIn(key, id)
  if (!purchase) return { purchase: null, error: 'no-encontrado', receivedLines: 0, completed: false }
  if (purchase.reversal) return { purchase: null, error: 'anulado', receivedLines: 0, completed: false }
  if (purchase.receivedAt) return { purchase: null, error: 'recibida', receivedLines: 0, completed: false }

  const pending = new Map<string, number>()
  for (const line of purchase.lines) {
    const requested = Math.round(quantities[line.id] ?? 0)
    const available = Math.max(0, line.ordered - line.received)
    const take = Math.min(Math.max(0, Number.isFinite(requested) ? requested : 0), available)
    if (take > 0) pending.set(line.id, take)
  }

  if (pending.size === 0) {
    return { purchase: null, error: 'cantidad', receivedLines: 0, completed: false }
  }

  const movements: { productId: string; quantity: number }[] = []
  for (const line of purchase.lines) {
    const take = pending.get(line.id) ?? 0
    if (take === 0) continue
    line.received += take
    movements.push({ productId: line.productId, quantity: take })
    registerMovement({
      productId: line.productId,
      type: 'entrada',
      quantity: take,
      reason: 'Compra',
      note: `Folio ${purchase.folio}`,
    })
  }

  const completed = purchase.lines.every((line) => line.received >= line.ordered)
  if (completed) purchase.receivedAt = new Date().toISOString()
  persist(key)
  return { purchase, receivedLines: movements.length, completed }
}

export function removePurchase(id: string) {
  const key = writableBranch()
  if (!key) return false
  const index = state.byBranch[key].findIndex((purchase) => purchase.id === id)
  if (index === -1 || state.byBranch[key][index]?.reversal) return false
  state.byBranch[key].splice(index, 1)
  persist(key)
  return true
}

/**
 * Anula el pago de una orden sin borrarla ni quitarle `paidAt`: conserva su
 * lugar en el periodo original y se compensa con un ajuste en la anulación.
 */
export function voidPurchasePayment(id: string, stamp: ReversalStamp): Purchase | null {
  const key = writableBranch()
  if (!key) return null
  const purchase = findIn(key, id)
  if (!purchase || purchase.reversal || !purchase.paidAt) return null
  purchase.reversal = stamp
  persist(key)
  return purchase
}
