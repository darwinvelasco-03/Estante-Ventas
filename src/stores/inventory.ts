import { computed, reactive } from 'vue'

import type { BranchKey } from '@/config/branches'
import { branchId, isAllBranches, writableBranch } from '@/stores/branch'
import { catalogProducts, setStock } from '@/stores/catalog'
import type { MovementError, MovementInput, StockMovement } from '@/types/inventory'

const STORAGE_KEY = 'estante.inventory.v1'

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function seed(): StockMovement[] {
  return [
    { id: 'm01', productId: 'p01', productName: 'Harina de trigo 1 kg', productSku: 'HAR-001', type: 'entrada', delta: 20, reason: 'Compra', note: 'Pedido semanal', createdAt: hoursAgo(72), balance: 20 },
    { id: 'm02', productId: 'p02', productName: 'Aceite vegetal 1 L', productSku: 'ACE-014', type: 'entrada', delta: 12, reason: 'Compra', note: '', createdAt: hoursAgo(48), balance: 12 },
    { id: 'm03', productId: 'p18', productName: 'Detergente líquido 1 L', productSku: 'DET-025', type: 'salida', delta: -2, reason: 'Merma', note: 'Fuga en anaquel', createdAt: hoursAgo(46), balance: 3 },
    { id: 'm04', productId: 'p10', productName: 'Mantequilla 200 g', productSku: 'MAN-008', type: 'conteo', delta: -1, reason: 'Conteo físico', note: 'Conteo de cierre', createdAt: hoursAgo(26), balance: 5 },
    { id: 'm05', productId: 'p14', productName: 'Papaya, pieza', productSku: 'PAPA-030', type: 'salida', delta: -2, reason: 'Merma', note: 'Maduración', createdAt: hoursAgo(25), balance: 4 },
    { id: 'm06', productId: 'p01', productName: 'Harina de trigo 1 kg', productSku: 'HAR-001', type: 'entrada', delta: 4, reason: 'Compra', note: 'Reposición', createdAt: hoursAgo(2), balance: 24 },
    { id: 'm07', productId: 'p02', productName: 'Aceite vegetal 1 L', productSku: 'ACE-014', type: 'salida', delta: -1, reason: 'Merma', note: 'Botella rota', createdAt: hoursAgo(1.5), balance: 11 },
    { id: 'm08', productId: 'p15', productName: 'Agua natural 1 L', productSku: 'AGU-023', type: 'entrada', delta: 40, reason: 'Compra', note: 'Camión proveedor', createdAt: hoursAgo(1), balance: 40 },
  ]
}

/** La bitácora de Norte apunta a sus propios productos, con SKU propio. */
function seedFor(key: BranchKey): StockMovement[] {
  const base = seed()
  if (key === 'centro') return base
  return base.map((movement) => ({
    ...movement,
    id: `${movement.id}-n`,
    productId: `${movement.productId}-n`,
    productSku: `${movement.productSku}-N`,
    note: movement.note ? `${movement.note} · Norte` : 'Sucursal Norte',
  }))
}

function isMovement(value: unknown): value is StockMovement {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.productId === 'string' &&
    typeof item.delta === 'number' &&
    typeof item.balance === 'number' &&
    typeof item.createdAt === 'string'
  )
}

function loadBranch(key: BranchKey): StockMovement[] {
  try {
    const raw =
      window.localStorage.getItem(`${STORAGE_KEY}:${key}`) ??
      (key === 'centro' ? window.localStorage.getItem(STORAGE_KEY) : null)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every(isMovement)) return parsed
    }
  } catch {
    // Bitácora de ejemplo si el almacenamiento no está disponible.
  }
  return seedFor(key)
}

const state = reactive<{ byBranch: Record<BranchKey, StockMovement[]> }>({
  byBranch: { centro: loadBranch('centro'), norte: loadBranch('norte') },
})

/** Bitácora activa, de la más reciente a la más antigua. */
export const movements = computed(() => {
  const list = isAllBranches.value
    ? [...state.byBranch.centro, ...state.byBranch.norte]
    : state.byBranch[branchId.value as BranchKey]
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})

function persist(key: BranchKey) {
  try {
    window.localStorage.setItem(`${STORAGE_KEY}:${key}`, JSON.stringify(state.byBranch[key]))
  } catch {
    // La sesión sigue funcionando en memoria.
  }
}

function append(entries: StockMovement[]) {
  const key = writableBranch()
  if (!key || entries.length === 0) return
  state.byBranch[key].push(...entries)
  persist(key)
}

function newId() {
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function registerMovement(
  input: MovementInput,
): { movement: StockMovement | null; error?: MovementError } {
  const key = writableBranch()
  if (!key) return { movement: null, error: 'producto' }
  const product = catalogProducts.value.find((item) => item.id === input.productId)
  if (!product) return { movement: null, error: 'producto' }

  const quantity = Math.round(input.quantity)
  if (!Number.isFinite(quantity) || quantity < 0 || (input.type !== 'conteo' && quantity === 0)) {
    return { movement: null, error: 'cantidad' }
  }

  let delta: number
  if (input.type === 'entrada') {
    delta = quantity
  } else if (input.type === 'salida') {
    if (quantity > product.stock) return { movement: null, error: 'sin-stock' }
    delta = -quantity
  } else {
    delta = quantity - product.stock
    if (delta === 0) return { movement: null, error: 'sin-cambio' }
  }

  const previousStock = product.stock
  const balance = Math.max(0, previousStock + delta)
  setStock(product.id, balance)

  const movement: StockMovement = {
    id: newId(),
    productId: product.id,
    productName: product.name,
    productSku: product.sku,
    type: input.type,
    delta: balance - previousStock,
    reason: input.reason,
    note: input.note,
    createdAt: new Date().toISOString(),
    balance,
  }
  append([movement])
  return { movement }
}

/** Cada línea cobrada genera una salida con el folio de la venta. */
export function registerSale(lines: { productId: string; quantity: number }[], folio: string) {
  const key = writableBranch()
  if (!key) return []
  const created: StockMovement[] = []
  const createdAt = new Date().toISOString()

  for (const line of lines) {
    const product = catalogProducts.value.find((item) => item.id === line.productId)
    if (!product) continue
    const taken = Math.min(Math.max(0, Math.round(line.quantity)), product.stock)
    if (taken === 0) continue
    const balance = product.stock - taken
    setStock(product.id, balance)
    created.push({
      id: newId(),
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      type: 'salida',
      delta: -taken,
      reason: 'Venta',
      note: `Folio ${folio}`,
      createdAt,
      balance,
    })
  }
  append(created)
  return created
}
