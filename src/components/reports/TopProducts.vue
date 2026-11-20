<script setup lang="ts">
import type { TopProduct } from '@/composables/useReportData'
import { formatCurrency, formatNumber } from '@/utils/format'

const props = defineProps<{ products: TopProduct[] }>()

const max = () => props.products.reduce((peak, product) => Math.max(peak, product.revenue), 0)
</script>

<template>
  <section>
    <div class="mb-3 flex items-baseline justify-between gap-2">
      <h2 class="font-display text-base font-semibold text-ink">Productos más vendidos</h2>
      <span class="text-[11px] text-ink-soft">Por importe</span>
    </div>

    <p v-if="props.products.length === 0" class="rounded-sm bg-paper px-3 py-4 text-xs text-ink-soft">
      No hay ventas con productos en este periodo.
    </p>

    <ol v-else class="divide-y divide-rail border-y border-rail">
      <li
        v-for="(product, index) in props.products"
        :key="`${product.sku}:${product.name}`"
        class="flex items-center gap-3 py-2.5"
      >
        <span class="tnum flex size-6 shrink-0 items-center justify-center rounded-sm bg-paper text-[11px] font-semibold text-ink-soft">
          {{ index + 1 }}
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-medium text-ink">{{ product.name }}</p>
          <p class="text-[11px] text-ink-soft">
            {{ product.sku }} · {{ formatNumber(product.quantity) }} und
          </p>
          <div class="mt-1.5 h-1 overflow-hidden rounded-full bg-rail/70">
            <div
              class="h-full rounded-full bg-mint transition-[width] duration-300"
              :style="{ width: `${max() > 0 ? (product.revenue / max()) * 100 : 0}%` }"
            />
          </div>
        </div>
        <span class="tnum shrink-0 text-xs font-semibold text-ink">
          {{ formatCurrency(product.revenue) }}
        </span>
      </li>
    </ol>
  </section>
</template>
