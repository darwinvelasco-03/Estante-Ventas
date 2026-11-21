import type { CurrencyCode } from '@/config/currency'
import type { PaymentMethod } from '@/types/pos'

export type PurchaseStatus = 'pendiente' | 'recibida'

export interface PurchaseLine {
  id: string
  productId: string
  name: string
  sku: string
  unit: string
  ordered: number
  received: number
  /** Costo unitario de compra en USD (base), distinto del precio de etiqueta. */
  unitCost: number
}

export interface Purchase {
  id: string
  folio: string
  supplierId: string | null
  supplierName: string
  /** Moneda en que se presenta la orden; los importes se convierten desde USD. */
  currency: CurrencyCode
  createdAt: string
  receivedAt: string | null
  /** Forma en que se pagó la orden; solo aplica cuando paidAt no es null. */
  paymentMethod: PaymentMethod
  /** Fecha de cobro en ISO; null mientras la orden esté sin pagar. */
  paidAt: string | null
  note: string
  lines: PurchaseLine[]
}

export interface PurchaseLineInput {
  productId: string
  ordered: number
  unitCost: number
}

export interface PurchaseInput {
  supplierId: string | null
  currency: CurrencyCode
  paid: boolean
  paymentMethod: PaymentMethod
  note: string
  lines: PurchaseLineInput[]
}

export type PurchaseError =
  | 'proveedor'
  | 'renglones'
  | 'cantidad'
  | 'costo'
  | 'no-encontrado'
  | 'recibida'
  | 'pagada'
