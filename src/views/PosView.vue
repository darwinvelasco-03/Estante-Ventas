<script setup lang="ts">
import { computed, ref } from 'vue'

import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import CurrencyText from '@/components/ui/CurrencyText.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import SuccessReceipt from '@/components/ui/SuccessReceipt.vue'
import { useCheckout } from '@/composables/useCheckout'
import { usePosCart } from '@/composables/usePosCart'
import { useProductLookup } from '@/composables/useProductLookup'
import { isAllBranches } from '@/stores/branch'
import { clients, registerVisit } from '@/stores/clients'
import { registerSale } from '@/stores/inventory'
import { registerSale as registerSaleRecord } from '@/stores/sales'
import type { Product } from '@/types/pos'
import PaymentPanel from '@/components/pos/PaymentPanel.vue'
import ProductScanner from '@/components/pos/ProductScanner.vue'
import SaleActions from '@/components/pos/SaleActions.vue'
import SaleTicket from '@/components/pos/SaleTicket.vue'

const props = defineProps<{ branch: string }>()

const { query, results, loading, error, search, clear: clearLookup } = useProductLookup()
const {
  lines,
  customer,
  clientId,
  subtotal,
  discount,
  total,
  itemCount,
  heldCount,
  add,
  setQuantity,
  remove,
  clear: clearCart,
  holdSale,
  restoreHeld,
} = usePosCart()
const {
  method,
  received,
  change,
  shortfall,
  canCharge,
  lastSale,
  charge,
  resetForNext,
  dismiss,
} = useCheckout(total)

const scanner = ref<{ focus: () => void } | null>(null)
const notice = ref<{ text: string; tone: 'ok' | 'error' } | null>(null)
const cancelOpen = ref(false)

/** La vista agregada no descuenta stock: solo se cobra desde una sucursal concreta. */
const chargeAvailable = computed(() => !isAllBranches.value && canCharge.value)

function onSelect(product: Product) {
  if (isAllBranches.value) {
    notice.value = {
      text: 'Selecciona una sucursal concreta para iniciar una venta.',
      tone: 'error',
    }
    return
  }
  const result = add(product)
  if (!result.ok) {
    notice.value = {
      text:
        result.reason === 'sin-stock'
          ? `Solo quedan ${result.remaining} ${product.unit} de ${product.name}`
          : `${product.name} no tiene existencias`,
      tone: 'error',
    }
    return
  }

  notice.value = { text: `${product.name} agregado a la venta`, tone: 'ok' }
  clearLookup()
  scanner.value?.focus()
}

function onDiscount(value: number) {
  discount.value = Math.min(subtotal.value, Math.max(0, value))
}

function onCharge() {
  const sale = charge(itemCount.value)
  if (!sale) return
  const sold = lines.value.map((line) => ({ productId: line.id, quantity: line.quantity }))
  registerSale(sold, sale.folio)
  registerSaleRecord({
    folio: sale.folio,
    total: sale.total,
    paymentMethod: sale.paymentMethod,
    received: sale.received,
    change: sale.change,
    itemCount: sale.itemCount,
    lines: lines.value.map((line) => ({
      productId: line.id,
      name: line.name,
      sku: line.sku,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      total: Math.round(line.unitPrice * line.quantity * 100) / 100,
    })),
  })
  registerVisit(clientId.value)
  clearCart()
  resetForNext()
  clearLookup()
  notice.value = null
}

function onNewSale() {
  dismiss()
  scanner.value?.focus()
}

function onHold() {
  holdSale()
  resetForNext()
  clearLookup()
  notice.value = { text: 'Venta guardada en espera', tone: 'ok' }
}

function onRestore() {
  restoreHeld()
  notice.value = { text: 'Venta recuperada', tone: 'ok' }
}

function onCancelConfirm() {
  clearCart()
  resetForNext()
  clearLookup()
  notice.value = null
  cancelOpen.value = false
}
</script>

<template>
  <div class="space-y-5 pb-24 md:pb-0">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="font-display text-xl font-semibold tracking-tight text-ink">Punto de venta</h2>
        <p class="mt-0.5 text-sm text-ink-soft">Mostrador · {{ props.branch }}</p>
      </div>
      <StatusTag
        :tone="isAllBranches ? 'warn' : 'ok'"
        :label="isAllBranches ? 'Solo lectura' : 'Caja abierta'"
      />
    </div>

    <div class="grid gap-5 xl:grid-cols-[minmax(230px,3fr)_minmax(0,5fr)_minmax(250px,4fr)]">
      <section
        aria-label="Productos"
        class="rounded-sm border border-rail bg-surface p-4 xl:border-0 xl:bg-transparent xl:p-0"
      >
        <ProductScanner
          ref="scanner"
          :query="query"
          :results="results"
          :loading="loading"
          :error="error"
          :notice="notice"
          @update:query="query = $event"
          @search="search"
          @select="onSelect"
          @clear="clearLookup"
          @retry="search(query)"
        />
      </section>

      <section
        aria-label="Venta en curso"
        class="rounded-sm border border-rail bg-surface px-4 py-4 sm:px-5"
      >
        <SaleTicket
          :lines="lines"
          :clients="clients"
          :client-id="clientId"
          :customer="customer"
          :subtotal="subtotal"
          :discount="discount"
          :total="total"
          :item-count="itemCount"
          @update:client-id="clientId = $event"
          @update:customer="customer = $event"
          @update:discount="onDiscount"
          @update:quantity="setQuantity"
          @remove="remove"
        />
      </section>

      <div class="space-y-5">
        <section
          aria-label="Caja"
          class="rounded-sm border border-rail bg-surface px-4 py-4 sm:px-5"
        >
          <PaymentPanel
            :method="method"
            :received="received"
            :change="change"
            :shortfall="shortfall"
            :can-charge="chargeAvailable"
            :total="total"
            :readonly="isAllBranches"
            @update:method="method = $event"
            @update:received="received = $event"
            @charge="onCharge"
          />
        </section>

        <SaleActions
          v-if="!isAllBranches"
          :held-count="heldCount"
          :can-restore="itemCount === 0"
          :disabled="itemCount === 0 || isAllBranches"
          @hold="onHold"
          @restore="onRestore"
          @cancel="cancelOpen = true"
        />
      </div>
    </div>

    <div
      class="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-rail bg-surface/95 px-4 py-3 md:hidden"
    >
      <div>
        <p class="text-xs text-ink-soft">Total de la venta</p>
        <CurrencyText :value="total" class="font-display text-lg font-semibold text-ink" />
      </div>
      <button
        v-if="!isAllBranches"
        type="button"
        class="rounded-sm bg-ink px-5 py-2.5 font-display text-sm font-semibold text-surface disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!chargeAvailable"
        @click="onCharge"
      >
        Cobrar
      </button>
    </div>

    <ConfirmDialog
      v-if="cancelOpen"
      title="Cancelar esta venta"
      message="Se quitarán todos los artículos del ticket. Esta acción no se puede deshacer."
      confirm-label="Cancelar venta"
      cancel-label="Seguir cobrando"
      tone="danger"
      @confirm="onCancelConfirm"
      @cancel="cancelOpen = false"
    />

    <SuccessReceipt v-if="lastSale" :sale="lastSale" @new="onNewSale" />
  </div>
</template>
