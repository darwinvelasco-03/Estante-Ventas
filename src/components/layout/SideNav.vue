<script setup lang="ts">
import { computed } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import { navGroups } from '@/config/navigation'
import { platform } from '@/config/platform'
import { canManageUsers, currentUser, logout } from '@/stores/users'

const visibleGroups = computed(() =>
  navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.id !== 'usuarios' || canManageUsers.value),
    }))
    .filter((group) => group.items.length > 0),
)

const initials = computed(() => {
  const parts = (currentUser.value?.name ?? '').split(/\s+/).filter(Boolean).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'EU'
})

const roleLabel = computed(() =>
  currentUser.value?.role === 'superuser' ? 'Superusuario' : 'Usuario sucursal',
)

defineProps<{
  open: boolean
  active: string
  branch: string
  branches: string[]
}>()

const emit = defineEmits<{
  close: []
  'update:branch': [value: string]
}>()
</script>

<template>
  <aside
    aria-label="Navegación principal"
    class="fixed inset-y-0 left-0 z-50 flex w-[240px] flex-col bg-ink text-[#DCE8E1] transition-transform duration-200 md:w-[72px] md:translate-x-0 lg:w-[240px]"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4">
      <span class="flex size-8 shrink-0 items-center justify-center rounded-sm bg-mint/15" aria-hidden="true">
        <span class="flex flex-col gap-[3px]">
          <span class="block h-[2px] w-4 bg-mint" />
          <span class="block h-[2px] w-3 bg-mint" />
          <span class="block h-[2px] w-4 bg-mint" />
        </span>
      </span>
      <span class="block min-w-0 md:hidden lg:block">
        <span class="block font-display text-[15px] font-bold tracking-[0.1em] text-surface uppercase">
          {{ platform.brand }}
        </span>
        <span class="block font-display text-[10px] font-medium tracking-[0.16em] text-mint">
          {{ platform.tagline }}
        </span>
      </span>
      <button
        type="button"
        class="ml-auto rounded-sm p-1.5 text-[#DCE8E1] hover:bg-white/10 md:hidden"
        aria-label="Cerrar menú"
        @click="emit('close')"
      >
        <AppIcon name="close" :size="18" />
      </button>
    </div>

    <div class="shrink-0 px-3 py-4">
      <label class="sr-only" for="branch-select">Sucursal activa</label>
      <div class="relative block md:hidden lg:block">
        <select
          id="branch-select"
          :value="branch"
          class="w-full appearance-none rounded-sm border border-white/15 bg-ink-deep py-2 pr-8 pl-3 text-sm text-surface focus-visible:outline-mint"
          @change="emit('update:branch', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="option in branches" :key="option" :value="option">{{ option }}</option>
        </select>
        <AppIcon name="chevron" :size="14" class="pointer-events-none absolute top-2.5 right-2 text-mint" />
      </div>
      <button
        type="button"
        class="hidden size-10 items-center justify-center rounded-sm border border-white/15 bg-ink-deep text-mint md:flex lg:hidden"
        :aria-label="`Sucursal activa: ${branch}. Cambiar sucursal`"
      >
        <AppIcon name="branches" :size="18" />
      </button>
    </div>

    <nav class="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
      <div v-for="group in visibleGroups" :key="group.label" class="mb-5 last:mb-0">
        <p class="mb-2 block px-3 text-xs font-medium tracking-wide text-[#8FB0A3] md:hidden lg:block">
          {{ group.label }}
        </p>
        <ul class="space-y-0.5">
          <li v-for="item in group.items" :key="item.id">
            <a
              :href="`#/${item.id}`"
              :aria-label="item.label"
              :aria-current="item.id === active ? 'page' : undefined"
              class="group relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors duration-150 hover:bg-white/8"
              :class="item.id === active ? 'bg-white/10 text-surface' : 'text-[#C6D8CF] hover:text-surface'"
              @click="emit('close')"
            >
              <span
                class="absolute top-1/2 left-0 w-[3px] -translate-y-1/2 rounded-r-full bg-mint transition-all duration-150"
                :class="item.id === active ? 'h-6 opacity-100' : 'h-2 opacity-0 group-hover:opacity-60'"
                aria-hidden="true"
              />
              <AppIcon :name="item.icon" :size="18" class="shrink-0 text-mint/80 group-hover:text-mint" />
              <span class="inline md:hidden lg:inline">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>

    <div class="shrink-0 border-t border-white/10 p-3">
      <div class="flex items-center gap-3">
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint/15 font-display text-xs font-bold text-mint"
          aria-hidden="true"
        >
          {{ initials }}
        </span>
        <span class="min-w-0 flex-1 block md:hidden lg:block">
          <span class="block truncate text-sm font-medium text-surface">
            {{ currentUser?.name ?? 'Invitado' }}
          </span>
          <span class="block truncate text-xs text-[#8FB0A3]">{{ roleLabel }}</span>
        </span>
        <button
          type="button"
          class="rounded-sm p-1.5 text-[#8FB0A3] hover:bg-white/10 hover:text-surface"
          aria-label="Cerrar sesión"
          @click="logout"
        >
          <AppIcon name="logout" :size="17" />
        </button>
      </div>
    </div>
  </aside>
</template>
