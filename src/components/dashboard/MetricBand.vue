<script setup lang="ts">
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'

export interface BandMetric {
  label: string
  value: string
  hint: string
  tone?: 'default' | 'warn'
}

defineProps<{ metrics: BandMetric[]; loading?: boolean }>()
</script>

<template>
  <section
    class="grid grid-cols-2 divide-x divide-y divide-rail rounded-sm border border-rail bg-surface md:grid-cols-4 md:divide-y-0"
    aria-label="Indicadores de hoy"
  >
    <div v-for="metric in metrics" :key="metric.label" class="min-w-0 px-4 py-4 sm:px-5">
      <template v-if="loading">
        <SkeletonBlock class="h-3 w-20" />
        <SkeletonBlock class="mt-3 h-6 w-24" />
      </template>
      <template v-else>
        <p class="truncate text-xs text-ink-soft">{{ metric.label }}</p>
        <p
          class="tnum mt-1.5 font-display text-xl font-semibold tracking-tight sm:text-2xl"
          :class="metric.tone === 'warn' ? 'text-brick' : 'text-ink'"
        >
          {{ metric.value }}
        </p>
        <p class="mt-0.5 truncate text-[11px] text-ink-soft">{{ metric.hint }}</p>
      </template>
    </div>
  </section>
</template>
