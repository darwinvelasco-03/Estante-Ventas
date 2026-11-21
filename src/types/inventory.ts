import type { ReversalStamp } from '@/types/reversal'

export type MovementType = 'entrada' | 'salida' | 'conteo'

export interface StockMovement {
  id: string
  productId: string
  productName: string
  productSku: string
  type: MovementType
  /** Cambio real aplicado a la existencia: positivo entra, negativo sale. */
  delta: number
  reason: string
  note: string
  createdAt: string
  balance: number
  /** Presente cuando el movimiento fue anulado; se conserva con su contra-movimiento. */
  reversal?: ReversalStamp | null
}

export interface MovementInput {
  productId: string
  type: MovementType
  /** Entradas y salidas: cantidad a mover. Conteos: cantidad real contada. */
  quantity: number
  reason: string
  note: string
}

export type MovementError = 'producto' | 'cantidad' | 'sin-stock' | 'sin-cambio'
