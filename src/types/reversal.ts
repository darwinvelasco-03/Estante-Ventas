import type { BranchKey } from '@/config/branches'
import type { CurrencyCode } from '@/config/currency'
import type { ExpenseCategory } from '@/types/expense'

/** Huella de auditoría que se conserva en el documento original; nunca se borra. */
export interface ReversalStamp {
  reversedAt: string
  reason: string
  by: string
}

export type ReversalCategory = 'venta' | 'gasto' | 'compra'

/**
 * Compensación creada al anular un documento. El original sigue contando en su
 * periodo y el ajuste descuenta el mismo importe en la fecha de la anulación.
 * Así no se reescriben cierres ni reportes ya emitidos.
 */
export interface ReversalAdjustment {
  id: string
  sourceId: string
  folio: string
  branch: BranchKey
  /** Fecha de la anulación; Reportes lo contabiliza aquí. */
  createdAt: string
  /** Turno abierto en ese momento; null si no había una sesión abierta. */
  sessionId: string | null
  category: ReversalCategory
  /** Importe positivo en USD que se descuenta. */
  amount: number
  /** Forma de pago original, para restar del mismo rubro en Caja y Reportes. */
  paymentMethod: string | null
  /** Categoría original del gasto, para mantener el desglose consistente. */
  expenseCategory?: ExpenseCategory
  /** Proveedor original de la compra, para mantener el desglose consistente. */
  supplierName?: string
  reason: string
}

export type LedgerKind = 'venta' | 'inventario' | 'compra' | 'gasto'

/** Fila unificada de la bitácora de Movimientos. */
export interface LedgerEntry {
  id: string
  kind: LedgerKind
  sourceId: string
  branch: BranchKey
  folio: string
  date: string
  title: string
  detail: string
  /** Importe en USD; null en movimientos de inventario porque no son dinero. */
  amount: number | null
  currency?: CurrencyCode
  paymentMethod?: string
  reversal: ReversalStamp | null
}
