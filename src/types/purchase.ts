import type { CurrencyCode } from '@/config/currency'

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
  note: string
  lines: PurchaseLineInput[]
}

export type PurchaseError = 'proveedor' | 'renglones' | 'cantidad' | 'costo' | 'no-encontrado' | 'recibida'
