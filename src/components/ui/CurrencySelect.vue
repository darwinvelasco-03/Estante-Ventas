<script setup lang="ts">
import { computed } from 'vue'

import { currencies, findCurrency, type CurrencyCode } from '@/config/currency'
import { currencyCode, setCurrency } from '@/stores/currency'
import AppIcon from './AppIcon.vue'

const props = withDefaults(
  defineProps<{ id?: string; variant?: 'compact' | 'full'; code?: CurrencyCode }>(),
  { id: 'currency-select', variant: 'compact', code: undefined },
)

const emit = defineEmits<{ 'update:code': [value: CurrencyCode] }>()

/** Sin `code`, el selector controla la preferencia global; con él, controla un documento. */
const selected = computed(() => props.code ?? currencyCode.value)

function onChange(event: Event) {
  const code = (event.target as HTMLSelectElement).value as CurrencyCode
  if (props.code === undefined) {
    setCurrency(code)
  } else {
    emit('update:code', code)
  }
}
</script>

<template>
  <div :class="props.variant === 'full' ? 'w-full max-w-sm' : 'relative shrink-0'">
    <label
      v-if="props.variant === 'full'"
      :for="props.id"
      class="mb-1.5 block text-xs font-medium text-ink-soft"
    >
      Moneda de la plataforma
    </label>

    <div v-else class="relative">
      <select
        :id="props.id"
        :value="selected"
        :title="`Moneda: ${findCurrency(selected).label}`"
        aria-label="Moneda de la plataforma"
        class="appearance-none rounded-sm border border-rail bg-surface py-2 pr-6 pl-2.5 font-data text-xs font-semibold tracking-wide text-ink hover:border-ink focus-visible:border-ink"
        @change="onChange"
      >
        <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
          {{ currency.code }}
        </option>
      </select>
      <AppIcon
        name="chevron"
        :size="12"
        class="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-ink-soft"
      />
    </div>

    <template v-if="props.variant === 'full'">
      <div class="relative">
        <select
          :id="props.id"
          :value="selected"
          class="w-full appearance-none rounded-sm border border-rail bg-surface py-2.5 pr-9 pl-3 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
          @change="onChange"
        >
          <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
            {{ currency.code }} — {{ currency.label }} ({{ currency.symbol }})
          </option>
        </select>
        <AppIcon
          name="chevron"
          :size="14"
          class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-soft"
        />
      </div>
      <p class="mt-2 text-xs leading-relaxed text-ink-soft">
        Los importes se guardan en dólares y se muestran como
        <strong class="font-semibold text-ink">{{ findCurrency(selected).symbol }}</strong>
        según la tasa configurada en Configuración.
      </p>
    </template>
  </div>
</template>
