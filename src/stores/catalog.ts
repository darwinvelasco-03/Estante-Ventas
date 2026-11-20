import { computed, reactive } from 'vue'

import type { BranchKey } from '@/config/branches'
import { products as seed } from '@/data/productsMock'
import { branchId, isAllBranches, writableBranch } from '@/stores/branch'
import type { Product, ProductInput } from '@/types/pos'

const STORAGE_KEY = 'estante.catalog.v1'

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.sku === 'string' &&
    typeof item.price === 'number' &&
    typeof item.stock === 'number'
  )
}

/** Norte parte del mismo catálogo base, pero con precios, existencias e identificadores propios. */
function seedFor(key: BranchKey): Product[] {
  const base = seed.map((product) => ({ ...product }))
  if (key === 'centro') return base
  return base.map((product, index) => ({
    ...product,
    id: `${product.id}-n`,
    sku: `${product.sku}-N`,
    price: Math.round(product.price * 1.08 * 100) / 100,
    stock: Math.max(0, product.stock + ((index % 3) - 1) * 3),
  }))
}

function loadBranch(key: BranchKey): Product[] {
  try {
    // Los datos guardados antes de separar sucursales pertenecen a Centro.
    const raw =
      window.localStorage.getItem(`${STORAGE_KEY}:${key}`) ??
      (key === 'centro' ? window.localStorage.getItem(STORAGE_KEY) : null)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every(isProduct)) return parsed
    }
  } catch {
    // Catálogo de ejemplo si el almacenamiento no está disponible.
  }
  return seedFor(key)
}

const state = reactive<{ byBranch: Record<BranchKey, Product[]> }>({
  byBranch: { centro: loadBranch('centro'), norte: loadBranch('norte') },
})

function persist(key: BranchKey) {
  try {
    window.localStorage.setItem(`${STORAGE_KEY}:${key}`, JSON.stringify(state.byBranch[key]))
  } catch {
    // La sesión sigue funcionando en memoria.
  }
}

function allProducts(): Product[] {
  return [...state.byBranch.centro, ...state.byBranch.norte]
}

/** Catálogo activo; en «Todas las sucursales» se muestran ambos sin duplicar identificadores. */
export const catalogProducts = computed(() =>
  isAllBranches.value ? allProducts() : state.byBranch[branchId.value as BranchKey],
)

export function findProduct(id: string) {
  return allProducts().find((product) => product.id === id) ?? null
}

export function addProduct(input: ProductInput): Product | null {
  const key = writableBranch()
  if (!key) return null
  const product: Product = {
    ...input,
    id: `p-${key}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
  }
  state.byBranch[key].push(product)
  persist(key)
  return product
}

export function updateProduct(id: string, input: ProductInput) {
  const key = writableBranch()
  if (!key) return
  const product = state.byBranch[key].find((item) => item.id === id)
  if (!product) return
  Object.assign(product, input)
  persist(key)
}

export function setStock(id: string, stock: number) {
  const key = writableBranch()
  if (!key) return
  const product = state.byBranch[key].find((item) => item.id === id)
  if (!product) return
  product.stock = Math.max(0, Math.round(stock))
  persist(key)
}

export function removeProduct(id: string) {
  const key = writableBranch()
  if (!key) return
  const list = state.byBranch[key]
  const index = list.findIndex((product) => product.id === id)
  if (index === -1) return
  list.splice(index, 1)
  persist(key)
}
