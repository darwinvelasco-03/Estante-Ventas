import type { CurrencyCode } from '@/config/currency'
import type { ReversalStamp } from '@/types/reversal'

export const expenseCategories = [
  'Servicios',
  'Renta',
  'Nómina',
  'Insumos',
  'Transporte',
  'Mantenimiento',
  'Publicidad',
  'Otros',
] as const

export type ExpenseCategory = (typeof expenseCategories)[number]
export type ExpenseStatus = 'pendiente' | 'pagado'
export type ExpensePaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia'

export interface Expense {
  id: string
  folio: string
  /** Fecha del gasto en ISO; el importe siempre está guardado en USD. */
  date: string
  category: ExpenseCategory
  supplierId: string | null
  supplierName: string
  concept: string
  amount: number
  /** Moneda de presentación del documento; no altera el importe base. */
  currency: CurrencyCode
  paymentMethod: ExpensePaymentMethod
  status: ExpenseStatus
  paidAt: string | null
  note: string
  createdAt: string
  /** Presente cuando el pago fue anulado; el gasto conserva su historial. */
  reversal?: ReversalStamp | null
}

export interface ExpenseInput {
  date: string
  category: ExpenseCategory
  supplierId: string | null
  concept: string
  amount: number
  currency: CurrencyCode
  paymentMethod: ExpensePaymentMethod
  status: ExpenseStatus
  note: string
}

export type ExpenseError =
  | 'concepto'
  | 'monto'
  | 'fecha'
  | 'no-encontrado'
  | 'pagado'
  | 'anulado'
