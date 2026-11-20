<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import type { LowStockItem } from '@/types/dashboard'

defineProps<{ items: LowStockItem[]; loading?: boolean }>()
</script>

<template>
  <section aria-label="Inventario bajo">
    <div class="mb-3 flex items-baseline justify-between gap-3">
      <div>
        <h2 class="font-display text-base font-semibold text-ink">Inventario bajo</h2>
        <p class="text-xs text-ink-soft">Productos para reponer hoy</p>
      </div>
      <a href="#/inventario" class="shrink-0 text-xs font-medium text-ink underline-offset-4 hover:underline">
        Ver inventario
      </a>
    </div>

    <SkeletonBlock v-if="loading" class="h-24 w-full" />

    <StatePanel
      v-else-if="items.length === 0"
      icon="check"
      title="Todo cubierto"
      message="Ningún producto está por debajo de su mínimo."
    />

    <ul v-else class="divide-y divide-rail border-y border-rail">
      <li v-for="item in items" :key="item.sku" class="flex items-center gap-3 py-2.5">
        <span class="flex size-7 shrink-0 items-center justify-center rounded-sm bg-brick-soft text-brick">
          <AppIcon name="alert" :size="15" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm text-ink">{{ item.name }}</span>
          <span class="block truncate text-[11px] text-ink-soft">{{ item.sku }} · mínimo {{ item.threshold }}</span>
        </span>
        <span class="shrink-0 text-xs font-semibold text-brick">
          {{ item.remaining }} {{ item.unit }}
        </span>
      </li>
    </ul>
  </section>
</template>
