export interface Client {
  id: string
  name: string
  alias: string
  phone: string
  note: string
  frequent: boolean
  /** Fecha ISO de la última compra; null si todavía no se registra una visita. */
  lastVisit: string | null
  createdAt: string
}

export type ClientInput = Pick<Client, 'name' | 'alias' | 'phone' | 'note' | 'frequent'>

export type ClientError = 'nombre' | 'telefono'
