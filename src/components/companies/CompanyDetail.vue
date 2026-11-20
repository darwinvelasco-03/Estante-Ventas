<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import type { Company } from '@/types/company'
import { formatMovementDate } from '@/utils/format'

const props = defineProps<{ company: Company | null; isActive: boolean }>()

const emit = defineEmits<{ edit: []; activate: []; remove: [] }>()
</script>

<template>
  <div>
    <StatePanel
      v-if="!props.company"
      icon="companies"
      title="Selecciona una empresa"
      message="Abre una razón social para revisar sus datos fiscales, de contacto y su estado."
    />

    <template v-else>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="font-data text-[11px] tracking-wide text-ink-soft">Razón social</p>
          <h3 class="mt-0.5 font-display text-lg font-semibold text-ink">
            {{ props.company.tradeName }}
          </h3>
          <p class="mt-0.5 text-xs leading-relaxed text-ink-soft">{{ props.company.legalName }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <StatusTag
            :tone="props.company.active ? 'ok' : 'neutral'"
            :label="props.company.active ? 'Activa' : 'Inactiva'"
          />
          <span
            v-if="props.isActive"
            class="inline-flex items-center gap-1.5 rounded-sm border border-mint/40 bg-mint/15 px-2 py-0.5 text-xs font-medium text-ink"
          >
            <AppIcon name="check" :size="12" />
            En uso
          </span>
        </div>
      </div>

      <dl class="mt-5 divide-y divide-rail text-sm">
        <div class="flex items-center justify-between gap-3 py-2.5">
          <dt class="text-ink-soft">Identificación fiscal</dt>
          <dd class="tnum font-medium text-ink">{{ props.company.taxId }}</dd>
        </div>
        <div class="flex items-center justify-between gap-3 py-2.5">
          <dt class="text-ink-soft">Teléfono</dt>
          <dd class="tnum font-medium text-ink">{{ props.company.phone || 'Sin registrar' }}</dd>
        </div>
        <div class="flex items-center justify-between gap-3 py-2.5">
          <dt class="text-ink-soft">Correo</dt>
          <dd class="truncate font-medium text-ink">{{ props.company.email || 'Sin registrar' }}</dd>
        </div>
        <div class="flex items-start justify-between gap-3 py-2.5">
          <dt class="shrink-0 text-ink-soft">Domicilio</dt>
          <dd class="text-right font-medium text-ink">
            {{ props.company.street || 'Sin registrar' }}
            <span v-if="props.company.city" class="block text-xs text-ink-soft">
              {{ props.company.city }}
            </span>
          </dd>
        </div>
        <div class="flex items-center justify-between gap-3 py-2.5">
          <dt class="text-ink-soft">Alta</dt>
          <dd class="tnum text-ink">{{ formatMovementDate(props.company.createdAt) }}</dd>
        </div>
      </dl>

      <div class="mt-4 rounded-sm bg-paper px-3 py-2.5">
        <p class="flex items-center gap-1.5 font-display text-xs font-semibold text-ink">
          <AppIcon name="companies" :size="13" />
          Empresa activa
        </p>
        <p class="mt-1.5 text-xs leading-relaxed text-ink-soft">
          Solo una empresa aparece en la cabecera. El cambio es inmediato y afecta a todas las
          sesiones de este navegador. Los datos siguen separados por sucursal; esta demo no aísla
          la información entre empresas.
        </p>
      </div>

      <div class="mt-5 flex flex-wrap gap-2">
        <button
          v-if="!props.isActive"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 font-display text-xs font-semibold text-surface hover:bg-ink-soft"
          @click="emit('activate')"
        >
          <AppIcon name="check" :size="14" />
          Marcar como activa
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-sm border border-rail px-3 py-2 text-xs text-ink hover:border-ink"
          @click="emit('edit')"
        >
          <AppIcon name="save" :size="14" />
          Editar datos
        </button>
        <button
          v-if="!props.isActive"
          type="button"
          class="rounded-sm border border-brick/30 px-3 py-2 text-xs text-brick hover:border-brick"
          @click="emit('remove')"
        >
          Eliminar
        </button>
      </div>
      <p v-if="props.isActive" class="mt-3 text-[11px] text-ink-soft">
        Cambia la empresa activa antes de eliminar o desactivar esta.
      </p>
    </template>
  </div>
</template>
