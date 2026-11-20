<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    tone?: 'ok' | 'warn' | 'danger' | 'neutral'
    label: string
  }>(),
  { tone: 'neutral' },
)

const tones = {
  ok: 'bg-ok-soft text-ink border-ok/30',
  warn: 'bg-mustard-soft text-ink border-mustard/40',
  danger: 'bg-brick-soft text-brick border-brick/30',
  neutral: 'bg-paper text-ink-soft border-rail',
} as const

const classes = computed(() => tones[props.tone])
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium"
    :class="classes"
  >
    <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
    {{ label }}
  </span>
</template>
