<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import type { IconName } from '@/types/icons'

const actions: { label: string; detail: string; icon: IconName; href: string }[] = [
  { label: 'Cerrar caja', detail: 'Turno de mañana', icon: 'cash', href: '#/caja' },
  { label: 'Ajustar stock', detail: 'Corregir existencias', icon: 'inventory', href: '#/inventario' },
  { label: 'Ver reportes', detail: 'Ventas de la semana', icon: 'reports', href: '#/reportes' },
]
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
