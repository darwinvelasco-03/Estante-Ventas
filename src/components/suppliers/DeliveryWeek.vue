<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ days: number[]; align?: 'start' | 'end' }>(), {
  align: 'start',
})

const letters = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const dayNames = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo',
]

const description = computed(() =>
  props.days.length === 0
    ? 'Sin días de entrega registrados'
    : `Entrega: ${props.days.map((day) => dayNames[day - 1]).join(', ')}`,
)
</script>

<template>
  <span class="flex flex-col gap-1" :class="props.align === 'end' ? 'items-end' : 'items-start'">
    <span class="sr-only">{{ description }}</span>
    <span class="flex gap-0.5" aria-hidden="true">
      <span
        v-for="(letter, index) in letters"
        :key="index"
        class="flex size-5 items-center justify-center border text-[10px] font-medium"
        :class="
          props.days.includes(index + 1)
            ? 'border-ink bg-ink text-surface'
            : 'border-rail text-ink-soft'
        "
      >
        {{ letter }}
      </span>
    </span>
    <span class="text-[10px] text-ink-soft">
      {{ props.days.length === 0 ? 'Sin entrega' : `${props.days.length} días` }}
    </span>
  </span>
</template>
