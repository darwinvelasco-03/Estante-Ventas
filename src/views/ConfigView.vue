<script setup lang="ts">
import { computed, reactive } from 'vue'

import CurrencySelect from '@/components/ui/CurrencySelect.vue'
import type { CurrencyCode } from '@/config/currency'
import { platform } from '@/config/platform'
import { currencyCode, rateFor, resetRates, setRate } from '@/stores/currency'
import { formatCurrency } from '@/utils/format'

defineProps<{ branch: string }>()

function rateModel(code: CurrencyCode) {
  return computed<string>({
    get: () => String(rateFor(code)),
    set: (value) => setRate(code, Number(value)),
  })
}

// `reactive` desenvuelve los computed anidados para que v-model escriba en la tasa.
const ratesToEdit = reactive([
  { code: 'COP' as const, model: rateModel('COP') },
  { code: 'CRC' as const, model: rateModel('CRC') },
])
</script>

<template>
  <div class="space-y-5">
    <div>
      <h2 class="font-display text-xl font-semibold tracking-tight text-ink">Configuración</h2>
      <p class="mt-0.5 text-sm text-ink-soft">Preferencias · {{ branch }}</p>
    </div>

    <div class="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(260px,5fr)]">
      <section aria-label="Preferencia de moneda" class="rounded-sm border border-rail bg-surface p-5">
        <p class="font-display text-base font-semibold text-ink">Moneda de muestra</p>
        <p class="mt-1 max-w-xl text-sm leading-relaxed text-ink-soft">
          Elige cómo se ven los importes en el punto de venta, el catálogo, los proveedores y las compras.
        </p>
        <div class="mt-4">
          <CurrencySelect id="config-currency" variant="full" />
        </div>
        <div class="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-rail pt-4">
          <span class="text-xs text-ink-soft">US$ 1,250 equivalen a</span>
          <span class="font-display text-lg font-semibold text-ink">{{ formatCurrency(1250) }}</span>
          <span class="font-data text-sm text-ink-soft">{{ formatCurrency(48.5, 2) }}</span>
        </div>
      </section>

      <section aria-label="Presentación de la plataforma" class="rounded-sm border border-rail bg-surface p-5">
        <p class="font-display text-base font-semibold text-ink">Presentación</p>
        <dl class="mt-4 divide-y divide-rail border-y border-rail text-sm">
          <div class="flex items-center justify-between gap-3 py-2.5">
            <dt class="text-ink-soft">Marca</dt>
            <dd class="font-medium text-ink">{{ platform.brand }}</dd>
          </div>
          <div class="flex items-center justify-between gap-3 py-2.5">
            <dt class="text-ink-soft">Idioma</dt>
            <dd class="font-medium text-ink">Español (México)</dd>
          </div>
          <div class="flex items-center justify-between gap-3 py-2.5">
            <dt class="text-ink-soft">Formato numérico</dt>
            <dd class="tnum font-medium text-ink">1,250.50</dd>
          </div>
          <div class="flex items-center justify-between gap-3 py-2.5">
            <dt class="text-ink-soft">Moneda base</dt>
            <dd class="font-medium text-ink">USD · tasa 1</dd>
          </div>
          <div class="flex items-center justify-between gap-3 py-2.5">
            <dt class="text-ink-soft">Moneda activa</dt>
            <dd class="font-medium text-ink">{{ currencyCode }}</dd>
          </div>
        </dl>
        <p class="mt-4 text-xs leading-relaxed text-ink-soft">
          La preferencia se guarda en este navegador. Cada dispositivo mantiene su propia selección.
        </p>
      </section>
    </div>

    <section aria-label="Tipo de cambio" class="rounded-sm border border-rail bg-surface p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="font-display text-base font-semibold text-ink">Tipo de cambio</p>
          <p class="mt-1 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Todos los importes se guardan en dólares. Define cuántas unidades de cada moneda equivalen a 1 USD;
            la conversión se aplica al mostrarlos y al capturarlos.
          </p>
        </div>
        <button
          type="button"
          class="rounded-sm border border-rail px-3 py-1.5 text-xs font-medium text-ink hover:border-ink"
          @click="resetRates"
        >
          Restablecer tasas
        </button>
      </div>

      <div class="mt-4 divide-y divide-rail border-y border-rail">
        <div class="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <p class="flex flex-wrap items-center gap-2">
            <span class="font-display text-sm font-semibold text-ink">1 USD =</span>
            <span class="tnum rounded-sm bg-paper px-2 py-1 text-sm text-ink-soft">1</span>
            <span class="text-sm font-medium text-ink">USD</span>
            <span class="text-xs text-ink-soft">· moneda base, no editable</span>
          </p>
          <p class="tnum text-xs text-ink-soft sm:text-right">US$ 10 = {{ formatCurrency(10, 0, 'USD') }}</p>
        </div>

        <div
          v-for="row in ratesToEdit"
          :key="row.code"
          class="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
        >
          <div class="flex flex-wrap items-center gap-2">
            <label class="font-display text-sm font-semibold text-ink" :for="`rate-${row.code}`">
              1 USD =
            </label>
            <input
              :id="`rate-${row.code}`"
              v-model="row.model"
              type="number"
              min="0.0001"
              step="any"
              class="tnum w-32 rounded-sm border border-rail bg-surface px-2.5 py-1.5 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
            />
            <span class="text-sm font-medium text-ink">{{ row.code }}</span>
          </div>
          <p class="tnum text-xs text-ink-soft sm:text-right">US$ 10 = {{ formatCurrency(10, 0, row.code) }}</p>
        </div>
      </div>

      <p class="mt-4 flex items-start gap-1.5 text-xs leading-relaxed text-ink-soft">
        <span class="mt-0.5 font-semibold text-mustard">Nota</span>
        Al cambiar una tasa se recalculan todos los importes, incluidos los ya capturados: no se guarda una
        tasa distinta por documento.
      </p>
    </section>
  </div>
</template>
