<script setup lang="ts">
import { computed } from 'vue'

import { formatVisitParts } from '@/utils/format'

const props = defineProps<{ lastVisit: string | null }>()

const parts = computed(() => formatVisitParts(props.lastVisit))
</script>

<template>
  <span
    class="flex h-full min-h-12 w-[46px] shrink-0 flex-col items-center justify-center border-r border-rail py-2 md:w-[56px]"
  >
    <span class="font-display text-lg leading-none font-semibold text-ink">{{ parts.day }}</span>
    <span class="mt-1 max-w-full text-center text-[10px] leading-tight text-ink-soft">
      {{ parts.month }}
    </span>
  </span>
</template>
