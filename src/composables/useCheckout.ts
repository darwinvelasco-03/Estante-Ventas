import { computed, ref, type Ref } from 'vue'

import { branchId } from '@/stores/branch'
import { toUsd } from '@/stores/currency'
import { movements } from '@/stores/inventory'
import { sales } from '@/stores/sales'
import type { PaymentMethod, SaleResult } from '@/types/pos'

/**
 * Cada sucursal usa su propio rango de folios (V-20xx Centro, V-30xx Norte) y
 * continúa desde el último movimiento guardado, aunque se recargue la página.
 */
function nextFolio() {
  const base = branchId.value === 'norte' ? 3041 : 2041
  const last = sales.value.reduce((max, sale) => {
    const number = Number(sale.folio.replace(/\D/g, ''))
    return Number.isFinite(number) ? Math.max(max, number) : max
  }, base)
  // Los movimientos guardados antes del historial de ventas siguen contando.
  const fromMovements = movements.value.reduce((max, movement) => {
    const match = /^Folio (V-\d{4})$/.exec(movement.note ?? '')
    const number = match?.[1] ? Number(match[1].replace(/\D/g, '')) : 0
    return Number.isFinite(number) ? Math.max(max, number) : max
  }, base)
  return `V-${String(Math.max(last, fromMovements) + 1).padStart(4, '0')}`
}

export function useCheckout(total: Ref<number>) {
  const method = ref<PaymentMethod>('efectivo')
  const received = ref('')
  const lastSale = ref<SaleResult | null>(null)

  /** El efectivo se captura en la moneda activa; el total de la venta está en USD. */
  const receivedValue = computed(() => {
    const value = Number(received.value.replace(',', '.'))
    return Number.isFinite(value) && value > 0 ? toUsd(value) : 0
  })

  const change = computed(() =>
    method.value === 'efectivo' ? Math.max(0, receivedValue.value - total.value) : 0,
  )

  const shortfall = computed(() =>
    method.value === 'efectivo' && total.value > 0
      ? Math.max(0, total.value - receivedValue.value)
      : 0,
  )

  const canCharge = computed(() => total.value > 0 && shortfall.value === 0)

  function charge(itemCount: number): SaleResult | null {
    if (!canCharge.value) return null
    lastSale.value = {
      folio: nextFolio(),
      total: total.value,
      paymentMethod: method.value,
      received: receivedValue.value,
      change: change.value,
      itemCount,
    }
    return lastSale.value
  }

  function resetForNext() {
    method.value = 'efectivo'
    received.value = ''
  }

  function dismiss() {
    lastSale.value = null
  }

  return {
    method,
    received,
    receivedValue,
    change,
    shortfall,
    canCharge,
    lastSale,
    charge,
    resetForNext,
    dismiss,
  }
}
