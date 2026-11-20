<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import AppIcon from './AppIcon.vue'
import CurrencyText from './CurrencyText.vue'
import type { SaleResult } from '@/types/pos'

const props = defineProps<{ sale: SaleResult }>()
const emit = defineEmits<{ new: [] }>()

const button = ref<HTMLButtonElement | null>(null)
const methodLabel = computed(() => (props.sale.paymentMethod === 'efectivo' ? 'Efectivo' : 'Tarjeta'))

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('new')
}

onMounted(() => {
  button.value?.focus()
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[70] flex items-center justify-center bg-ink/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-title"
        class="w-full max-w-sm rounded-sm border border-rail bg-surface p-5 shadow-[0_24px_60px_-30px_rgba(18,59,52,0.7)]"
      >
        <div class="flex items-center gap-3">
          <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-ok-soft text-ok" aria-hidden="true">
            <AppIcon name="check" :size="20" />
          </span>
          <div>
            <h2 id="receipt-title" class="font-display text-base font-semibold text-ink">Venta registrada</h2>
            <p class="text-xs text-ink-soft">
              Folio {{ props.sale.folio }} · {{ props.sale.itemCount }}
              {{ props.sale.itemCount === 1 ? 'artículo' : 'artículos' }}
            </p>
          </div>
        </div>

        <dl class="mt-4 divide-y divide-rail border-y border-rail text-sm">
          <div class="flex items-center justify-between gap-3 py-2.5">
            <dt class="text-ink-soft">Total</dt>
            <dd class="font-display font-semibold text-ink"><CurrencyText :value="props.sale.total" /></dd>
          </div>
          <div class="flex items-center justify-between gap-3 py-2.5">
            <dt class="text-ink-soft">Forma de pago</dt>
            <dd class="text-ink">{{ methodLabel }}</dd>
          </div>
          <div v-if="props.sale.change > 0" class="flex items-center justify-between gap-3 py-2.5">
            <dt class="text-ink-soft">Cambio entregado</dt>
            <dd class="text-ink"><CurrencyText :value="props.sale.change" /></dd>
          </div>
        </dl>

        <button
          ref="button"
          type="button"
          class="mt-5 w-full rounded-sm bg-ink px-4 py-2.5 font-display text-sm font-semibold text-surface hover:bg-ink-soft"
          @click="emit('new')"
        >
          Nueva venta
        </button>
      </div>
    </div>
  </Teleport>
</template>
