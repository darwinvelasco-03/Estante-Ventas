<script setup lang="ts">
import { ref } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import CurrencySelect from '@/components/ui/CurrencySelect.vue'
import { activeCompany } from '@/stores/companies'
import GlobalSearch from './GlobalSearch.vue'

defineProps<{ branch: string; section: string }>()
const emit = defineEmits<{ toggleMenu: [] }>()

const mobileSearchOpen = ref(false)
</script>

<template>
  <header
    class="sticky top-0 z-30 border-b border-rail bg-paper/95 px-4 md:px-6 lg:px-8"
    :class="mobileSearchOpen ? '' : 'h-16'"
  >
    <div class="flex h-16 items-center gap-3">
      <button
        type="button"
        class="rounded-sm p-2 text-ink hover:bg-rail/60 md:hidden"
        aria-label="Abrir menú"
        @click="emit('toggleMenu')"
      >
        <AppIcon name="menu" :size="20" />
      </button>

      <div class="min-w-0">
        <p class="truncate text-xs text-ink-soft">
          {{ activeCompany?.tradeName ?? 'Sin empresa activa' }} · {{ branch }}
        </p>
        <h1 class="truncate font-display text-base font-semibold text-ink">{{ section }}</h1>
      </div>

      <div class="ml-auto hidden w-full max-w-sm sm:block">
        <GlobalSearch :shortcut="true" />
      </div>

      <button
        type="button"
        class="relative rounded-sm p-2 text-ink hover:bg-rail/60 sm:hidden"
        aria-label="Buscar"
        :aria-expanded="mobileSearchOpen"
        @click="mobileSearchOpen = !mobileSearchOpen"
      >
        <AppIcon name="search" :size="20" />
      </button>

      <CurrencySelect id="topbar-currency" />

      <button
        type="button"
        class="relative rounded-sm p-2 text-ink hover:bg-rail/60"
        aria-label="Notificaciones, 3 sin leer"
      >
        <AppIcon name="bell" :size="20" />
        <span class="absolute top-1.5 right-1.5 size-2 rounded-full bg-mustard ring-2 ring-paper" aria-hidden="true" />
      </button>

      <a
        href="#/pos"
        class="inline-flex shrink-0 items-center gap-2 rounded-sm bg-ink px-3 py-2 text-sm font-medium text-surface transition-colors duration-150 hover:bg-ink-soft active:translate-y-px"
      >
        <AppIcon name="plus" :size="17" />
        <span class="hidden sm:inline">Nueva venta</span>
      </a>
    </div>

    <div v-if="mobileSearchOpen" class="pb-3 sm:hidden">
      <GlobalSearch :autofocus="true" />
    </div>
  </header>
</template>
