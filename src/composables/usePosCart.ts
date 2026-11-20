import { computed, ref } from 'vue'

import type { Product, SaleLine } from '@/types/pos'

export interface HeldSale {
  lines: SaleLine[]
  discount: number
  customer: string
  clientId: string | null
}

export interface AddResult {
  ok: boolean
  reason?: 'sin-existencias' | 'sin-stock'
  remaining?: number
}

export function usePosCart() {
  const lines = ref<SaleLine[]>([])
  const discount = ref(0)
  const customer = ref('')
  const clientId = ref<string | null>(null)
  const heldSales = ref<HeldSale[]>([])

  const subtotal = computed(() =>
    lines.value.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
  )
  const total = computed(() => Math.max(0, subtotal.value - discount.value))
  const itemCount = computed(() => lines.value.reduce((sum, line) => sum + line.quantity, 0))
  const heldCount = computed(() => heldSales.value.length)

  function add(product: Product): AddResult {
    if (product.stock <= 0) return { ok: false, reason: 'sin-existencias', remaining: 0 }

    const existing = lines.value.find((line) => line.id === product.id)
    if (existing && existing.quantity >= existing.stock) {
      return { ok: false, reason: 'sin-stock', remaining: existing.stock }
    }

    if (existing) {
      existing.quantity += 1
    } else {
      lines.value.push({
        id: product.id,
        name: product.name,
        sku: product.sku,
        unitPrice: product.price,
        quantity: 1,
        stock: product.stock,
      })
    }
    return { ok: true }
  }

  function setQuantity(id: string, quantity: number) {
    const line = lines.value.find((item) => item.id === id)
    if (!line) return
    line.quantity = Math.min(line.stock, Math.max(1, Math.round(quantity) || 1))
  }

  function remove(id: string) {
    lines.value = lines.value.filter((line) => line.id !== id)
  }

  function clear() {
    lines.value = []
    discount.value = 0
    customer.value = ''
    clientId.value = null
  }

  function holdSale() {
    heldSales.value.push({
      lines: lines.value.map((line) => ({ ...line })),
      discount: discount.value,
      customer: customer.value,
      clientId: clientId.value,
    })
    clear()
  }

  function restoreHeld() {
    const held = heldSales.value.pop()
    if (!held) return
    lines.value = held.lines.map((line) => ({ ...line }))
    discount.value = held.discount
    customer.value = held.customer
    clientId.value = held.clientId
  }

  return {
    lines,
    discount,
    customer,
    clientId,
    subtotal,
    total,
    itemCount,
    heldSales,
    heldCount,
    add,
    setQuantity,
    remove,
    clear,
    holdSale,
    restoreHeld,
  }
}
