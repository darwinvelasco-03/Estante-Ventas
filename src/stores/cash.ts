import { computed, reactive } from 'vue'

import type { BranchKey } from '@/config/branches'
import { branchId, isAllBranches, writableBranch } from '@/stores/branch'
import { expensesFor } from '@/stores/expenses'
import { orderedTotal, paidPurchasesFor } from '@/stores/purchases'
import { salesFor } from '@/stores/sales'
import type { CashCloseInput, CashError, CashSession, CashSessionInput, CashSummary } from '@/types/cash'

const STORAGE_KEY = 'estante.cash.v1'

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function seedFor(key: BranchKey): CashSession[] {
  const prefix = key === 'norte' ? 'CJ-10' : 'CJ-00'
  return [
    {
      id: `c1${key === 'norte' ? '-n' : ''}`,
      folio: `${prefix}01`,
      branch: key,
      openedAt: hoursAgo(52),
      closedAt: hoursAgo(34),
      openingAmount: key === 'norte' ? 180 : 120,
      countedCash: key === 'norte' ? 628.2 : 535,
      note: 'Cierre del turno anterior.',
      createdAt: hoursAgo(52),
    },
    {
      id: `c2${key === 'norte' ? '-n' : ''}`,
      folio: `${prefix}02`,
      branch: key,
      openedAt: hoursAgo(28),
      closedAt: hoursAgo(12),
      openingAmount: key === 'norte' ? 160 : 140,
      countedCash: key === 'norte' ? 1218.8 : 1120,
      note: '',
      createdAt: hoursAgo(28),
    },
    {
      id: `c3${key === 'norte' ? '-n' : ''}`,
      folio: `${prefix}03`,
      branch: key,
      openedAt: hoursAgo(4),
      closedAt: null,
      openingAmount: key === 'norte' ? 200 : 160,
      countedCash: null,
      note: 'Turno de la mañana.',
      createdAt: hoursAgo(4),
    },
  ]
}

function isSession(value: unknown): value is CashSession {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.folio === 'string' &&
    typeof item.openedAt === 'string' &&
    typeof item.openingAmount === 'number' &&
    (item.closedAt === null || typeof item.closedAt === 'string') &&
    (item.countedCash === null || typeof item.countedCash === 'number')
  )
}

function loadBranch(key: BranchKey): CashSession[] {
  try {
    const raw =
      window.localStorage.getItem(`${STORAGE_KEY}:${key}`) ??
      (key === 'centro' ? window.localStorage.getItem(STORAGE_KEY) : null)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every(isSession)) return parsed
    }
  } catch {
    // Sesiones de ejemplo si el almacenamiento no está disponible.
  }
  return seedFor(key)
}

const state = reactive<{ byBranch: Record<BranchKey, CashSession[]> }>({
  byBranch: { centro: loadBranch('centro'), norte: loadBranch('norte') },
})

export const sessions = computed(() => {
  const list = isAllBranches.value
    ? [...state.byBranch.centro, ...state.byBranch.norte]
    : state.byBranch[branchId.value as BranchKey]
  return [...list].sort((a, b) => b.openedAt.localeCompare(a.openedAt))
})

export const activeSessions = computed(() => sessions.value.filter((session) => !session.closedAt))
export const closedSessions = computed(() => sessions.value.filter((session) => !!session.closedAt))

export function findSession(id: string | null | undefined): CashSession | null {
  if (!id) return null
  return [...state.byBranch.centro, ...state.byBranch.norte].find((session) => session.id === id) ?? null
}

function persist(key: BranchKey) {
  try {
    window.localStorage.setItem(`${STORAGE_KEY}:${key}`, JSON.stringify(state.byBranch[key]))
  } catch {
    // La sesión sigue funcionando en memoria.
  }
}

function nextFolio(key: BranchKey) {
  const base = key === 'norte' ? 1000 : 0
  const last = state.byBranch[key].reduce((max, session) => {
    const number = Number(session.folio.replace(/\D/g, ''))
    return Number.isFinite(number) ? Math.max(max, number) : max
  }, base)
  return `CJ-${String(last + 1).padStart(4, '0')}`
}

function newId() {
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function openSession(input: CashSessionInput): {
  session: CashSession | null
  error?: CashError
} {
  const key = writableBranch()
  if (!key) return { session: null, error: 'no-encontrado' }
  if (activeSessions.value.some((session) => session.branch === key)) {
    return { session: null, error: 'abierta' }
  }
  if (!Number.isFinite(input.openingAmount) || input.openingAmount < 0) {
    return { session: null, error: 'monto' }
  }

  const now = new Date().toISOString()
  const session: CashSession = {
    id: newId(),
    folio: nextFolio(key),
    branch: key,
    openedAt: now,
    closedAt: null,
    openingAmount: input.openingAmount,
    countedCash: null,
    note: input.note.trim(),
    createdAt: now,
  }
  state.byBranch[key].push(session)
  persist(key)
  return { session }
}

export function closeSession(id: string, input: CashCloseInput): {
  session: CashSession | null
  error?: CashError
} {
  const key = writableBranch()
  if (!key) return { session: null, error: 'no-encontrado' }
  const session = state.byBranch[key].find((item) => item.id === id)
  if (!session) return { session: null, error: 'no-encontrado' }
  if (session.closedAt) return { session: null, error: 'cerrada' }
  if (!Number.isFinite(input.countedCash) || input.countedCash < 0) {
    return { session: null, error: 'monto' }
  }

  const note = input.note.trim()
  session.closedAt = new Date().toISOString()
  session.countedCash = input.countedCash
  session.note = [session.note, note].filter(Boolean).join(' · ')
  persist(key)
  return { session }
}

/**
 * Cuadre de una sesión: cuentan los cobros, los gastos pagados y las compras
 * pagadas ocurridos entre su apertura y su cierre (o ahora, si sigue abierta).
 * Solo las operaciones en efectivo afectan el efectivo esperado.
 */
export function sessionSummary(session: CashSession): CashSummary {
  const end = session.closedAt ?? new Date().toISOString()
  const inRange = (date: string | null) =>
    !!date && date >= session.openedAt && date <= end

  const sales = salesFor(session.branch).filter((sale) => inRange(sale.createdAt))
  const expenses = expensesFor(session.branch).filter(
    (expense) => expense.status === 'pagado' && inRange(expense.paidAt),
  )
  const purchases = paidPurchasesFor(session.branch).filter((purchase) => inRange(purchase.paidAt))
  const cashSales = sales.filter((sale) => sale.paymentMethod === 'efectivo')
  const cardSales = sales.filter((sale) => sale.paymentMethod === 'tarjeta')
  const cashExpenses = expenses.filter((expense) => expense.paymentMethod === 'efectivo')
  const otherExpenses = expenses.filter((expense) => expense.paymentMethod !== 'efectivo')
  const cashPurchases = purchases.filter((purchase) => purchase.paymentMethod === 'efectivo')
  const otherPurchases = purchases.filter((purchase) => purchase.paymentMethod !== 'efectivo')

  const total = (list: { amount?: number; total?: number }[]) =>
    list.reduce((sum, item) => sum + (item.amount ?? item.total ?? 0), 0)
  const purchaseTotal = (list: typeof purchases) =>
    list.reduce((sum, purchase) => sum + orderedTotal(purchase), 0)

  const cashSalesTotal = total(cashSales)
  const cardSalesTotal = total(cardSales)
  const cashExpenseTotal = total(cashExpenses)
  const otherExpenseTotal = total(otherExpenses)
  const cashPurchaseTotal = purchaseTotal(cashPurchases)
  const otherPurchaseTotal = purchaseTotal(otherPurchases)
  const expectedCash =
    session.openingAmount + cashSalesTotal - cashExpenseTotal - cashPurchaseTotal

  return {
    sales,
    cashSales: cashSalesTotal,
    cardSales: cardSalesTotal,
    cashExpenses,
    cashExpenseTotal,
    otherExpenseTotal,
    purchases,
    cashPurchases,
    otherPurchases,
    cashPurchaseTotal,
    otherPurchaseTotal,
    purchasesTotal: cashPurchaseTotal + otherPurchaseTotal,
    expectedCash,
    difference: session.countedCash === null ? null : session.countedCash - expectedCash,
    salesTotal: cashSalesTotal + cardSalesTotal,
    expensesTotal: cashExpenseTotal + otherExpenseTotal,
  }
}
