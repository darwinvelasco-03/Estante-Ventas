<script setup lang="ts">
import { computed } from 'vue'

import { formatVisitParts } from '@/utils/format'

const props = defineProps<{ received: boolean; date: string | null }>()

const label = computed(() => (props.received ? 'RECIBIDO' : 'PENDIENTE'))
const detail = computed(() =>
  props.received && props.date
    ? formatVisitParts(props.date).full
    : 'Falta registrar la recepción',
)
</script>

<template>
  <span class="flex flex-col items-start gap-0.5 md:items-end">
    <span
      class="inline-flex items-center gap-1.5 border px-2 py-0.5 font-display text-[10px] font-bold tracking-[0.14em]"
      :class="
        props.received
          ? 'border-ok/50 bg-ok-soft text-ink'
          : 'border-mustard/50 bg-mustard-soft text-mustard'
      "
      :title="detail"
    >
      <span aria-hidden="true">{{ props.received ? '✓' : '○' }}</span>
      {{ label }}
    </span>
    <span class="text-[10px] text-ink-soft">
      {{ props.received && props.date ? formatVisitParts(props.date).full : 'sin recibir' }}
    </span>
  </span>
</template>
