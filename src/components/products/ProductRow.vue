<script setup lang="ts">
import CurrencyText from '@/components/ui/CurrencyText.vue'
import type { Product } from '@/types/pos'
import { productGrid } from './grid'
import StockRail from './StockRail.vue'

const props = defineProps<{ product: Product; selected: boolean }>()
const emit = defineEmits<{ select: [product: Product] }>()
</script>

<template>
  <button
    type="button"
    :class="[
      productGrid,
      'w-full border-l-2 px-3 py-3 text-left transition-colors duration-150',
      props.selected ? 'border-ink bg-paper' : 'border-transparent hover:bg-paper/70',
    ]"
    :aria-current="props.selected ? 'true' : undefined"
    @click="emit('select', props.product)"
  >
    <span class="min-w-0">
      <span class="block truncate font-display text-sm font-semibold text-ink">
        {{ props.product.name }}
      </span>
      <span class="mt-0.5 block truncate text-[11px] text-ink-soft md:hidden">
        {{ props.product.sku }} · {{ props.product.category }}
      </span>
      <span class="mt-0.5 hidden truncate text-[11px] text-ink-soft md:block">
        {{ props.product.unit }}
      </span>
    </span>

    <CurrencyText
      :value="props.product.price"
      class="text-right text-sm font-semibold text-ink"
    />

    <span class="hidden truncate font-data text-xs text-ink-soft md:block">
      {{ props.product.sku }}
    </span>
    <span class="hidden truncate text-xs text-ink-soft md:block">
      {{ props.product.category }}
    </span>

    <span class="col-span-2 flex items-center justify-end md:col-auto">
      <span class="mr-1 text-[11px] text-ink-soft md:hidden">Existencia</span>
      <StockRail :stock="props.product.stock" />
    </span>
  </button>
</template>
