<script setup lang="ts">
import { ref } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import type { Product } from '@/types/pos'
import ProductResultRow from './ProductResultRow.vue'

interface Notice {
  text: string
  tone: 'ok' | 'error'
}

const props = defineProps<{
  query: string
  results: Product[]
  loading: boolean
  error: string | null
  notice: Notice | null
}>()

const emit = defineEmits<{
  'update:query': [value: string]
  search: [value: string]
  select: [product: Product]
  clear: []
  retry: []
}>()

const input = ref<HTMLInputElement | null>(null)

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update:query', value)
  emit('search', value)
}

function focus() {
  input.value?.focus()
  input.value?.select()
}

defineExpose({ focus })
</script>

<template>
  <div class="flex flex-col gap-3">
    <div>
      <label for="scanner" class="mb-1.5 block text-sm font-medium text-ink">
        Escanear o buscar producto
      </label>
      <div class="relative">
        <AppIcon name="barcode" :size="17" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft" />
        <input
          id="scanner"
          ref="input"
          :value="props.query"
          type="search"
          autocomplete="off"
          placeholder="Código de barras, SKU o nombre"
          class="w-full rounded-sm border border-rail bg-surface py-2.5 pr-14 pl-9 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
          @input="onInput"
          @keydown.enter.prevent="emit('search', props.query)"
        />
        <kbd
          class="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded-sm border border-rail bg-paper px-1.5 py-0.5 font-data text-[10px] text-ink-soft"
        >
          Enter
        </kbd>
      </div>
    </div>

    <p
      v-if="props.notice"
      class="flex items-start gap-1.5 text-xs"
      :class="props.notice.tone === 'ok' ? 'text-ok' : 'text-brick'"
      aria-live="polite"
    >
      <AppIcon :name="props.notice.tone === 'ok' ? 'check' : 'alert'" :size="14" class="mt-px shrink-0" />
      {{ props.notice.text }}
    </p>

    <div v-if="props.loading" class="space-y-2" aria-hidden="true">
      <SkeletonBlock v-for="row in 3" :key="row" class="h-11 w-full" />
    </div>

    <div
      v-else-if="props.error"
      class="rounded-sm border border-brick/30 bg-brick-soft px-3 py-3 text-sm text-brick"
    >
      <p class="flex items-start gap-2">
        <AppIcon name="alert" :size="16" class="mt-px shrink-0" />
        {{ props.error }}
      </p>
      <button type="button" class="mt-2 text-xs font-medium underline underline-offset-4" @click="emit('retry')">
        Reintentar
      </button>
    </div>

    <div v-else-if="!props.query" class="flex flex-col items-start gap-2 rounded-sm border border-dashed border-rail px-3 py-5">
      <AppIcon name="barcode" :size="22" class="text-ink-soft" />
      <p class="text-sm font-medium text-ink">Listo para escanear</p>
      <p class="text-xs leading-relaxed text-ink-soft">Usa el lector o escribe el código, SKU o nombre del producto.</p>
    </div>

    <div v-else-if="props.results.length === 0" class="rounded-sm border border-dashed border-rail px-3 py-5">
      <p class="text-sm font-medium text-ink">No encontramos ese producto</p>
      <p class="mt-1 text-xs text-ink-soft">Revisa el código o busca por nombre.</p>
      <button type="button" class="mt-2 text-xs font-medium text-ink underline underline-offset-4" @click="emit('clear')">
        Borrar búsqueda
      </button>
    </div>

    <div v-else class="overflow-hidden rounded-sm border border-rail">
      <ProductResultRow
        v-for="product in props.results"
        :key="product.id"
        :product="product"
        @select="emit('select', $event)"
      />
    </div>
  </div>
</template>
