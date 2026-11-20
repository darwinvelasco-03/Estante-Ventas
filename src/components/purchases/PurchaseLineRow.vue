<script setup lang="ts">
import type { CurrencyCode } from '@/config/currency'
import type { PurchaseLine } from '@/types/purchase'
import { formatCurrency } from '@/utils/format'
import { purchaseLineGrid } from './grid'

const props = defineProps<{ line: PurchaseLine; currency: CurrencyCode }>()

const progress =
  props.line.ordered === 0 ? 0 : Math.min(100, (props.line.received / props.line.ordered) * 100)
</script>

<template>
  <div :class="[purchaseLineGrid, 'px-3 py-2.5']">
    <div class="min-w-0">
      <p class="truncate text-sm text-ink">{{ props.line.name }}</p>
      <p class="truncate text-[11px] text-ink-soft">
        {{ props.line.sku }} · {{ props.line.unit }}
        <span class="md:hidden">· {{ formatCurrency(props.line.unitCost, 2, props.currency) }} c/u</span>
      </p>
    </div>

    <div class="text-right">
      <span class="tnum block text-sm text-ink">{{ props.line.ordered }}</span>
      <span class="block text-[10px] text-ink-soft md:hidden">Pedido</span>
    </div>

    <div>
      <span
        class="tnum block text-sm font-medium"
        :class="props.line.received >= props.line.ordered ? 'text-ok' : 'text-mustard'"
      >
        {{ props.line.received }}
      </span>
      <span class="mt-1 block h-1 w-12 overflow-hidden rounded-full bg-rail" aria-hidden="true">
        <span
          class="block h-full rounded-full"
          :class="props.line.received >= props.line.ordered ? 'bg-ok' : 'bg-mustard'"
          :style="{ width: `${progress}%` }"
        />
      </span>
      <span class="block text-[10px] text-ink-soft md:hidden">Recibido</span>
    </div>

    <div class="hidden text-right md:block">
      <span class="tnum text-sm text-ink-soft">{{ formatCurrency(props.line.unitCost, 2, props.currency) }}</span>
    </div>

    <div class="text-right">
      <span class="tnum block text-sm font-medium text-ink">
        {{ formatCurrency(props.line.ordered * props.line.unitCost, 2, props.currency) }}
      </span>
      <span class="block text-[10px] text-ink-soft md:hidden">Subtotal</span>
    </div>
  </div>
</template>
