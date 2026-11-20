import type { PaymentMethod } from '@/types/pos'

export interface SaleLineRecord {
  productId: string
  name: string
  sku: string
  quantity: number
  /** Precio unitario en USD al momento de la venta. */
  unitPrice: number
  total: number
}

export interface SaleRecord {
  id: string
  folio: string
  /** Fecha de cobro en ISO; todos los importes están guardados en USD. */
  createdAt: string
  total: number
  paymentMethod: PaymentMethod
  received: number
  change: number
  itemCount: number
  lines: SaleLineRecord[]
}

export interface SaleInput {
  folio: string
  total: number
  paymentMethod: PaymentMethod
  received: number
  change: number
  itemCount: number
  lines: SaleLineRecord[]
}
