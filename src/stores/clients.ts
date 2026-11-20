import { computed, reactive } from 'vue'

import type { BranchKey } from '@/config/branches'
import { branchId, isAllBranches, writableBranch } from '@/stores/branch'
import type { Client, ClientError, ClientInput } from '@/types/client'

const STORAGE_KEY = 'estante.clients.v1'

function daysAgo(days: number, hour = 12) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

function seedCentro(): Client[] {
  return [
    {
      id: 'c01',
      name: 'María Elena Ruiz',
      alias: 'La de la esquina',
      phone: '55 1234 5678',
      note: 'Pide pan de caja los viernes.',
      frequent: true,
      lastVisit: daysAgo(0, 18),
      createdAt: daysAgo(210),
    },
    {
      id: 'c02',
      name: 'José Luis Cordero',
      alias: 'Don Chuy',
      phone: '55 8765 4321',
      note: 'Siempre lleva café molido.',
      frequent: true,
      lastVisit: daysAgo(5, 10),
      createdAt: daysAgo(180),
    },
    {
      id: 'c03',
      name: 'Rosa María Tapia',
      alias: '',
      phone: '55 2244 8890',
      note: 'Paga al contado, gusta de fruta fresca.',
      frequent: false,
      lastVisit: daysAgo(12, 16),
      createdAt: daysAgo(120),
    },
    {
      id: 'c04',
      name: 'Carlos Alberto Vega',
      alias: 'Beto',
      phone: '55 6677 1122',
      note: '',
      frequent: false,
      lastVisit: daysAgo(21, 9),
      createdAt: daysAgo(96),
    },
    {
      id: 'c05',
      name: 'Sierra, José',
      alias: '',
      phone: '',
      note: 'Referido de Don Chuy. Traer identificación.',
      frequent: false,
      lastVisit: null,
      createdAt: daysAgo(8),
    },
    {
      id: 'c06',
      name: 'Lucía Fernanda Soto',
      alias: 'La del salón',
      phone: '55 3399 4455',
      note: 'Compra detergente y agua natural cada semana.',
      frequent: true,
      lastVisit: daysAgo(2, 17),
      createdAt: daysAgo(150),
    },
    {
      id: 'c07',
      name: 'Miguel Ángel Peña',
      alias: '',
      phone: '55 4411 7766',
      note: 'Solicita factura con RFC.',
      frequent: false,
      lastVisit: daysAgo(34, 11),
      createdAt: daysAgo(74),
    },
    {
      id: 'c08',
      name: 'Ana Bertha Molina',
      alias: 'La maestra',
      phone: '55 9988 3311',
      note: 'Le gusta que le aparten huevo.',
      frequent: true,
      lastVisit: daysAgo(1, 8),
      createdAt: daysAgo(200),
    },
  ]
}

/** Directorio propio de la sucursal Norte; tus clientes no se mezclan. */
function seedNorte(): Client[] {
  return [
    {
      id: 'c01-n',
      name: 'Nora Beltrán',
      alias: 'La del kiosco',
      phone: '55 1110 2233',
      note: 'Pide leche y pan al abrir.',
      frequent: true,
      lastVisit: daysAgo(0, 9),
      createdAt: daysAgo(160),
    },
    {
      id: 'c02-n',
      name: 'Ulises Ramos',
      alias: 'El ingeniero',
      phone: '55 2220 3344',
      note: 'Recoge pedidos los martes.',
      frequent: true,
      lastVisit: daysAgo(3, 13),
      createdAt: daysAgo(140),
    },
    {
      id: 'c03-n',
      name: 'Sofía Cárdenas',
      alias: '',
      phone: '55 3330 4455',
      note: 'Prefiere fruta de temporada.',
      frequent: false,
      lastVisit: daysAgo(9, 11),
      createdAt: daysAgo(88),
    },
    {
      id: 'c04-n',
      name: 'Fidel López',
      alias: 'Don Fidel',
      phone: '55 4440 5566',
      note: 'Siempre paga en efectivo.',
      frequent: true,
      lastVisit: daysAgo(1, 16),
      createdAt: daysAgo(120),
    },
    {
      id: 'c05-n',
      name: 'Karla Medina',
      alias: '',
      phone: '',
      note: 'Traer referencias antes de dar crédito.',
      frequent: false,
      lastVisit: null,
      createdAt: daysAgo(6),
    },
    {
      id: 'c06-n',
      name: 'Equipo de Obra Norte',
      alias: 'Pedidos de obra',
      phone: '55 6660 7788',
      note: 'Compra agua y refrescos por caja.',
      frequent: false,
      lastVisit: daysAgo(18, 8),
      createdAt: daysAgo(60),
    },
  ]
}

function seedFor(key: BranchKey): Client[] {
  return key === 'centro' ? seedCentro() : seedNorte()
}

function isClient(value: unknown): value is Client {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.createdAt === 'string' &&
    (item.lastVisit === null || typeof item.lastVisit === 'string')
  )
}

function loadBranch(key: BranchKey): Client[] {
  try {
    const raw =
      window.localStorage.getItem(`${STORAGE_KEY}:${key}`) ??
      (key === 'centro' ? window.localStorage.getItem(STORAGE_KEY) : null)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every(isClient)) return parsed
    }
  } catch {
    // Directorio de ejemplo si el almacenamiento no está disponible.
  }
  return seedFor(key)
}

const state = reactive<{ byBranch: Record<BranchKey, Client[]> }>({
  byBranch: { centro: loadBranch('centro'), norte: loadBranch('norte') },
})

function sort(list: Client[]) {
  return [...list].sort((a, b) => {
    if (!a.lastVisit && !b.lastVisit) return a.name.localeCompare(b.name)
    if (!a.lastVisit) return 1
    if (!b.lastVisit) return -1
    return b.lastVisit.localeCompare(a.lastVisit) || a.name.localeCompare(b.name)
  })
}

/** Directorio activo; en la vista agregada se concatenan ambos sin repetir identificadores. */
export const clients = computed(() =>
  sort(
    isAllBranches.value
      ? [...state.byBranch.centro, ...state.byBranch.norte]
      : state.byBranch[branchId.value as BranchKey],
  ),
)

export function findClient(id: string | null) {
  if (!id) return null
  return [...state.byBranch.centro, ...state.byBranch.norte].find((client) => client.id === id) ?? null
}

function findIn(key: BranchKey, id: string | null | undefined) {
  if (!id) return null
  return state.byBranch[key].find((client) => client.id === id) ?? null
}

function persist(key: BranchKey) {
  try {
    window.localStorage.setItem(`${STORAGE_KEY}:${key}`, JSON.stringify(state.byBranch[key]))
  } catch {
    // La sesión sigue funcionando en memoria.
  }
}

function newId() {
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function saveClient(
  input: ClientInput,
  id?: string | null,
): { client: Client | null; error?: ClientError } {
  const key = writableBranch()
  if (!key) return { client: null, error: 'nombre' }

  const name = input.name.trim()
  if (!name) return { client: null, error: 'nombre' }

  const phone = input.phone.trim()
  const digits = phone.replace(/\D/g, '')
  if (digits && digits.length !== 10) return { client: null, error: 'telefono' }

  const existing = findIn(key, id)
  if (id && !existing) return { client: null, error: 'nombre' }

  const client: Client = {
    id: existing?.id ?? newId(),
    name,
    alias: input.alias.trim(),
    phone,
    note: input.note.trim(),
    frequent: input.frequent,
    lastVisit: existing?.lastVisit ?? null,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  }

  if (existing) {
    Object.assign(existing, client)
  } else {
    state.byBranch[key].push(client)
  }
  persist(key)
  return { client }
}

export function removeClient(id: string) {
  const key = writableBranch()
  if (!key) return false
  const index = state.byBranch[key].findIndex((client) => client.id === id)
  if (index === -1) return false
  state.byBranch[key].splice(index, 1)
  persist(key)
  return true
}

/** Al cobrar una venta identificada, el directorio de esa sucursal registra la visita. */
export function registerVisit(id: string | null) {
  const key = writableBranch()
  if (!key) return
  const client = findIn(key, id)
  if (!client) return
  client.lastVisit = new Date().toISOString()
  persist(key)
}
