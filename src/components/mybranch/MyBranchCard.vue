<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import { folioPrefixes } from '@/stores/branchProfiles'
import type { BranchProfile } from '@/types/branchProfile'
import type { IconName } from '@/types/icons'

const props = defineProps<{ profile: BranchProfile; isActive: boolean }>()

const emit = defineEmits<{ select: [id: BranchProfile['id']] }>()

const shortcuts: { label: string; icon: IconName; href: string }[] = [
  { label: 'Vender', icon: 'pos', href: '#/pos' },
  { label: 'Caja', icon: 'cash', href: '#/caja' },
  { label: 'Inventario', icon: 'inventory', href: '#/inventario' },
  { label: 'Reportes', icon: 'reports', href: '#/reportes' },
]
</script>

<template>
  <article
    class="overflow-hidden rounded-sm border bg-surface"
    :class="props.isActive ? 'border-ink' : 'border-rail'"
  >
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-rail bg-paper px-4 py-3">
      <div class="flex items-center gap-2.5">
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-sm"
          :class="props.isActive ? 'bg-ink text-mint' : 'bg-rail text-ink'"
          aria-hidden="true"
        >
          <AppIcon name="branches" :size="16" />
        </span>
        <div>
          <p class="font-data text-[10px] tracking-[0.14em] text-ink-soft uppercase">
            {{ props.profile.code }} · {{ props.profile.id }}
          </p>
          <h3 class="font-display text-base font-semibold text-ink">{{ props.profile.name }}</h3>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <StatusTag
          :tone="props.profile.status === 'operativa' ? 'ok' : 'warn'"
          :label="props.profile.status === 'operativa' ? 'Operativa' : 'En pausa'"
        />
        <span
          v-if="props.isActive"
          class="inline-flex items-center gap-1.5 rounded-sm border border-ink bg-ink px-2 py-0.5 text-[11px] font-medium text-surface"
        >
          <AppIcon name="check" :size="12" />
          Sucursal activa
        </span>
      </div>
    </div>

    <dl class="divide-y divide-rail px-4 text-sm">
      <div class="flex items-start justify-between gap-3 py-2.5">
        <dt class="shrink-0 text-ink-soft">Responsable</dt>
        <dd class="text-right font-medium text-ink">{{ props.profile.manager }}</dd>
      </div>
      <div class="flex items-start justify-between gap-3 py-2.5">
        <dt class="shrink-0 text-ink-soft">Domicilio</dt>
        <dd class="text-right font-medium text-ink">
          {{ props.profile.street }}
          <span v-if="props.profile.city" class="block text-xs text-ink-soft">
            {{ props.profile.city }}
          </span>
        </dd>
      </div>
      <div class="flex items-start justify-between gap-3 py-2.5">
        <dt class="shrink-0 text-ink-soft">Horario</dt>
        <dd class="text-right text-xs font-medium text-ink">{{ props.profile.schedule || 'Sin definir' }}</dd>
      </div>
      <div class="flex items-start justify-between gap-3 py-2.5">
        <dt class="shrink-0 text-ink-soft">Contacto</dt>
        <dd class="text-right text-xs font-medium text-ink">
          <span class="block tnum">{{ props.profile.phone || 'Sin teléfono' }}</span>
          <span class="block truncate">{{ props.profile.email || 'Sin correo' }}</span>
        </dd>
      </div>
      <div class="py-2.5">
        <dt class="text-ink-soft">Series de folio</dt>
        <dd class="mt-1.5 flex flex-wrap gap-1.5">
          <span
            v-for="(value, key) in folioPrefixes(props.profile.id)"
            :key="key"
            class="tnum rounded-sm bg-paper px-1.5 py-0.5 text-[11px] text-ink-soft"
          >
            {{ value }}
          </span>
        </dd>
      </div>
    </dl>

    <div class="border-t border-rail px-4 py-3">
      <p class="mb-2 font-display text-[11px] font-semibold tracking-wide text-ink-soft uppercase">
        Operar en esta sucursal
      </p>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <a
          v-for="shortcut in shortcuts"
          :key="shortcut.label"
          :href="shortcut.href"
          class="flex items-center justify-center gap-1.5 rounded-sm border border-rail px-2 py-2 text-xs font-medium text-ink transition-colors hover:border-ink hover:bg-paper"
        >
          <AppIcon :name="shortcut.icon" :size="14" />
          {{ shortcut.label }}
        </a>
      </div>
      <button
        v-if="!props.isActive"
        type="button"
        class="mt-3 w-full rounded-sm bg-ink px-3 py-2 font-display text-xs font-semibold text-surface hover:bg-ink-soft"
        @click="emit('select', props.profile.id)"
      >
        Cambiar a {{ props.profile.name }}
      </button>
      <p v-else class="mt-3 text-center text-[11px] text-ink-soft">
        Los movimientos que registres se guardan en esta sucursal.
      </p>
    </div>
  </article>
</template>
