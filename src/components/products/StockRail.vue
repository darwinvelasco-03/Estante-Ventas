<script setup lang="ts">
import { computed } from 'vue'

import { RESTOCK_THRESHOLD } from '@/composables/useProductFilters'

const props = withDefaults(defineProps<{ stock: number; max?: number }>(), { max: 40 })

const tone = computed(() =>
  props.stock <= 0 ? 'brick' : props.stock <= RESTOCK_THRESHOLD ? 'mustard' : 'ink',
)
const width = computed(() => `${Math.min(100, Math.max(0, (props.stock / props.max) * 100))}%`)

const barTones = { ink: 'bg-ink', mustard: 'bg-mustard', brick: 'bg-brick' }
const textTones = { ink: 'text-ink', mustard: 'text-mustard', brick: 'text-brick' }
</script>

<template>
  <span class="inline-flex items-center gap-2">
    <span class="relative h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-rail" aria-hidden="true">
      <span
        class="shelf-fill absolute inset-y-0 left-0 rounded-full"
        :class="barTones[tone]"
        :style="{ width }"
      />
    </span>
    <span class="tnum w-6 text-right text-sm font-medium" :class="textTones[tone]">
      {{ props.stock }}
    </span>
  </span>
</template>
