<script setup lang="ts">
import type { ReportSlice } from '@/composables/useReportData'
import { formatCurrency, formatPercent } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    title: string
    slices: ReportSlice[]
    accent?: 'ink' | 'mustard'
    emptyMessage?: string
  }>(),
  { accent: 'ink', emptyMessage: 'Sin datos en este periodo.' },
)
</script>

<template>
  <section class="border-b border-rail pb-5 last:border-b-0 last:pb-0">
    <h2 class="mb-3 font-display text-base font-semibold text-ink">{{ props.title }}</h2>

    <p v-if="props.slices.length === 0" class="rounded-sm bg-paper px-3 py-4 text-xs text-ink-soft">
      {{ props.emptyMessage }}
    </p>

    <ul v-else class="space-y-3">
      <li v-for="slice in props.slices" :key="slice.label">
        <div class="flex items-baseline justify-between gap-3 text-xs">
          <span class="truncate font-medium text-ink">{{ slice.label }}</span>
          <span class="tnum shrink-0 text-ink">{{ formatCurrency(slice.value) }}</span>
        </div>
        <div class="mt-1.5 flex items-center gap-2">
          <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-rail/70">
            <div
              class="h-full rounded-full transition-[width] duration-300"
              :class="props.accent === 'mustard' ? 'bg-mustard' : 'bg-ink'"
              :style="{ width: `${Math.max(2, slice.share)}%` }"
            />
          </div>
          <span class="tnum w-9 text-right text-[10px] text-ink-soft">
            {{ formatPercent(Math.round(slice.share)) }}
          </span>
        </div>
      </li>
    </ul>
  </section>
</template>
