<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import { currencyCode, currencySymbol, toUsd } from '@/stores/currency'
import { amountForInput } from '@/utils/format'
import type { Supplier, SupplierError, SupplierInput } from '@/types/supplier'

const props = defineProps<{ open: boolean; supplier: Supplier | null }>()

const emit = defineEmits<{
  close: []
  save: [input: SupplierInput, id: string | null]
}>()

const dayLetters = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const dayNames = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo',
]
const paymentOptions = ['Contado', 'Crédito 15 días', 'Crédito 30 días']

const name = ref('')
const contact = ref('')
const phone = ref('')
const line = ref('')
const deliveryDays = ref<number[]>([])
const minimum = ref('0')
const paymentTerms = ref(paymentOptions[0] ?? 'Contado')
const note = ref('')
const error = ref<SupplierError | null>(null)
const nameInput = ref<HTMLInputElement | null>(null)
const dialog = ref<HTMLElement | null>(null)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    name.value = props.supplier?.name ?? ''
    contact.value = props.supplier?.contact ?? ''
    phone.value = props.supplier?.phone ?? ''
    line.value = props.supplier?.line ?? ''
    deliveryDays.value = [...(props.supplier?.deliveryDays ?? [])]
    minimum.value = amountForInput(props.supplier?.minimum ?? 0)
    paymentTerms.value = props.supplier?.paymentTerms ?? paymentOptions[0] ?? 'Contado'
    note.value = props.supplier?.note ?? ''
    error.value = null
    nextTick(() => nameInput.value?.focus())
  },
)

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
  if (focusable.length === 0) return
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

function toggleDay(day: number) {
  deliveryDays.value = deliveryDays.value.includes(day)
    ? deliveryDays.value.filter((value) => value !== day)
    : [...deliveryDays.value, day].sort((a, b) => a - b)
}

function submit() {
  if (!name.value.trim()) {
    error.value = 'nombre'
    return
  }
  const digits = phone.value.replace(/\D/g, '')
  if (digits && digits.length !== 10) {
    error.value = 'telefono'
    return
  }
  const amount = Number(minimum.value)
  if (!Number.isFinite(amount) || amount < 0) {
    error.value = 'minimo'
    return
  }
  error.value = null
  emit(
    'save',
    {
      name: name.value,
      contact: contact.value,
      phone: phone.value,
      line: line.value,
      deliveryDays: deliveryDays.value,
      minimum: toUsd(amount),
      paymentTerms: paymentTerms.value,
      note: note.value,
    },
    props.supplier?.id ?? null,
  )
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
        aria-labelledby="supplier-sheet-title"
        class="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-sm border border-rail bg-surface p-5 shadow-[0_24px_60px_-30px_rgba(18,59,52,0.7)] sm:rounded-sm"
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="supplier-sheet-title" class="font-display text-lg font-semibold text-ink">
              {{ props.supplier ? 'Editar ficha' : 'Nuevo proveedor' }}
            </h2>
            <p class="mt-0.5 text-xs text-ink-soft">
              Días de entrega y pedido mínimo aparecen en el directorio.
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

        <form class="space-y-3" @submit.prevent="submit">
          <div>
            <label for="supplier-name" class="mb-1 block text-xs font-medium text-ink-soft">
              Razón social
            </label>
            <input
              id="supplier-name"
              ref="nameInput"
              v-model="name"
              type="text"
              placeholder="Molinos del Valle"
              class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              @input="error = null"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="supplier-contact" class="mb-1 block text-xs font-medium text-ink-soft">
                Contacto (opcional)
              </label>
              <input
                id="supplier-contact"
                v-model="contact"
                type="text"
                placeholder="Nombre del vendedor"
                class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              />
            </div>
            <div>
              <label for="supplier-phone" class="mb-1 block text-xs font-medium text-ink-soft">
                Teléfono (opcional)
              </label>
              <input
                id="supplier-phone"
                v-model="phone"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                placeholder="55 1234 5678"
                class="tnum w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
                @input="error = null"
              />
            </div>
          </div>

          <div>
            <label for="supplier-line" class="mb-1 block text-xs font-medium text-ink-soft">
              Línea que surte
            </label>
            <input
              id="supplier-line"
              v-model="line"
              type="text"
              placeholder="Harina, azúcar, frijol"
              class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
            />
          </div>

          <fieldset>
            <legend class="mb-1.5 text-xs font-medium text-ink-soft">Días de entrega</legend>
            <div class="grid grid-cols-7 gap-1">
              <button
                v-for="(letter, index) in dayLetters"
                :key="index"
                type="button"
                class="rounded-sm border py-1.5 text-xs transition-colors"
                :class="
                  deliveryDays.includes(index + 1)
                    ? 'border-ink bg-ink font-semibold text-surface'
                    : 'border-rail text-ink-soft hover:border-ink'
                "
                :aria-label="`${letter}, ${dayNames[index]}`"
                :aria-pressed="deliveryDays.includes(index + 1)"
                @click="toggleDay(index + 1)"
              >
                {{ letter }}
              </button>
            </div>
          </fieldset>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="supplier-minimum" class="mb-1 block text-xs font-medium text-ink-soft">
                Pedido mínimo ({{ currencySymbol }} · {{ currencyCode }})
              </label>
              <input
                id="supplier-minimum"
                v-model="minimum"
                type="number"
                step="any"
                class="tnum w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
                @input="error = null"
              />
            </div>
            <div>
              <label for="supplier-payment" class="mb-1 block text-xs font-medium text-ink-soft">
                Forma de pago
              </label>
              <select
                id="supplier-payment"
                v-model="paymentTerms"
                class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              >
                <option v-for="option in paymentOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label for="supplier-note" class="mb-1 block text-xs font-medium text-ink-soft">
              Nota (opcional)
            </label>
            <textarea
              id="supplier-note"
              v-model="note"
              rows="2"
              placeholder="Andén, horario, regreso de envases…"
              class="w-full resize-y rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
            />
          </div>

          <p v-if="error" class="flex items-start gap-1.5 text-xs text-brick" role="alert">
            <AppIcon name="alert" :size="14" class="mt-px shrink-0" />
            {{
              error === 'nombre'
                ? 'Escribe la razón social del proveedor.'
                : error === 'telefono'
                  ? 'El teléfono debe tener 10 dígitos.'
                  : 'El pedido mínimo no puede ser negativo.'
            }}
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
              Guardar proveedor
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
