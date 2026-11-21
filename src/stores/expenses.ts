import { computed, reactive } from 'vue'

import type { BranchKey } from '@/config/branches'
import type { CurrencyCode } from '@/config/currency'
import { branchId, isAllBranches, writableBranch } from '@/stores/branch'
import { findSupplier } from '@/stores/suppliers'
import type { ReversalStamp } from '@/types/reversal'
import type {
  Expense,
  ExpenseCategory,
  ExpenseError,
  ExpenseInput,
  ExpensePaymentMethod,
} from '@/types/expense'

const STORAGE_KEY = 'estante.expenses.v1'

function daysAgo(days: number, hour = 12) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function seed(): Expense[] {
  return [
    {
      id: 'g01',
      folio: 'G-0081',
      date: daysAgo(1),
      category: 'Renta',
      supplierId: null,
      supplierName: '',
      concept: 'Renta del local',
      amount: 850,
      currency: 'USD',
      paymentMethod: 'transferencia',
      status: 'pagado',
      paidAt: daysAgo(1, 9),
      note: 'Depósito del mes.',
      createdAt: daysAgo(2),
    },
    {
      id: 'g02',
      folio: 'G-0082',
      date: daysAgo(2),
      category: 'Servicios',
      supplierId: null,
      supplierName: '',
      concept: 'Luz y agua',
      amount: 310,
      currency: 'COP',
      paymentMethod: 'transferencia',
      status: 'pagado',
      paidAt: daysAgo(2, 16),
      note: 'Recibo del bimestre.',
      createdAt: daysAgo(3),
    },
    {
      id: 'g03',
      folio: 'G-0083',
      date: daysAgo(3),
      category: 'Insumos',
      supplierId: 's05',
      supplierName: 'Papelería y Limpieza Azteca',
      concept: 'Bolsas y papel de empaque',
      amount: 185,
      currency: 'USD',
      paymentMethod: 'tarjeta',
      status: 'pendiente',
      paidAt: null,
      note: 'Pagar antes del viernes.',
      createdAt: daysAgo(4),
    },
    {
      id: 'g04',
      folio: 'G-0084',
      date: daysAgo(5),
      category: 'Nómina',
      supplierId: null,
      supplierName: '',
      concept: 'Sueldos quincenales',
      amount: 1240,
      currency: 'USD',
      paymentMethod: 'transferencia',
      status: 'pagado',
      paidAt: daysAgo(5, 18),
      note: 'Quincena del personal de mostrador.',
      createdAt: daysAgo(6),
    },
    {
      id: 'g05',
      folio: 'G-0085',
      date: daysAgo(7),
      category: 'Transporte',
      supplierId: 's07',
      supplierName: 'Comercial del Centro',
      concept: 'Flete de mercancía',
      amount: 96,
      currency: 'CRC',
      paymentMethod: 'efectivo',
      status: 'pagado',
      paidAt: hoursAgo(2),
      note: 'Pagado en efectivo desde la caja actual.',
      createdAt: daysAgo(8),
    },
    {
      id: 'g06',
      folio: 'G-0086',
      date: daysAgo(9),
      category: 'Mantenimiento',
      supplierId: null,
      supplierName: '',
      concept: 'Reparación del refrigerador',
      amount: 240,
      currency: 'USD',
      paymentMethod: 'tarjeta',
      status: 'pendiente',
      paidAt: null,
      note: 'Esperar factura del técnico.',
      createdAt: daysAgo(10),
    },
  ]
}

/** Norte usa folios G-10xx y conceptos propios para no repetir los del agregado. */
function seedFor(key: BranchKey): Expense[] {
  const base = seed()
  if (key === 'centro') return base
  const suppliers: Record<string, { id: string; name: string }> = {
    s05: { id: 's05-n', name: 'Limpieza Nova' },
    s07: { id: 's02-n', name: 'Aguas La Sierra' },
  }
  return base.map((expense) => {
    const supplier = expense.supplierId ? suppliers[expense.supplierId] : undefined
    return {
      ...expense,
      id: `${expense.id}-n`,
      folio: expense.folio.replace('G-00', 'G-10'),
      date: daysAgo(Number(expense.id.slice(1)) + 1),
      category: (expense.category === 'Renta' ? 'Servicios' : expense.category) as ExpenseCategory,
      supplierId: supplier?.id ?? null,
      supplierName: supplier?.name ?? '',
      concept: expense.concept === 'Renta del local' ? 'Renta de la bodega norte' : expense.concept,
      amount: Math.round(expense.amount * 1.08 * 1e4) / 1e4,
      paidAt: expense.paidAt,
      createdAt: daysAgo(Number(expense.id.slice(1)) + 2),
    }
  })
}

function isExpense(value: unknown): value is Expense {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.folio === 'string' &&
    typeof item.date === 'string' &&
    typeof item.amount === 'number' &&
    typeof item.concept === 'string' &&
    (item.paidAt === null || typeof item.paidAt === 'string')
  )
}

function loadBranch(key: BranchKey): Expense[] {
  try {
    const raw =
      window.localStorage.getItem(`${STORAGE_KEY}:${key}`) ??
      (key === 'centro' ? window.localStorage.getItem(STORAGE_KEY) : null)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every(isExpense)) return parsed
    }
  } catch {
    // Catálogo de ejemplo si el almacenamiento no está disponible.
  }
  return seedFor(key)
}

const state = reactive<{ byBranch: Record<BranchKey, Expense[]> }>({
  byBranch: { centro: loadBranch('centro'), norte: loadBranch('norte') },
})

/** Gastos activos; en «Todas» se concatenan ambos catálogos. */
export const expenses = computed(() => {
  const list = isAllBranches.value
    ? [...state.byBranch.centro, ...state.byBranch.norte]
    : state.byBranch[branchId.value as BranchKey]
  return [...list].sort((a, b) => b.date.localeCompare(a.date))
})

/** Acceso por sucursal para que Caja pueda cuadrar sesiones de cualquiera de las dos. */
export function expensesFor(key: BranchKey): Expense[] {
  return state.byBranch[key]
}

export function findExpense(id: string | null | undefined) {
  if (!id) return null
  return [...state.byBranch.centro, ...state.byBranch.norte].find((expense) => expense.id === id) ?? null
}

function findIn(key: BranchKey, id: string | null | undefined) {
  if (!id) return null
  return state.byBranch[key].find((expense) => expense.id === id) ?? null
}

export function paidTotal(list: Expense[]) {
  return list.reduce((sum, expense) => sum + (expense.status === 'pagado' ? expense.amount : 0), 0)
}

export function pendingTotal(list: Expense[]) {
  return list.reduce((sum, expense) => sum + (expense.status === 'pendiente' ? expense.amount : 0), 0)
}

function persist(key: BranchKey) {
  try {
    window.localStorage.setItem(`${STORAGE_KEY}:${key}`, JSON.stringify(state.byBranch[key]))
  } catch {
    // La sesión sigue funcionando en memoria.
  }
}

function nextFolio(key: BranchKey) {
  const last = state.byBranch[key].reduce((max, expense) => {
    const number = Number(expense.folio.replace(/\D/g, ''))
    return Number.isFinite(number) ? Math.max(max, number) : max
  }, key === 'norte' ? 1080 : 80)
  return `G-${String(last + 1).padStart(4, '0')}`
}

function newId() {
  return `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

function toIsoDate(date: string) {
  return new Date(`${date}T12:00:00`).toISOString()
}

export function saveExpense(
  input: ExpenseInput,
  id?: string | null,
): { expense: Expense | null; error?: ExpenseError } {
  const key = writableBranch()
  if (!key) return { expense: null, error: 'no-encontrado' }

  const concept = input.concept.trim()
  if (!concept) return { expense: null, error: 'concepto' }
  if (!Number.isFinite(input.amount) || input.amount <= 0) return { expense: null, error: 'monto' }
  if (!input.date || !Number.isFinite(new Date(input.date).getTime())) {
    return { expense: null, error: 'fecha' }
  }

  const existing = findIn(key, id)
  if (id && !existing) return { expense: null, error: 'no-encontrado' }
  if (existing?.reversal) return { expense: null, error: 'anulado' }
  if (existing?.status === 'pagado') return { expense: null, error: 'pagado' }

  const supplier = input.supplierId ? findSupplier(input.supplierId) : null
  const now = new Date().toISOString()
  const becomingPaid = input.status === 'pagado'

  const expense: Expense = {
    id: existing?.id ?? newId(),
    folio: existing?.folio ?? nextFolio(key),
    date: toIsoDate(input.date),
    category: input.category,
    supplierId: supplier?.id ?? null,
    supplierName: supplier?.name ?? '',
    concept,
    amount: input.amount,
    currency: input.currency as CurrencyCode,
    paymentMethod: input.paymentMethod as ExpensePaymentMethod,
    status: input.status,
    paidAt: becomingPaid ? (existing?.paidAt ?? now) : null,
    note: input.note.trim(),
    createdAt: existing?.createdAt ?? now,
  }

  if (existing) {
    Object.assign(existing, expense)
  } else {
    state.byBranch[key].push(expense)
  }
  persist(key)
  return { expense }
}

/** Marca un gasto pendiente como pagado; Caja y Reportes lo reflejan de inmediato. */
export function payExpense(
  id: string,
  paymentMethod?: ExpensePaymentMethod,
): { expense: Expense | null; error?: ExpenseError } {
  const key = writableBranch()
  if (!key) return { expense: null, error: 'no-encontrado' }
  const expense = findIn(key, id)
  if (!expense) return { expense: null, error: 'no-encontrado' }
  if (expense.reversal) return { expense: null, error: 'anulado' }
  if (expense.status === 'pagado') return { expense: null, error: 'pagado' }

  expense.status = 'pagado'
  expense.paidAt = new Date().toISOString()
  if (paymentMethod) expense.paymentMethod = paymentMethod
  persist(key)
  return { expense }
}

export function removeExpense(id: string) {
  const key = writableBranch()
  if (!key) return false
  const index = state.byBranch[key].findIndex((expense) => expense.id === id)
  if (index === -1 || state.byBranch[key][index]?.reversal) return false
  state.byBranch[key].splice(index, 1)
  persist(key)
  return true
}

/**
 * Anula el pago de un gasto sin borrarlo ni cambiar su estado: el documento
 * sigue contando en su periodo y el ajuste negativo compensa en la anulación.
 */
export function voidExpensePayment(id: string, stamp: ReversalStamp): Expense | null {
  const key = writableBranch()
  if (!key) return null
  const expense = findIn(key, id)
  if (!expense || expense.reversal || expense.status !== 'pagado') return null
  expense.reversal = stamp
  persist(key)
  return expense
}
