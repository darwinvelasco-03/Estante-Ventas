<script setup lang="ts">
import SideNav from './SideNav.vue'
import TopBar from './TopBar.vue'

defineProps<{
  branch: string
  branches: string[]
  section: string
  active: string
  menuOpen: boolean
}>()

const emit = defineEmits<{
  toggleMenu: []
  closeMenu: []
  'update:branch': [value: string]
}>()
</script>

<template>
  <div class="min-h-screen bg-paper">
    <a
      href="#contenido"
      class="sr-only rounded-sm bg-ink px-3 py-2 text-sm text-surface focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60]"
    >
      Saltar al contenido
    </a>

    <SideNav
      :open="menuOpen"
      :active="active"
      :branch="branch"
      :branches="branches"
      @close="emit('closeMenu')"
      @update:branch="emit('update:branch', $event)"
    />

    <button
      v-if="menuOpen"
      type="button"
      class="fixed inset-0 z-40 cursor-default bg-ink/40 md:hidden"
      aria-label="Cerrar menú"
      @click="emit('closeMenu')"
    />

    <div class="min-h-screen md:pl-[72px] lg:pl-[240px]">
      <TopBar :branch="branch" :section="section" @toggle-menu="emit('toggleMenu')" />
      <main
        id="contenido"
        tabindex="-1"
        class="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 lg:px-8 lg:py-8"
      >
        <slot />
      </main>
    </div>
  </div>
</template>
