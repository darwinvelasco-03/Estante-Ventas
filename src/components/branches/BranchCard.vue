<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import { folioPrefixes } from '@/stores/branchProfiles'
import type { BranchProfile } from '@/types/branchProfile'

const props = defineProps<{ profile: BranchProfile }>()

const emit = defineEmits<{ edit: [id: BranchProfile['id']] }>()
</script>

<template>
  <article class="flex flex-col rounded-sm border border-rail bg-surface">
    <div class="flex items-center justify-between gap-3 border-b border-rail bg-paper px-4 py-3">
      <div class="flex items-center gap-2.5">
        <span class="flex size-8 items-center justify-center rounded-sm bg-ink text-mint" aria-hidden="true">
          <AppIcon name="branches" :size="16" />
        </span>
        <div>
          <p class="font-data text-[10px] tracking-[0.14em] text-ink-soft uppercase">
            {{ props.profile.code }} · {{ props.profile.id }}
          </p>
          <h3 class="font-display text-base font-semibold text-ink">{{ props.profile.name }}</h3>
        </div>
      </div>
      <StatusTag
        :tone="props.profile.status === 'operativa' ? 'ok' : 'warn'"
        :label="props.profile.status === 'operativa' ? 'Operativa' : 'En pausa'"
      />
    </div>

    <dl class="flex-1 divide-y divide-rail px-4 text-sm">
      <div class="flex items-start justify-between gap-3 py-2.5">
        <dt class="shrink-0 text-ink-soft">Domicilio</dt>
        <dd class="text-right font-medium text-ink">
          {{ props.profile.street }}
          <span v-if="props.profile.city" class="block text-xs text-ink-soft">
            {{ props.profile.city }}
          </span>
        </dd>
      </div>
      <div class="flex items-center justify-between gap-3 py-2.5">
        <dt class="text-ink-soft">Responsable</dt>
        <dd class="font-medium text-ink">{{ props.profile.manager }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3 py-2.5">
        <dt class="text-ink-soft">Horario</dt>
        <dd class="text-right text-xs font-medium text-ink">{{ props.profile.schedule || 'Sin definir' }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3 py-2.5">
        <dt class="text-ink-soft">Contacto</dt>
        <dd class="text-right text-xs font-medium text-ink">
          <span class="block tnum">{{ props.profile.phone || 'Sin teléfono' }}</span>
          <span class="block truncate">{{ props.profile.email || 'Sin correo' }}</span>
        </dd>
      </div>
      <div class="py-2.5">
        <dt class="text-ink-soft">Folios</dt>
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
      <div v-if="props.profile.note" class="py-2.5">
        <dt class="sr-only">Nota</dt>
        <dd class="text-xs leading-relaxed text-ink-soft">{{ props.profile.note }}</dd>
      </div>
    </dl>

    <div class="border-t border-rail px-4 py-3">
      <button
        type="button"
        class="inline-flex w-full items-center justify-center gap-1.5 rounded-sm border border-rail px-3 py-2 font-display text-xs font-semibold text-ink transition-colors hover:border-ink hover:bg-paper"
        @click="emit('edit', props.profile.id)"
      >
        <AppIcon name="save" :size="14" />
        Editar ficha
      </button>
    </div>
  </article>
</template>
