<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps<{
  query: string
  category: string
  categories: string[]
  onlyRestock: boolean
  restockCount: number
}>()

const emit = defineEmits<{
  'update:query': [value: string]
  'update:category': [value: string]
  'update:onlyRestock': [value: boolean]
}>()
</script>

<template>
  <div class="space-y-3">
    <div class="relative">
      <AppIcon
        name="search"
        :size="16"
        class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft"
      />
      <input
        id="product-search"
        :value="props.query"
        type="search"
        autocomplete="off"
        placeholder="Buscar por nombre, SKU o código"
        class="w-full rounded-sm border border-rail bg-surface py-2 pr-3 pl-9 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
        @input="emit('update:query', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div class="flex flex-wrap gap-x-3 gap-y-1">
        <button
          v-for="option in props.categories"
          :key="option"
          type="button"
          class="text-xs transition-colors"
          :class="
            props.category === option
              ? 'font-semibold text-ink underline decoration-2 underline-offset-4'
              : 'text-ink-soft hover:text-ink'
          "
          :aria-pressed="props.category === option"
          @click="emit('update:category', option)"
        >
          {{ option }}
        </button>
      </div>

      <button
        type="button"
        class="ml-auto inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs transition-colors"
        :class="
          props.onlyRestock
            ? 'border-mustard bg-mustard-soft text-mustard'
            : 'border-rail text-ink-soft hover:border-ink'
        "
        :aria-pressed="props.onlyRestock"
        @click="emit('update:onlyRestock', !props.onlyRestock)"
      >
        <AppIcon name="alert" :size="13" />
        Por reponer
        <span class="tnum font-semibold">{{ props.restockCount }}</span>
      </button>
    </div>
  </div>
</template>
