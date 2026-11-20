<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps<{ branch: string; branches: string[] }>()

const emit = defineEmits<{ change: [value: string] }>()

/** Con una sola sucursal no hay nada que cambiar: se muestra como etiqueta fija. */
const canSwitch = computed(() => props.branches.length > 1)
const shortBranch = computed(() => props.branch.replace(/^Sucursal\s+/, ''))

const menuOpen = ref(false)

function choose(value: string) {
  emit('change', value)
  menuOpen.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') menuOpen.value = false
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="shrink-0 px-3 py-4">
    <div
      v-if="!canSwitch"
      class="flex items-center gap-2 rounded-sm border border-white/10 bg-ink-deep/60 px-2 py-2 text-[#C6D8CF] md:justify-center"
      :title="`Sucursal asignada: ${branch}`"
    >
      <AppIcon name="branches" :size="16" class="shrink-0 text-mint" />
      <span class="min-w-0 flex-1 truncate text-xs md:hidden lg:block">{{ shortBranch }}</span>
    </div>

    <template v-else>
      <label class="sr-only" for="branch-select">Sucursal activa</label>
      <div class="relative block md:hidden lg:block">
        <select
          id="branch-select"
          :value="branch"
          class="w-full appearance-none rounded-sm border border-white/15 bg-ink-deep py-2 pr-8 pl-3 text-sm text-surface focus-visible:outline-mint"
          @change="emit('change', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="option in branches" :key="option" :value="option">{{ option }}</option>
        </select>
        <AppIcon name="chevron" :size="14" class="pointer-events-none absolute top-2.5 right-2 text-mint" />
      </div>

      <button
        type="button"
        class="hidden size-10 items-center justify-center rounded-sm border border-white/15 bg-ink-deep text-mint md:flex lg:hidden"
        :aria-label="`Sucursal activa: ${branch}. Cambiar sucursal`"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        <AppIcon name="branches" :size="18" />
      </button>

      <div v-if="menuOpen" class="fixed inset-0 z-[60] md:block lg:hidden" @click="menuOpen = false">
        <div
          class="absolute top-20 left-3 w-56 rounded-sm border border-white/15 bg-ink-deep p-1.5 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.9)]"
          @click.stop
        >
          <p class="px-2 py-1.5 font-display text-[10px] font-semibold tracking-wide text-[#8FB0A3] uppercase">
            Cambiar sucursal
          </p>
          <button
            v-for="option in branches"
            :key="option"
            type="button"
            class="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-2 text-left text-sm transition-colors hover:bg-white/10"
            :class="option === branch ? 'text-mint' : 'text-surface'"
            @click="choose(option)"
          >
            <span class="truncate">{{ option }}</span>
            <AppIcon v-if="option === branch" name="check" :size="14" />
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
