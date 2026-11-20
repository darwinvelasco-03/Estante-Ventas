<script setup lang="ts">
import CurrencyText from '@/components/ui/CurrencyText.vue'
import type { Product } from '@/types/pos'

const props = defineProps<{ product: Product }>()
const emit = defineEmits<{ select: [product: Product] }>()
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center gap-3 border-b border-rail px-3 py-2.5 text-left transition-colors duration-150 last:border-b-0 enabled:hover:bg-paper disabled:cursor-not-allowed disabled:opacity-45"
    :disabled="props.product.stock <= 0"
    :aria-label="`Agregar ${props.product.name}, ${props.product.stock} ${props.product.unit} disponibles`"
    @click="emit('select', props.product)"
  >
    <span class="min-w-0 flex-1">
      <span class="block truncate text-sm font-medium text-ink">{{ props.product.name }}</span>
      <span class="block truncate text-[11px] text-ink-soft">
        {{ props.product.sku }} · {{ props.product.stock }} {{ props.product.unit }}
      </span>
    </span>
    <CurrencyText
      :value="props.product.price"
      class="shrink-0 font-display text-sm font-semibold text-ink"
    />
  </button>
</template>
