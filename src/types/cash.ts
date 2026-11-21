import type { BranchKey } from '@/config/branches'
import type { Expense } from '@/types/expense'
import type { Purchase } from '@/types/purchase'
import type { SaleRecord } from '@/types/sale'

export interface CashSession {
  id: string
  folio: string
  branch: BranchKey
  openedAt: string
  closedAt: string | null
  /** Fondo inicial en USD. */
  openingAmount: number
  /** Efectivo contado al cierre, en USD; null mientras la sesión sigue abierta. */
  countedCash: number | null
  note: string
  createdAt: string
}

export interface CashSessionEntry {
  session: CashSession
  summary: CashSummary
}

export interface CashSessionInput {
  openingAmount: number
  note: string
}

export interface CashCloseInput {
  countedCash: number
  note: string
}

export type CashError = 'abierta' | 'monto' | 'no-encontrado' | 'cerrada'

export interface CashSummary {
  sales: SaleRecord[]
  cashSales: number
  cardSales: number
  cashExpenses: Expense[]
  cashExpenseTotal: number
  otherExpenseTotal: number
  /** Órdenes de compra pagadas durante el turno, en cualquier forma de pago. */
  purchases: Purchase[]
  cashPurchases: Purchase[]
  otherPurchases: Purchase[]
  cashPurchaseTotal: number
  otherPurchaseTotal: number
  purchasesTotal: number
  expectedCash: number
  /** Contado menos esperado; null mientras no se haya cerrado la sesión. */
  difference: number | null
  salesTotal: number
  expensesTotal: number
}
