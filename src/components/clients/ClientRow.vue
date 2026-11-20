<script setup lang="ts">
import { computed } from 'vue'

import StatusTag from '@/components/ui/StatusTag.vue'
import type { Client } from '@/types/client'
import { clientGrid } from './grid'
import VisitSpine from './VisitSpine.vue'

const props = defineProps<{ client: Client; selected: boolean; readonly?: boolean }>()

const emit = defineEmits<{ select: [id: string]; edit: [id: string] }>()

const subline = computed(() =>
  [props.client.alias, props.client.note, props.client.phone].filter(Boolean).join(' · ') ||
  'Sin datos de contacto',
)
</script>

<template>
  <div
    :class="[
      clientGrid,
      'px-3 py-2.5 transition-colors',
      props.selected ? 'bg-paper' : 'hover:bg-paper/60',
    ]"
  >
    <VisitSpine :last-visit="props.client.lastVisit" />

    <button
      type="button"
      class="min-w-0 text-left"
      @click="emit('select', props.client.id)"
    >
      <span class="block truncate font-display text-sm font-semibold text-ink">
        {{ props.client.name }}
      </span>
      <span class="mt-0.5 block truncate text-[11px] text-ink-soft">{{ subline }}</span>
    </button>

    <span class="hidden truncate font-data text-xs text-ink-soft md:block">
      {{ props.client.phone || 'Sin teléfono' }}
    </span>

    <span class="hidden md:block">
      <StatusTag
        v-if="props.client.frequent"
        tone="warn"
        label="Frecuente"
      />
      <StatusTag
        v-else-if="!props.client.lastVisit"
        tone="danger"
        label="Sin visita"
      />
      <span v-else class="text-xs text-ink-soft">—</span>
    </span>

    <button
      v-if="!props.readonly"
      type="button"
      class="justify-self-end rounded-sm border px-2 py-1 text-xs transition-colors"
      :class="
        props.selected
          ? 'border-ink bg-ink text-surface'
          : 'border-rail text-ink hover:border-ink'
      "
      :aria-label="`Editar ficha de ${props.client.name}`"
      @click="emit('edit', props.client.id)"
    >
      Editar
    </button>
  </div>
</template>
