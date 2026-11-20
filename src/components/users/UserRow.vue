<script setup lang="ts">
import StatusTag from '@/components/ui/StatusTag.vue'
import { branchOptions } from '@/config/branches'
import type { User } from '@/types/user'
import { userGrid } from './grid'

const props = defineProps<{ user: User; selected: boolean; isSelf: boolean }>()

const emit = defineEmits<{ select: [id: string]; edit: [id: string] }>()

const scope = () =>
  props.user.role === 'superuser'
    ? 'Todas'
    : props.user.branches
        .map((key) => branchOptions.find((option) => option.id === key)?.label.replace('Sucursal ', '') ?? key)
        .join(' · ')
</script>

<template>
  <div
    :class="[
      userGrid,
      'px-3 py-2.5 transition-colors',
      props.selected ? 'bg-paper' : 'hover:bg-paper/60',
    ]"
  >
    <button type="button" class="min-w-0 text-left" @click="emit('select', props.user.id)">
      <span class="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span class="truncate font-display text-sm font-semibold text-ink">{{ props.user.name }}</span>
        <span
          v-if="props.isSelf"
          class="rounded-sm bg-mint/15 px-1.5 py-0.5 text-[10px] font-medium text-ink"
        >
          Tú
        </span>
      </span>
      <span class="mt-0.5 block truncate font-data text-[11px] text-ink-soft">
        {{ props.user.email }}
      </span>
    </button>

    <span class="hidden md:block">
      <StatusTag
        :tone="props.user.role === 'superuser' ? 'ok' : 'neutral'"
        :label="props.user.role === 'superuser' ? 'Superusuario' : 'Sucursal'"
      />
    </span>

    <span class="hidden truncate text-xs text-ink-soft md:block">{{ scope() }}</span>
    <span class="hidden md:block">
      <StatusTag
        :tone="props.user.active ? 'ok' : 'danger'"
        :label="props.user.active ? 'Activo' : 'Inactivo'"
      />
    </span>

    <button
      type="button"
      class="justify-self-end rounded-sm border px-2 py-1 text-xs transition-colors"
      :class="
        props.selected ? 'border-ink bg-ink text-surface' : 'border-rail text-ink hover:border-ink'
      "
      :aria-label="`Editar permisos de ${props.user.name}`"
      @click="emit('edit', props.user.id)"
    >
      Editar
    </button>
  </div>
</template>
