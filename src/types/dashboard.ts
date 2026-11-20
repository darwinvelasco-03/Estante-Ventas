export type MovementKind = 'venta' | 'compra' | 'gasto' | 'caja'

export interface Movement {
  id: string
  kind: MovementKind
  folio: string
  title: string
  detail: string
  amount: number
  time: string
  pending?: boolean
}

export interface LowStockItem {
  sku: string
  name: string
  remaining: number
  unit: string
  threshold: number
}

export interface DashboardSnapshot {
  branch: string
  dateLabel: string
  salesToday: number
  salesGoal: number
  salesDelta: number
  transactions: number
  averageTicket: number
  cashOnHand: number
  stockHealth: number
  trend: number[]
  movements: Movement[]
  lowStock: LowStockItem[]
}
