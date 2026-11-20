export interface Product {
  id: string
  barcode: string
  sku: string
  name: string
  price: number
  stock: number
  unit: string
  category: string
}

export type ProductInput = Omit<Product, 'id'>

export interface SaleLine {
  id: string
  name: string
  sku: string
  unitPrice: number
  quantity: number
  stock: number
}

export type PaymentMethod = 'efectivo' | 'tarjeta'

export interface SaleResult {
  folio: string
  total: number
  paymentMethod: PaymentMethod
  received: number
  change: number
  itemCount: number
}
