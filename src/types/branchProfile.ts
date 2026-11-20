import type { BranchKey } from '@/config/branches'

/** Ficha editable de una sucursal. El identificador y el nombre los fija la configuración. */
export interface BranchProfile {
  id: BranchKey
  code: string
  name: string
  street: string
  city: string
  phone: string
  email: string
  manager: string
  schedule: string
  status: 'operativa' | 'pausa'
  note: string
}

export type BranchProfileInput = Pick<
  BranchProfile,
  'street' | 'city' | 'phone' | 'email' | 'manager' | 'schedule' | 'status' | 'note'
>

export type BranchProfileError = 'direccion' | 'responsable'
