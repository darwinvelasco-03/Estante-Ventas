<script setup lang="ts">
import { computed } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import type { IconName } from '@/types/icons'

interface QuickAction {
  label: string
  detail: string
  icon: IconName
  href: string
}

const props = withDefaults(defineProps<{ branchLabel: string; readOnly?: boolean }>(), {
  readOnly: false,
})

/** En el agregado no se puede escribir: las acciones pasan a ser de consulta. */
const actions = computed<QuickAction[]>(() => {
  if (props.readOnly) {
    return [
      { label: 'Consultar caja', detail: 'Agregado · solo lectura', icon: 'cash', href: '#/caja' },
      { label: 'Consultar stock', detail: 'Agregado · solo lectura', icon: 'inventory', href: '#/inventario' },
      { label: 'Ver reportes', detail: 'Agregado · solo lectura', icon: 'reports', href: '#/reportes' },
    ]
  }
  return [
    { label: 'Cerrar caja', detail: `Turno de hoy · ${props.branchLabel}`, icon: 'cash', href: '#/caja' },
    { label: 'Ajustar stock', detail: `Existencias de ${props.branchLabel}`, icon: 'inventory', href: '#/inventario' },
    { label: 'Ver reportes', detail: `Ventas de la semana · ${props.branchLabel}`, icon: 'reports', href: '#/reportes' },
  ]
})
</script>

<template>
  <section aria-label="Acciones rápidas">
    <h2 class="mb-3 font-display text-base font-semibold text-ink">Acciones rápidas</h2>
    <div class="divide-y divide-rail border-y border-rail">
      <a
        v-for="action in actions"
        :key="action.label"
        :href="action.href"
        class="group flex items-center gap-3 py-2.5 transition-colors duration-150 hover:text-ink"
      >
        <span
          class="flex size-7 shrink-0 items-center justify-center rounded-sm border border-rail text-ink-soft transition-colors duration-150 group-hover:border-ink group-hover:bg-ink group-hover:text-mint"
        >
          <AppIcon :name="action.icon" :size="15" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-medium text-ink">{{ action.label }}</span>
          <span class="block truncate text-[11px] text-ink-soft">{{ action.detail }}</span>
        </span>
        <AppIcon name="chevron" :size="14" class="-rotate-90 text-ink-soft group-hover:text-ink" />
      </a>
    </div>
  </section>
</template>
