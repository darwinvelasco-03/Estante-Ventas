<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import { branchOptions } from '@/config/branches'
import type { User } from '@/types/user'
import { formatMovementDate } from '@/utils/format'

const props = defineProps<{ user: User | null; isSelf: boolean }>()

const emit = defineEmits<{ edit: []; toggleActive: []; remove: [] }>()

const scope = () =>
  props.user?.role === 'superuser'
    ? 'Todas las sucursales y el resumen agregado'
    : (props.user?.branches
        .map((key) => branchOptions.find((option) => option.id === key)?.label ?? key)
        .join(', ') ?? '')
</script>

<template>
  <div>
    <StatePanel
      v-if="!props.user"
      icon="users"
      title="Selecciona un usuario"
      message="Abre una cuenta para revisar su perfil, las sucursales asignadas y sus permisos."
    />

    <template v-else>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="font-data text-[11px] tracking-wide text-ink-soft">Cuenta de acceso</p>
          <h3 class="mt-0.5 font-display text-lg font-semibold text-ink">{{ props.user.name }}</h3>
          <p class="mt-0.5 truncate text-xs text-ink-soft">{{ props.user.email }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <StatusTag
            :tone="props.user.role === 'superuser' ? 'ok' : 'neutral'"
            :label="props.user.role === 'superuser' ? 'Superusuario' : 'Usuario sucursal'"
          />
          <StatusTag
            :tone="props.user.active ? 'ok' : 'danger'"
            :label="props.user.active ? 'Activo' : 'Inactivo'"
          />
        </div>
      </div>

      <dl class="mt-5 divide-y divide-rail text-sm">
        <div class="flex items-center justify-between gap-3 py-2.5">
          <dt class="text-ink-soft">Correo de acceso</dt>
          <dd class="truncate font-medium text-ink">{{ props.user.email }}</dd>
        </div>
        <div class="flex items-start justify-between gap-3 py-2.5">
          <dt class="shrink-0 text-ink-soft">Alcance</dt>
          <dd class="text-right font-medium text-ink">{{ scope() }}</dd>
        </div>
        <div class="flex items-center justify-between gap-3 py-2.5">
          <dt class="text-ink-soft">Alta</dt>
          <dd class="tnum text-ink">{{ formatMovementDate(props.user.createdAt) }}</dd>
        </div>
      </dl>

      <div class="mt-4 rounded-sm bg-paper px-3 py-2.5">
        <p class="flex items-center gap-1.5 font-display text-xs font-semibold text-ink">
          <AppIcon name="check" :size="13" />
          Permisos
        </p>
        <p class="mt-1.5 text-xs leading-relaxed text-ink-soft">
          {{
            props.user.role === 'superuser'
              ? 'Puede ver el agregado de las dos sucursales, administrar cuentas y operar en Centro o Norte.'
              : 'Solo puede ver las sucursales asignadas. El agregado aparece únicamente si tiene ambas, y siempre es de lectura.'
          }}
        </p>
      </div>

      <div class="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 font-display text-xs font-semibold text-surface hover:bg-ink-soft"
          @click="emit('edit')"
        >
          <AppIcon name="users" :size="14" />
          Editar permisos
        </button>
        <button
          v-if="!props.isSelf"
          type="button"
          class="rounded-sm border border-rail px-3 py-2 text-xs text-ink hover:border-ink"
          @click="emit('toggleActive')"
        >
          {{ props.user.active ? 'Desactivar' : 'Activar' }}
        </button>
        <button
          v-if="!props.isSelf"
          type="button"
          class="rounded-sm border border-brick/30 px-3 py-2 text-xs text-brick hover:border-brick"
          @click="emit('remove')"
        >
          Eliminar
        </button>
      </div>

      <p v-if="props.isSelf" class="mt-3 text-[11px] text-ink-soft">
        Tu propia cuenta no se puede desactivar ni eliminar desde aquí.
      </p>
    </template>
  </div>
</template>
