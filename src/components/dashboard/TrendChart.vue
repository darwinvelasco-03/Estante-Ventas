<script setup lang="ts">
import { computed } from 'vue'

import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'

const props = withDefaults(defineProps<{ values: number[]; loading?: boolean }>(), { loading: false })

const points = computed(() => {
  const values = props.values.length ? props.values : [0, 0]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const lastIndex = values.length - 1 || 1

  return values.map((value, index) => ({
    x: 20 + (index / lastIndex) * 560,
    y: 130 - ((value - min) / span) * 100,
  }))
})

const line = computed(() => points.value.map((point) => `${point.x},${point.y}`).join(' '))
const area = computed(() => `20,140 ${line.value} 580,140`)
const last = computed(() => points.value[points.value.length - 1] ?? { x: 580, y: 70 })
</script>

<template>
  <section class="border-b border-rail pb-5" aria-label="Tendencia de ventas">
    <div class="mb-3 flex items-baseline justify-between gap-3">
      <div>
        <h2 class="font-display text-base font-semibold text-ink">Tendencia de ventas</h2>
        <p class="text-xs text-ink-soft">Últimas 12 horas · sucursal seleccionada</p>
      </div>
      <span class="text-xs text-ink-soft">Hoy</span>
    </div>

    <SkeletonBlock v-if="loading" class="h-40 w-full" />
    <svg v-else viewBox="0 0 600 160" class="h-40 w-full" role="img" aria-label="Gráfica de ventas por hora">
      <line x1="20" y1="140" x2="580" y2="140" stroke="#D9DFD8" stroke-width="1" />
      <line x1="20" y1="90" x2="580" y2="90" stroke="#D9DFD8" stroke-width="1" stroke-dasharray="3 5" />
      <line x1="20" y1="40" x2="580" y2="40" stroke="#D9DFD8" stroke-width="1" stroke-dasharray="3 5" />
      <polygon :points="area" fill="#E7F1EB" />
      <polyline
        :points="line"
        fill="none"
        stroke="#123B34"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle :cx="last.x" :cy="last.y" r="5" fill="#123B34" stroke="#F4F6F3" stroke-width="3" />
    </svg>
  </section>
</template>
