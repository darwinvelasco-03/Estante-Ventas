<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import type { IconName } from '@/types/icons'

withDefaults(
  defineProps<{
    icon: IconName
    title: string
    message: string
    tone?: 'neutral' | 'danger'
  }>(),
  { tone: 'neutral' },
)
</script>

<template>
  <div class="flex flex-col items-start gap-3 px-6 py-10 sm:items-center sm:text-center">
    <span
      class="flex size-10 items-center justify-center rounded-full border"
      :class="tone === 'danger' ? 'border-brick/30 bg-brick-soft text-brick' : 'border-rail bg-paper text-ink-soft'"
    >
      <AppIcon :name="icon" :size="20" />
    </span>
    <div class="space-y-1">
      <p class="font-display text-base font-semibold text-ink">{{ title }}</p>
      <p class="max-w-sm text-sm leading-relaxed text-ink-soft">{{ message }}</p>
    </div>
    <slot />
  </div>
</template>
