<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import { allNavItems } from '@/config/navigation'

const props = withDefaults(defineProps<{ shortcut?: boolean; autofocus?: boolean }>(), {
  shortcut: false,
  autofocus: false,
})

const query = ref('')
const input = ref<HTMLInputElement | null>(null)

const results = computed(() => {
  const term = query.value.trim().toLowerCase()
  if (!term) return []
  return allNavItems.filter((item) => item.label.toLowerCase().includes(term)).slice(0, 5)
})

function onKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    input.value?.focus()
  } else if (event.key === 'Escape' && document.activeElement === input.value) {
    query.value = ''
    input.value?.blur()
  }
}

onMounted(() => {
  if (props.shortcut) window.addEventListener('keydown', onKeydown)
  if (props.autofocus) input.value?.focus()
})

onUnmounted(() => {
  if (props.shortcut) window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="relative">
    <AppIcon name="search" :size="17" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft" />
    <input
      ref="input"
      v-model="query"
      type="search"
      aria-label="Buscar sección"
      placeholder="Buscar sección…"
      class="w-full rounded-sm border border-rail bg-surface py-2 pr-16 pl-9 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
    />
    <kbd
      class="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-sm border border-rail bg-paper px-1.5 py-0.5 font-data text-[10px] text-ink-soft"
    >
      Ctrl K
    </kbd>

    <div
      v-if="results.length"
      class="absolute inset-x-0 top-full z-40 mt-1 overflow-hidden rounded-sm border border-rail bg-surface shadow-[0_12px_30px_-24px_rgba(18,59,52,0.55)]"
    >
      <a
        v-for="item in results"
        :key="item.id"
        :href="`#/${item.id}`"
        class="flex items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-paper"
        @click="query = ''"
      >
        <AppIcon :name="item.icon" :size="16" class="text-ink-soft" />
        {{ item.label }}
      </a>
    </div>
  </div>
</template>
