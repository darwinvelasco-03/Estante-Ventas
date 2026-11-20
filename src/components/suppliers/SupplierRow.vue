<script setup lang="ts">
import { computed } from 'vue'

import type { Supplier } from '@/types/supplier'
import { formatCurrency } from '@/utils/format'
import DeliveryWeek from './DeliveryWeek.vue'
import { supplierGrid } from './grid'

const props = defineProps<{ supplier: Supplier; selected: boolean; readonly?: boolean }>()

const emit = defineEmits<{ select: [id: string]; edit: [id: string] }>()

const subline = computed(() =>
  [props.supplier.line, props.supplier.note].filter(Boolean).join(' · ') || 'Sin línea registrada',
)
const minimum = computed(() =>
  props.supplier.minimum > 0 ? formatCurrency(props.supplier.minimum) : '—',
)
</script>

<template>
  <div
    :class="[
      supplierGrid,
      'px-3 py-2.5 transition-colors',
      props.selected ? 'bg-paper' : 'hover:bg-paper/60',
    ]"
  >
    <DeliveryWeek :days="props.supplier.deliveryDays" />

    <button type="button" class="min-w-0 text-left" @click="emit('select', props.supplier.id)">
      <span class="block truncate font-display text-sm font-semibold text-ink">
        {{ props.supplier.name }}
      </span>
      <span class="mt-0.5 block truncate text-[11px] text-ink-soft">{{ subline }}</span>
    </button>

    <span class="hidden truncate font-data text-xs text-ink-soft md:block">
      {{ props.supplier.phone || 'Sin teléfono' }}
    </span>

    <span class="hidden font-data text-xs text-ink md:block">{{ minimum }}</span>

    <button
      v-if="!props.readonly"
      type="button"
      class="justify-self-end rounded-sm border px-2 py-1 text-xs transition-colors"
      :class="
        props.selected
          ? 'border-ink bg-ink text-surface'
          : 'border-rail text-ink hover:border-ink'
      "
      :aria-label="`Editar ficha de ${props.supplier.name}`"
      @click="emit('edit', props.supplier.id)"
    >
      Editar
    </button>
  </div>
</template>
