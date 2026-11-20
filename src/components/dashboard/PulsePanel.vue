<script setup lang="ts">
import { computed } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import CurrencyText from '@/components/ui/CurrencyText.vue'
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import { formatCurrency } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    salesToday: number
    salesGoal: number
    salesDelta: number
    loading?: boolean
  }>(),
  { loading: false },
)

const progress = computed(() =>
  props.salesGoal > 0 ? Math.min(100, Math.round((props.salesToday / props.salesGoal) * 100)) : 0,
)
const missing = computed(() => Math.max(0, props.salesGoal - props.salesToday))
</script>

<template>
  <section
    class="settle-in relative overflow-hidden rounded-sm border border-rail bg-surface px-5 py-5 shadow-[0_18px_40px_-34px_rgba(18,59,52,0.6)] sm:px-6 sm:py-6"
    aria-label="Ventas de hoy"
  >
    <span class="absolute inset-x-0 top-0 h-[3px] bg-ink" aria-hidden="true" />

    <template v-if="loading">
      <SkeletonBlock class="h-4 w-28" />
      <SkeletonBlock class="mt-4 h-10 w-56" />
      <SkeletonBlock class="mt-6 h-2 w-full" />
    </template>

    <template v-else>
      <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <p class="text-sm text-ink-soft">Ventas de hoy</p>
          <div class="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <CurrencyText
              :value="salesToday"
              class="font-display text-[clamp(1.9rem,1.4rem+1.6vw,2.6rem)] leading-none font-bold tracking-tight text-ink"
            />
            <span
              class="inline-flex items-center gap-1.5 text-sm font-medium"
              :class="salesDelta >= 0 ? 'text-ok' : 'text-brick'"
            >
              <AppIcon :name="salesDelta >= 0 ? 'arrow-up' : 'arrow-down'" :size="16" />
              {{ Math.abs(salesDelta) }}% vs ayer
            </span>
          </div>
        </div>

        <div class="w-full sm:w-64">
          <div class="mb-2 flex items-baseline justify-between gap-3 text-xs">
            <span class="text-ink-soft">Meta diaria</span>
            <span class="tnum font-semibold text-ink">{{ progress }}%</span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-rail/70">
            <div
              class="shelf-fill h-full rounded-full bg-ink"
              :style="{ width: `${progress}%` }"
              role="progressbar"
              :aria-valuenow="progress"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Avance de la meta diaria"
            />
          </div>
          <p class="mt-2 text-xs text-ink-soft">
            <template v-if="salesGoal <= 0">Aún no hay meta registrada para hoy</template>
            <template v-else-if="missing > 0">Faltan {{ formatCurrency(missing) }} para alcanzar la meta</template>
            <template v-else>Meta alcanzada</template>
          </p>
        </div>
      </div>
    </template>
  </section>
</template>
