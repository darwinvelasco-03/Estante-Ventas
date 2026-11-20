<script setup lang="ts">
import type { PeriodPreset } from '@/composables/useReportPeriod'

const props = defineProps<{
  preset: PeriodPreset
  from: string
  to: string
}>()

const emit = defineEmits<{
  'update:preset': [value: PeriodPreset]
  'update:from': [value: string]
  'update:to': [value: string]
}>()

const options: { id: PeriodPreset; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: '7d', label: '7 días' },
  { id: '30d', label: '30 días' },
  { id: 'todo', label: 'Todo' },
  { id: 'custom', label: 'Personalizado' },
]
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1" role="group" aria-label="Periodo del reporte">
      <button
        v-for="option in options"
        :key="option.id"
        type="button"
        class="text-xs transition-colors"
        :class="
          props.preset === option.id
            ? 'font-semibold text-ink underline decoration-2 underline-offset-4'
            : 'text-ink-soft hover:text-ink'
        "
        :aria-pressed="props.preset === option.id"
        @click="emit('update:preset', option.id)"
      >
        {{ option.label }}
      </button>
    </div>

    <div v-if="props.preset === 'custom'" class="flex items-center gap-2">
      <label for="report-from" class="text-[11px] text-ink-soft">Desde</label>
      <input
        id="report-from"
        :value="props.from"
        type="date"
        class="rounded-sm border border-rail bg-surface px-2 py-1.5 text-xs text-ink focus-visible:border-ink"
        @change="emit('update:from', ($event.target as HTMLInputElement).value)"
      />
      <label for="report-to" class="text-[11px] text-ink-soft">Hasta</label>
      <input
        id="report-to"
        :value="props.to"
        type="date"
        class="rounded-sm border border-rail bg-surface px-2 py-1.5 text-xs text-ink focus-visible:border-ink"
        @change="emit('update:to', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>
