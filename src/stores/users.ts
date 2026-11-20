import { computed, reactive, ref } from 'vue'

import { branchOptions, type BranchId, type BranchKey } from '@/config/branches'
import type { User, UserError, UserInput } from '@/types/user'

const STORAGE_KEY = 'estante.users.v1'
const SESSION_KEY = 'estante.session.v1'

function daysAgo(days: number) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

/** Cuentas de demostración. Las contraseñas son locales y no protegen datos reales. */
function seed(): User[] {
  return [
    {
      id: 'u1',
      name: 'María Ramos',
      email: 'admin@estante.local',
      password: 'admin123',
      role: 'superuser',
      branches: ['centro', 'norte'],
      active: true,
      createdAt: daysAgo(120),
    },
    {
      id: 'u2',
      name: 'Carlos Ruiz',
      email: 'centro@estante.local',
      password: 'centro123',
      role: 'branch',
      branches: ['centro'],
      active: true,
      createdAt: daysAgo(84),
    },
    {
      id: 'u3',
      name: 'Lucía Soto',
      email: 'norte@estante.local',
      password: 'norte123',
      role: 'branch',
      branches: ['norte'],
      active: true,
      createdAt: daysAgo(61),
    },
    {
      id: 'u4',
      name: 'Andrea Díaz',
      email: 'sucursales@estante.local',
      password: 'sucursales123',
      role: 'branch',
      branches: ['centro', 'norte'],
      active: true,
      createdAt: daysAgo(30),
    },
  ]
}

function isUser(value: unknown): value is User {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.email === 'string' &&
    typeof item.password === 'string' &&
    (item.role === 'superuser' || item.role === 'branch') &&
    Array.isArray(item.branches) &&
    item.branches.every((key) => key === 'centro' || key === 'norte') &&
    typeof item.active === 'boolean'
  )
}

function loadUsers(): User[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isUser)) return parsed
    }
  } catch {
    // Cuentas de ejemplo si el almacenamiento no está disponible.
  }
  return seed()
}

function loadSession(): string | null {
  try {
    return window.localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

const state = reactive<{ users: User[] }>({ users: loadUsers() })
const sessionId = ref<string | null>(loadSession())

export const users = computed(() =>
  [...state.users].sort((a, b) => a.name.localeCompare(b.name, 'es')),
)

/** La sesión caduca automáticamente si el usuario fue desactivado o eliminado. */
export const currentUser = computed(
  () => state.users.find((user) => user.id === sessionId.value && user.active) ?? null,
)

export const isSuperuser = computed(() => currentUser.value?.role === 'superuser')
export const canManageUsers = isSuperuser

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.users))
  } catch {
    // La sesión sigue funcionando en memoria.
  }
}

function persistSession() {
  try {
    if (sessionId.value) window.localStorage.setItem(SESSION_KEY, sessionId.value)
    else window.localStorage.removeItem(SESSION_KEY)
  } catch {
    // La sesión sigue activa en memoria.
  }
}

function activeSuperusers() {
  return state.users.filter((user) => user.role === 'superuser' && user.active)
}

/** Sucursales que el usuario activo puede ver; sin sesión no se restringe la navegación. */
export const allowedBranchIds = computed<BranchId[]>(() => {
  const user = currentUser.value
  if (!user) return branchOptions.map((option) => option.id)
  if (user.role === 'superuser' || user.branches.length > 1) {
    return branchOptions.map((option) => option.id)
  }
  return [...user.branches]
})

export const allowedBranchLabels = computed(() =>
  branchOptions
    .filter((option) => allowedBranchIds.value.includes(option.id))
    .map((option) => option.label),
)

export function canUseBranch(id: BranchId) {
  return allowedBranchIds.value.includes(id)
}

/** El agregado «Todas» nunca es escribible; las concretas dependen de los permisos. */
export function canWriteBranch(id: BranchId) {
  if (id === 'all') return false
  const user = currentUser.value
  if (!user) return true
  return user.role === 'superuser' || user.branches.includes(id as BranchKey)
}

export function login(email: string, password: string): UserError | null {
  const normalized = email.trim().toLowerCase()
  const found = state.users.find((user) => user.email.toLowerCase() === normalized)
  if (!found || !found.active || found.password !== password) return 'credenciales'
  sessionId.value = found.id
  persistSession()
  return null
}

export function logout() {
  sessionId.value = null
  persistSession()
}

export function findUser(id: string | null | undefined) {
  if (!id) return null
  return state.users.find((user) => user.id === id) ?? null
}

export function saveUser(
  input: UserInput,
  id: string | null = null,
): { user: User | null; error?: UserError } {
  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  if (!name) return { user: null, error: 'nombre' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { user: null, error: 'correo' }
  if (state.users.some((user) => user.email.toLowerCase() === email && user.id !== id)) {
    return { user: null, error: 'duplicado' }
  }

  const existing = id ? findUser(id) : null
  if (id && !existing) return { user: null, error: 'no-encontrado' }

  const password = input.password.trim() || existing?.password || ''
  if (!existing && password.length < 6) return { user: null, error: 'clave' }

  const role = input.role === 'superuser' ? 'superuser' : 'branch'
  const branches: BranchKey[] =
    role === 'superuser'
      ? ['centro', 'norte']
      : input.branches.filter((key): key is BranchKey => key === 'centro' || key === 'norte')
  if (role === 'branch' && branches.length === 0) return { user: null, error: 'sucursales' }

  const active = input.active
  if (existing && existing.id === sessionId.value && !active) {
    return { user: null, error: 'propio' }
  }
  if (
    existing &&
    existing.role === 'superuser' &&
    existing.active &&
    (role !== 'superuser' || !active) &&
    activeSuperusers().filter((user) => user.id !== existing.id).length === 0
  ) {
    return { user: null, error: 'ultimo-admin' }
  }

  if (existing) {
    Object.assign(existing, { name, email, password, role, branches, active })
    persist()
    return { user: existing }
  }

  const user: User = {
    id: `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    email,
    password,
    role,
    branches,
    active,
    createdAt: new Date().toISOString(),
  }
  state.users.push(user)
  persist()
  return { user }
}

export function removeUser(id: string): UserError | null {
  const index = state.users.findIndex((user) => user.id === id)
  if (index < 0) return 'no-encontrado'
  const found = state.users[index]!
  if (found.id === sessionId.value) return 'propio'
  if (found.role === 'superuser' && found.active && activeSuperusers().length === 1) {
    return 'ultimo-admin'
  }
  state.users.splice(index, 1)
  persist()
  return null
}

export const userErrorText: Record<UserError, string> = {
  nombre: 'Escribe el nombre del usuario.',
  correo: 'Escribe un correo válido.',
  clave: 'La contraseña debe tener al menos 6 caracteres.',
  sucursales: 'Selecciona al menos una sucursal.',
  duplicado: 'Ya existe un usuario con ese correo.',
  credenciales: 'Correo o contraseña incorrectos, o la cuenta está inactiva.',
  'no-encontrado': 'No pudimos encontrar el usuario.',
  'ultimo-admin': 'Debe existir al menos un superusuario activo.',
  propio: 'No puedes eliminar tu propia cuenta.',
}
