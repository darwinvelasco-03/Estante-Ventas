import type { BranchKey } from '@/config/branches'

/** Superusuario: ve el agregado y puede operar en cualquier sucursal. Branch: solo las asignadas. */
export type UserRole = 'superuser' | 'branch'

export interface User {
  id: string
  name: string
  /** Correo usado como identificador de acceso. */
  email: string
  /** Demo local: se guarda tal cual en localStorage. No reutilizar contraseñas reales. */
  password: string
  role: UserRole
  branches: BranchKey[]
  active: boolean
  createdAt: string
}

export type UserInput = Pick<User, 'name' | 'email' | 'password' | 'role' | 'branches' | 'active'>

export type UserError =
  | 'nombre'
  | 'correo'
  | 'clave'
  | 'sucursales'
  | 'duplicado'
  | 'credenciales'
  | 'no-encontrado'
  | 'ultimo-admin'
  | 'propio'
