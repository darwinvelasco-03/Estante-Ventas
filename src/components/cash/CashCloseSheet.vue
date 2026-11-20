<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import CurrencySelect from '@/components/ui/CurrencySelect.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import type { CurrencyCode } from '@/config/currency'
import { currencyCode, toUsd } from '@/stores/currency'
import type { CashCloseInput, CashSession, CashSummary } from '@/types/cash'
import { amountForInput, formatCurrency } from '@/utils/format'

const props = defineProps<{ open: boolean; session: CashSession | null; summary: CashSummary | null }>()
const emit = defineEmits<{ close: []; confirm: [input: CashCloseInput] }>()

const counted = ref('0')
const sheetCurrency = ref<CurrencyCode>(currencyCode.value)
const note = ref('')
const error = ref<string | null>(null)
const dialog = ref<HTMLElement | null>(null)
const countedInput = ref<HTMLInputElement | null>(null)

const countedUsd = computed(() => toUsd(Number(counted.value) || 0, sheetCurrency.value))
const difference = computed(() =>
  props.summary ? countedUsd.value - props.summary.expectedCash : 0,
)
const balanced = computed(() => Math.abs(difference.value) < 0.005)

watch(
  () => props.open,
  (open) => {
    if (!open || !props.summary) return
    const code = currencyCode.value
    sheetCurrency.value = code
    counted.value = amountForInput(props.summary.expectedCash, code)
    note.value = ''
    error.value = null
    nextTick(() => countedInput.value?.focus())
  },
)

function onCurrencyChange(code: CurrencyCode) {
  if (code === sheetCurrency.value) return
  const usd = toUsd(Number(counted.value) || 0, sheetCurrency.value)
  counted.value = amountForInput(usd, code)
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
  if (!Number.isFinite(countedUsd.value) || countedUsd.value < 0) {
    error.value = 'El efectivo contado no puede ser negativo.'
    return
  }
  emit('confirm', { countedCash: countedUsd.value, note: note.value })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.open && props.session && props.summary"
      class="fixed inset-0 z-[60] flex items-end justify-center bg-ink/50 sm:items-center sm:p-4"
      @click.self="emit('close')"
    >
      <div
        ref="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cash-close-title"
        class="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-sm border border-rail bg-surface p-5 shadow-[0_24px_60px_-30px_rgba(18,59,52,0.7)] sm:rounded-sm"
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="cash-close-title" class="font-display text-lg font-semibold text-ink">
              Arqueo de caja
            </h2>
            <p class="mt-0.5 text-xs text-ink-soft">
              {{ props.session.folio }} · cuenta el efectivo disponible en el cajón.
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

        <div class="rounded-sm border border-rail bg-paper p-4">
          <div class="flex items-center justify-between gap-3">
            <span class="text-xs text-ink-soft">Efectivo esperado</span>
            <strong class="tnum text-base font-semibold text-ink">
              {{ formatCurrency(props.summary.expectedCash, 2) }}
            </strong>
          </div>
          <p class="mt-1 text-[11px] leading-relaxed text-ink-soft">
            Fondo + ventas en efectivo − gastos pagados en efectivo.
          </p>
        </div>

        <form class="mt-4 space-y-4" @submit.prevent="submit">
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="cash-counted" class="mb-1 block text-xs font-medium text-ink-soft">
                Efectivo contado en {{ sheetCurrency }}
              </label>
              <input
                id="cash-counted"
                ref="countedInput"
                v-model="counted"
                type="number"
                min="0"
                step="any"
                class="tnum w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
                @input="error = null"
              />
            </div>
            <CurrencySelect
              id="cash-close-currency"
              :code="sheetCurrency"
              variant="full"
              @update:code="onCurrencyChange"
            />
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2 rounded-sm bg-paper px-3 py-2.5">
            <span class="text-xs text-ink-soft">Descuadre</span>
            <div class="flex items-center gap-2">
              <StatusTag
                :tone="balanced ? 'ok' : 'danger'"
                :label="balanced ? 'Cuadra' : 'Descuadre'"
              />
              <strong
                class="tnum text-sm font-semibold"
                :class="balanced ? 'text-ink' : 'text-brick'"
              >
                {{ difference >= 0 ? '+' : '' }}{{ formatCurrency(difference, 2) }}
              </strong>
            </div>
          </div>

          <div>
            <label for="cash-close-note" class="mb-1 block text-xs font-medium text-ink-soft">
              Nota del cierre (opcional)
            </label>
            <textarea
              id="cash-close-note"
              v-model="note"
              rows="2"
              placeholder="Ej. Falta un billete de 20, se revisó al cierre"
              class="w-full resize-y rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
            />
          </div>

          <p v-if="error" class="flex items-center gap-1.5 text-xs text-brick" role="alert">
            <AppIcon name="alert" :size="14" />
            {{ error }}
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
              Cerrar sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
