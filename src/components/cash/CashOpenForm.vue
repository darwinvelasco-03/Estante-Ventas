<script setup lang="ts">
import { ref } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import CurrencySelect from '@/components/ui/CurrencySelect.vue'
import type { CurrencyCode } from '@/config/currency'
import { currencyCode, toUsd } from '@/stores/currency'
import type { CashSessionInput } from '@/types/cash'
import { amountForInput } from '@/utils/format'

const emit = defineEmits<{ open: [input: CashSessionInput] }>()

const opening = ref('0')
const formCurrency = ref<CurrencyCode>(currencyCode.value)
const note = ref('')
const error = ref<string | null>(null)

function onCurrencyChange(code: CurrencyCode) {
  if (code === formCurrency.value) return
  const usd = toUsd(Number(opening.value) || 0, formCurrency.value)
  opening.value = amountForInput(usd, code)
  formCurrency.value = code
}

function submit() {
  const value = Number(opening.value)
  if (!Number.isFinite(value) || value < 0) {
    error.value = 'El fondo inicial no puede ser negativo.'
    return
  }
  error.value = null
  emit('open', {
    openingAmount: toUsd(value, formCurrency.value),
    note: note.value,
  })
}
</script>

<template>
  <section aria-label="Abrir caja" class="rounded-sm border border-rail bg-surface p-4 sm:p-5">
    <div class="flex items-start gap-3">
      <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint/15 text-ink">
        <AppIcon name="cash" :size="18" />
      </span>
      <div class="min-w-0">
        <h3 class="font-display text-lg font-semibold text-ink">Abrir caja</h3>
        <p class="mt-0.5 text-sm text-ink-soft">
          Registra el efectivo con el que inicias el turno. Después, cada cobro y gasto pagado se
          sumará automáticamente al arqueo.
        </p>
      </div>
    </div>

    <form class="mt-5 grid gap-3 sm:grid-cols-2" @submit.prevent="submit">
      <div>
        <label for="cash-opening" class="mb-1 block text-xs font-medium text-ink-soft">
          Fondo inicial en {{ formCurrency }}
        </label>
        <input
          id="cash-opening"
          v-model="opening"
          type="number"
          min="0"
          step="any"
          class="tnum w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
          @input="error = null"
        />
      </div>
      <CurrencySelect
        id="cash-open-currency"
        :code="formCurrency"
        variant="full"
        @update:code="onCurrencyChange"
      />
      <div class="sm:col-span-2">
        <label for="cash-open-note" class="mb-1 block text-xs font-medium text-ink-soft">
          Nota (opcional)
        </label>
        <input
          id="cash-open-note"
          v-model="note"
          type="text"
          autocomplete="off"
          placeholder="Ej. Turno de la tarde"
          class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
        />
      </div>

      <p v-if="error" class="flex items-center gap-1.5 text-xs text-brick sm:col-span-2" role="alert">
        <AppIcon name="alert" :size="14" />
        {{ error }}
      </p>

      <div class="flex justify-end sm:col-span-2">
        <button
          type="submit"
          class="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 font-display text-sm font-semibold text-surface hover:bg-ink-soft"
        >
          <AppIcon name="plus" :size="15" />
          Abrir sesión
        </button>
      </div>
    </form>
  </section>
</template>
