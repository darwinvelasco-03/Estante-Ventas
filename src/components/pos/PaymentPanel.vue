<script setup lang="ts">
import { computed } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import CurrencyText from '@/components/ui/CurrencyText.vue'
import { currencySymbol } from '@/stores/currency'
import type { IconName } from '@/types/icons'
import type { PaymentMethod } from '@/types/pos'

const props = defineProps<{
  method: PaymentMethod
  received: string
  change: number
  shortfall: number
  canCharge: boolean
  total: number
  readonly?: boolean
}>()

const emit = defineEmits<{
  'update:method': [value: PaymentMethod]
  'update:received': [value: string]
  charge: []
}>()

const options: { id: PaymentMethod; label: string; icon: IconName }[] = [
  { id: 'efectivo', label: 'Efectivo', icon: 'cash' },
  { id: 'tarjeta', label: 'Tarjeta', icon: 'card' },
]

const entered = computed(() => Number(props.received.replace(',', '.')) || 0)
</script>

<template>
  <div>
    <h2 class="font-display text-base font-semibold text-ink">Caja</h2>
    <p class="text-xs text-ink-soft">Cobra la venta en curso</p>

    <fieldset class="mt-4">
      <legend class="sr-only">Forma de pago</legend>
      <div class="grid grid-cols-2 gap-2">
        <label
          v-for="option in options"
          :key="option.id"
          class="flex cursor-pointer items-center gap-2 rounded-sm border px-2.5 py-2.5 text-sm transition-colors"
          :class="props.method === option.id ? 'border-ink bg-paper text-ink' : 'border-rail text-ink-soft hover:border-ink'"
        >
          <input
            type="radio"
            name="payment-method"
            class="accent-ink"
            :value="option.id"
            :checked="props.method === option.id"
            @change="emit('update:method', option.id)"
          />
          <AppIcon :name="option.icon" :size="16" class="shrink-0" />
          <span>{{ option.label }}</span>
        </label>
      </div>
    </fieldset>

    <template v-if="props.method === 'efectivo'">
      <label for="amount-received" class="mt-4 mb-1.5 block text-xs font-medium text-ink-soft">
        Efectivo recibido
      </label>
      <div class="relative">
        <span class="absolute top-1/2 left-3 -translate-y-1/2 text-xs text-ink-soft">{{ currencySymbol }}</span>
        <input
          id="amount-received"
          type="number"
          min="0"
          step="0.01"
          :value="props.received"
          placeholder="0.00"
          class="tnum w-full rounded-sm border border-rail bg-surface py-2.5 pr-3 pl-12 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
          @input="emit('update:received', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <p v-if="props.shortfall > 0" class="mt-2 flex items-start gap-1.5 text-xs text-brick" aria-live="polite">
        <AppIcon name="alert" :size="14" class="mt-px shrink-0" />
        Faltan <CurrencyText :value="props.shortfall" /> para completar el cobro
      </p>
      <div
        v-else-if="entered > 0"
        class="mt-3 flex items-baseline justify-between border-t border-rail pt-2 text-sm"
        aria-live="polite"
      >
        <span class="text-ink-soft">Cambio</span>
        <CurrencyText :value="props.change" class="font-display text-lg font-semibold text-ink" />
      </div>
    </template>

    <p v-else class="mt-4 rounded-sm border border-rail bg-paper px-3 py-2.5 text-xs text-ink-soft">
      El pago con tarjeta se confirma al cobrar.
    </p>

    <button
      v-if="!props.readonly"
      type="button"
      class="mt-5 flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-4 py-3 font-display text-sm font-semibold text-surface transition-colors duration-150 hover:bg-ink-soft active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="!props.canCharge"
      @click="emit('charge')"
    >
      Cobrar
      <CurrencyText :value="props.total" />
    </button>
    <p v-else class="mt-5 rounded-sm border border-rail bg-paper px-3 py-2.5 text-xs text-ink-soft">
      Vista agregada: selecciona una sucursal para cobrar.
    </p>
    <p class="mt-2 text-center text-[11px] text-ink-soft">Precio final con IVA incluido.</p>
  </div>
</template>
