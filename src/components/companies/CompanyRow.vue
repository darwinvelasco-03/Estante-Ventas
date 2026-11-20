<script setup lang="ts">
import StatusTag from '@/components/ui/StatusTag.vue'
import type { Company } from '@/types/company'
import { companyGrid } from './grid'

const props = defineProps<{ company: Company; selected: boolean; isActive: boolean }>()

const emit = defineEmits<{ select: [id: string]; edit: [id: string] }>()
</script>

<template>
  <div
    :class="[
      companyGrid,
      'px-3 py-2.5 transition-colors',
      props.selected ? 'bg-paper' : 'hover:bg-paper/60',
    ]"
  >
    <button type="button" class="min-w-0 text-left" @click="emit('select', props.company.id)">
      <span class="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span class="truncate font-display text-sm font-semibold text-ink">
          {{ props.company.tradeName }}
        </span>
        <span
          v-if="props.isActive"
          class="rounded-sm bg-mint/15 px-1.5 py-0.5 text-[10px] font-medium text-ink"
        >
          Activa
        </span>
      </span>
      <span class="mt-0.5 block truncate text-[11px] text-ink-soft">
        {{ props.company.legalName }}
      </span>
    </button>

    <span class="hidden truncate font-data text-[11px] text-ink-soft md:block">
      {{ props.company.taxId }}
    </span>
    <span class="hidden truncate text-xs text-ink-soft md:block">
      {{ props.company.city || 'Sin ciudad' }}
    </span>
    <span class="hidden md:block">
      <StatusTag
        :tone="props.company.active ? 'ok' : 'neutral'"
        :label="props.company.active ? 'Activa' : 'Inactiva'"
      />
    </span>

    <button
      type="button"
      class="justify-self-end rounded-sm border px-2 py-1 text-xs transition-colors"
      :class="
        props.selected ? 'border-ink bg-ink text-surface' : 'border-rail text-ink hover:border-ink'
      "
      :aria-label="`Editar ${props.company.legalName}`"
      @click="emit('edit', props.company.id)"
    >
      Editar
    </button>
  </div>
</template>
