<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import CurrencySelect from '@/components/ui/CurrencySelect.vue'
import type { CurrencyCode } from '@/config/currency'
import { catalogProducts } from '@/stores/catalog'
import { currencyCode, toUsd } from '@/stores/currency'
import { suppliers } from '@/stores/suppliers'
import { amountForInput } from '@/utils/format'
import type { PaymentMethod } from '@/types/pos'
import type { Purchase, PurchaseError, PurchaseInput } from '@/types/purchase'

const props = defineProps<{ open: boolean; purchase: Purchase | null }>()

const emit = defineEmits<{
  close: []
  save: [input: PurchaseInput, id: string | null]
}>()

interface DraftLine {
  key: string
  productId: string
  ordered: string
  unitCost: string
}

const supplierId = ref<string>('')
const note = ref('')
const lines = ref<DraftLine[]>([])
const error = ref<PurchaseError | null>(null)
const dialog = ref<HTMLElement | null>(null)
const supplierInput = ref<HTMLSelectElement | null>(null)
const editorCurrency = ref<CurrencyCode>(currencyCode.value)
const paymentMethod = ref<PaymentMethod>('efectivo')
const paid = ref(false)

let keyCounter = 0
function nextKey() {
  keyCounter += 1
  return `draft-${keyCounter}`
}

watch(
  () => props.open,
  (open) => {
    if (!open) return
    const code = props.purchase?.currency ?? currencyCode.value
    editorCurrency.value = code
    paymentMethod.value = props.purchase?.paymentMethod ?? 'efectivo'
    paid.value = !!props.purchase?.paidAt
    supplierId.value = props.purchase?.supplierId ?? suppliers.value[0]?.id ?? ''
    note.value = props.purchase?.note ?? ''
    lines.value =
      props.purchase?.lines.map((line) => ({
        key: nextKey(),
        productId: line.productId,
        ordered: String(line.ordered),
        unitCost: amountForInput(line.unitCost, code),
      })) ?? [blankLine()]
    error.value = null
    nextTick(() => supplierInput.value?.focus())
  },
)

function blankLine(): DraftLine {
  return { key: nextKey(), productId: catalogProducts.value[0]?.id ?? '', ordered: '1', unitCost: '0' }
}

/** Cambiar la moneda de presentación no debe alterar el costo guardado en USD. */
function onCurrencyChange(code: CurrencyCode) {
  if (code === editorCurrency.value) return
  for (const line of lines.value) {
    const usd = toUsd(Number(line.unitCost) || 0, editorCurrency.value)
    line.unitCost = amountForInput(usd, code)
  }
  editorCurrency.value = code
}

function addLine() {
  lines.value.push(blankLine())
}

function removeLine(key: string) {
  lines.value = lines.value.filter((line) => line.key !== key)
}

function isTaken(productId: string, key: string) {
  return lines.value.some((line) => line.key !== key && line.productId === productId)
}

function onKeydown(event: KeyboardEvent) {
  if (!props.open) return
  if (event.key === 'Escape') {
    emit('close')
    return
  }
  if (event.key !== 'Tab' || !dialog.value) return
  const focusable = Array.from(
    dialog.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
    ),
  )
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first || !last) return
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

function submit() {
  if (!supplierId.value) {
    error.value = 'proveedor'
    return
  }
  if (lines.value.length === 0) {
    error.value = 'renglones'
    return
  }
  for (const line of lines.value) {
    const ordered = Number(line.ordered)
    const unitCost = Number(line.unitCost)
    if (!Number.isFinite(ordered) || ordered <= 0) {
      error.value = 'cantidad'
      return
    }
    if (!Number.isFinite(unitCost) || unitCost < 0) {
      error.value = 'costo'
      return
    }
  }
  error.value = null
  emit(
    'save',
    {
      supplierId: supplierId.value,
      currency: editorCurrency.value,
      paid: paid.value,
      paymentMethod: paymentMethod.value,
      note: note.value,
      lines: lines.value.map((line) => ({
        productId: line.productId,
        ordered: Number(line.ordered),
        // La captura está en la moneda de la orden; la base siempre es USD.
        unitCost: toUsd(Number(line.unitCost), editorCurrency.value),
      })),
    },
    props.purchase?.id ?? null,
  )
}

const errorText: Record<PurchaseError, string> = {
  proveedor: 'Elige un proveedor para la orden.',
  renglones: 'Agrega al menos un renglón.',
  cantidad: 'La cantidad pedida debe ser mayor a cero.',
  costo: 'El costo unitario no puede ser negativo.',
  'no-encontrado': 'No pudimos encontrar la orden.',
  recibida: 'Una orden recibida ya no se puede editar.',
  pagada: 'Esta orden ya está pagada.',
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.open"
      class="fixed inset-0 z-[60] flex items-end justify-center bg-ink/50 sm:items-center sm:p-4"
      @click.self="emit('close')"
    >
      <div
        ref="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-editor-title"
        class="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-sm border border-rail bg-surface p-5 shadow-[0_24px_60px_-30px_rgba(18,59,52,0.7)] sm:rounded-sm"
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="purchase-editor-title" class="font-display text-lg font-semibold text-ink">
              {{ props.purchase ? 'Editar orden' : 'Nueva orden de compra' }}
            </h2>
            <p class="mt-0.5 text-xs text-ink-soft">
              Elige proveedor y moneda, luego captura cada renglón con su costo.
            </p>
          </div>
          <button
            type="button"
            class="rounded-sm p-1 text-ink-soft hover:bg-paper hover:text-ink"
            aria-label="Cerrar"
            @click="emit('close')"
          >
            <AppIcon name="close" :size="18" />
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="submit">
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="purchase-supplier" class="mb-1 block text-xs font-medium text-ink-soft">
                Proveedor
              </label>
              <select
                id="purchase-supplier"
                ref="supplierInput"
                v-model="supplierId"
                class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
                @change="error = null"
              >
                <option value="" disabled>Selecciona un proveedor</option>
                <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                  {{ supplier.name }}
                </option>
              </select>
            </div>
            <CurrencySelect
              id="purchase-currency"
              :code="editorCurrency"
              variant="full"
              @update:code="onCurrencyChange"
            />
          </div>

          <fieldset>
            <legend class="mb-1.5 text-xs font-medium text-ink-soft">
              Renglones · costos en {{ editorCurrency }}
            </legend>
            <div class="space-y-2">
              <div
                v-for="line in lines"
                :key="line.key"
                class="grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-sm border border-rail p-2 md:grid-cols-[minmax(0,2fr)_72px_96px_auto]"
              >
                <div class="min-w-0">
                  <label class="sr-only" :for="`line-product-${line.key}`">Producto</label>
                  <select
                    :id="`line-product-${line.key}`"
                    v-model="line.productId"
                    class="w-full rounded-sm border border-rail bg-surface px-2 py-2 text-sm text-ink focus-visible:border-ink"
                  >
                    <option
                      v-for="product in catalogProducts"
                      :key="product.id"
                      :value="product.id"
                      :disabled="isTaken(product.id, line.key)"
                    >
                      {{ product.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="sr-only" :for="`line-ordered-${line.key}`">Cantidad pedida</label>
                  <input
                    :id="`line-ordered-${line.key}`"
                    v-model="line.ordered"
                    type="number"
                    step="any"
                    placeholder="Cant."
                    class="tnum w-full rounded-sm border border-rail bg-surface px-2 py-2 text-sm text-ink focus-visible:border-ink"
                    @input="error = null"
                  />
                </div>
                <div>
                  <label class="sr-only" :for="`line-cost-${line.key}`">Costo unitario</label>
                  <input
                    :id="`line-cost-${line.key}`"
                    v-model="line.unitCost"
                    type="number"
                    step="any"
                    :placeholder="`Costo ${editorCurrency}`"
                    class="tnum w-full rounded-sm border border-rail bg-surface px-2 py-2 text-sm text-ink focus-visible:border-ink"
                    @input="error = null"
                  />
                </div>
                <button
                  type="button"
                  class="justify-self-end rounded-sm p-2 text-ink-soft hover:bg-brick-soft hover:text-brick"
                  :aria-label="`Quitar renglón ${line.key}`"
                  :disabled="lines.length === 1"
                  @click="removeLine(line.key)"
                >
                  <AppIcon name="trash" :size="16" />
                </button>
              </div>
            </div>
            <button
              type="button"
              class="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-ink hover:underline"
              @click="addLine"
            >
              <AppIcon name="plus" :size="14" />
              Agregar renglón
            </button>
          </fieldset>

          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="purchase-payment" class="mb-1 block text-xs font-medium text-ink-soft">
                Forma de pago
              </label>
              <select
                id="purchase-payment"
                v-model="paymentMethod"
                class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </div>
            <label
              for="purchase-paid"
              class="flex cursor-pointer items-start gap-2 rounded-sm border border-rail px-3 py-2 hover:border-ink"
            >
              <input
                id="purchase-paid"
                v-model="paid"
                type="checkbox"
                class="mt-0.5 size-4 shrink-0 accent-ink"
              />
              <span>
                <span class="block text-sm font-medium text-ink">Orden pagada</span>
                <span class="block text-[11px] leading-relaxed text-ink-soft">
                  Se contabiliza como egreso en Caja y Reportes.
                </span>
              </span>
            </label>
          </div>

          <div>
            <label for="purchase-note" class="mb-1 block text-xs font-medium text-ink-soft">
              Nota (opcional)
            </label>
            <textarea
              id="purchase-note"
              v-model="note"
              rows="2"
              placeholder="Andén, horario, confirmación de precio…"
              class="w-full resize-y rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
            />
          </div>

          <p v-if="error" class="flex items-start gap-1.5 text-xs text-brick" role="alert">
            <AppIcon name="alert" :size="14" class="mt-px shrink-0" />
            {{ errorText[error] }}
          </p>

          <div class="flex justify-end gap-2 pt-1">
            <button
              type="button"
              class="rounded-sm border border-rail px-3 py-2 text-sm text-ink hover:border-ink"
              @click="emit('close')"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 font-display text-sm font-semibold text-surface hover:bg-ink-soft"
            >
              <AppIcon name="check" :size="15" />
              Guardar orden
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
