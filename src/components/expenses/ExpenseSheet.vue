<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import CurrencySelect from '@/components/ui/CurrencySelect.vue'
import type { CurrencyCode } from '@/config/currency'
import { currencyCode, toUsd } from '@/stores/currency'
import { suppliers } from '@/stores/suppliers'
import {
  expenseCategories,
  type Expense,
  type ExpenseCategory,
  type ExpenseError,
  type ExpenseInput,
  type ExpensePaymentMethod,
  type ExpenseStatus,
} from '@/types/expense'
import { amountForInput } from '@/utils/format'

const props = defineProps<{ open: boolean; expense: Expense | null }>()

const emit = defineEmits<{
  close: []
  save: [input: ExpenseInput, id: string | null]
}>()

const date = ref('')
const category = ref<ExpenseCategory>('Servicios')
const supplierId = ref('')
const concept = ref('')
const amount = ref('0')
const sheetCurrency = ref<CurrencyCode>(currencyCode.value)
const method = ref<ExpensePaymentMethod>('efectivo')
const status = ref<ExpenseStatus>('pendiente')
const note = ref('')
const error = ref<ExpenseError | null>(null)
const dialog = ref<HTMLElement | null>(null)
const conceptInput = ref<HTMLInputElement | null>(null)

const methods: { id: ExpensePaymentMethod; label: string }[] = [
  { id: 'efectivo', label: 'Efectivo' },
  { id: 'tarjeta', label: 'Tarjeta' },
  { id: 'transferencia', label: 'Transferencia' },
]

function todayLocal() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function toDateInput(iso: string) {
  const value = new Date(iso)
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

watch(
  () => props.open,
  (open) => {
    if (!open) return
    const code = props.expense?.currency ?? currencyCode.value
    sheetCurrency.value = code
    date.value = props.expense ? toDateInput(props.expense.date) : todayLocal()
    category.value = props.expense?.category ?? 'Servicios'
    supplierId.value = props.expense?.supplierId ?? ''
    concept.value = props.expense?.concept ?? ''
    amount.value = props.expense ? amountForInput(props.expense.amount, code) : '0'
    method.value = props.expense?.paymentMethod ?? 'efectivo'
    status.value = props.expense?.status ?? 'pendiente'
    note.value = props.expense?.note ?? ''
    error.value = null
    nextTick(() => conceptInput.value?.focus())
  },
)

/** Cambiar la moneda de presentación no altera el importe base en USD. */
function onCurrencyChange(code: CurrencyCode) {
  if (code === sheetCurrency.value) return
  const usd = toUsd(Number(amount.value) || 0, sheetCurrency.value)
  amount.value = amountForInput(usd, code)
  sheetCurrency.value = code
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
  if (!concept.value.trim()) {
    error.value = 'concepto'
    return
  }
  const value = Number(amount.value)
  if (!Number.isFinite(value) || value <= 0) {
    error.value = 'monto'
    return
  }
  if (!date.value || !Number.isFinite(new Date(date.value).getTime())) {
    error.value = 'fecha'
    return
  }

  error.value = null
  emit(
    'save',
    {
      date: date.value,
      category: category.value,
      supplierId: supplierId.value || null,
      concept: concept.value,
      // La captura está en la moneda del gasto; la base siempre es USD.
      amount: toUsd(value, sheetCurrency.value),
      currency: sheetCurrency.value,
      paymentMethod: method.value,
      status: status.value,
      note: note.value,
    },
    props.expense?.id ?? null,
  )
}

const errorText: Record<ExpenseError, string> = {
  concepto: 'Escribe un concepto para el gasto.',
  monto: 'El monto debe ser mayor a cero.',
  fecha: 'Revisa la fecha del gasto.',
  'no-encontrado': 'No pudimos encontrar el gasto.',
  pagado: 'Un gasto pagado ya no se puede editar.',
  anulado: 'Este gasto fue anulado; consulta el rastro en Movimientos.',
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
        aria-labelledby="expense-sheet-title"
        class="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-sm border border-rail bg-surface p-5 shadow-[0_24px_60px_-30px_rgba(18,59,52,0.7)] sm:rounded-sm"
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="expense-sheet-title" class="font-display text-lg font-semibold text-ink">
              {{ props.expense ? 'Editar gasto' : 'Nuevo gasto' }}
            </h2>
            <p class="mt-0.5 text-xs text-ink-soft">
              Captura el importe en la moneda del documento; se guarda en USD.
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
              <label for="expense-date" class="mb-1 block text-xs font-medium text-ink-soft">
                Fecha
              </label>
              <input
                id="expense-date"
                v-model="date"
                type="date"
                class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
                @input="error = null"
              />
            </div>
            <div>
              <label for="expense-category" class="mb-1 block text-xs font-medium text-ink-soft">
                Categoría
              </label>
              <select
                id="expense-category"
                v-model="category"
                class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              >
                <option v-for="item in expenseCategories" :key="item" :value="item">{{ item }}</option>
              </select>
            </div>
          </div>

          <div>
            <label for="expense-concept" class="mb-1 block text-xs font-medium text-ink-soft">
              Concepto
            </label>
            <input
              id="expense-concept"
              ref="conceptInput"
              v-model="concept"
              type="text"
              autocomplete="off"
              placeholder="Ej. Luz y agua del mes"
              class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              @input="error = null"
            />
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="expense-amount" class="mb-1 block text-xs font-medium text-ink-soft">
                Monto en {{ sheetCurrency }}
              </label>
              <input
                id="expense-amount"
                v-model="amount"
                type="number"
                min="0"
                step="any"
                class="tnum w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
                @input="error = null"
              />
            </div>
            <CurrencySelect
              id="expense-currency"
              :code="sheetCurrency"
              variant="full"
              @update:code="onCurrencyChange"
            />
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="expense-supplier" class="mb-1 block text-xs font-medium text-ink-soft">
                Proveedor (opcional)
              </label>
              <select
                id="expense-supplier"
                v-model="supplierId"
                class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              >
                <option value="">Sin proveedor</option>
                <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                  {{ supplier.name }}
                </option>
              </select>
            </div>
            <div>
              <label for="expense-method" class="mb-1 block text-xs font-medium text-ink-soft">
                Forma de pago
              </label>
              <select
                id="expense-method"
                v-model="method"
                class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              >
                <option v-for="item in methods" :key="item.id" :value="item.id">{{ item.label }}</option>
              </select>
            </div>
          </div>

          <div>
            <label for="expense-status" class="mb-1 block text-xs font-medium text-ink-soft">
              Estatus
            </label>
            <select
              id="expense-status"
              v-model="status"
              class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
            >
              <option value="pendiente">Pendiente de pago</option>
              <option value="pagado">Pagado</option>
            </select>
          </div>

          <div>
            <label for="expense-note" class="mb-1 block text-xs font-medium text-ink-soft">
              Nota (opcional)
            </label>
            <textarea
              id="expense-note"
              v-model="note"
              rows="2"
              placeholder="Referencia, factura, observación…"
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
              Guardar gasto
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
