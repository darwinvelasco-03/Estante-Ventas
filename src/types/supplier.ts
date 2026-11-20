export interface Supplier {
  id: string
  /** Razón social, tal como aparece en la tarjeta del proveedor. */
  name: string
  contact: string
  phone: string
  /** Línea de productos que surte, en texto libre. */
  line: string
  /** Días de entrega: 1 = lunes … 7 = domingo. */
  deliveryDays: number[]
  /** Pedido mínimo en USD (base); 0 significa que no hay mínimo. */
  minimum: number
  paymentTerms: string
  note: string
  createdAt: string
}

export type SupplierInput = Pick<
  Supplier,
  'name' | 'contact' | 'phone' | 'line' | 'deliveryDays' | 'minimum' | 'paymentTerms' | 'note'
>

export type SupplierError = 'nombre' | 'telefono' | 'minimo'
