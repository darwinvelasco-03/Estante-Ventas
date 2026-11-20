<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps<{ quantity: number; max: number; label: string }>()
const emit = defineEmits<{ 'update:quantity': [value: number] }>()

function onInput(event: Event) {
  emit('update:quantity', Number((event.target as HTMLInputElement).value))
}
</script>

<template>
  <div class="inline-flex items-center rounded-sm border border-rail bg-surface">
    <button
      type="button"
      class="flex size-8 items-center justify-center text-ink-soft transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
      :disabled="props.quantity <= 1"
      :aria-label="`Quitar una unidad de ${props.label}`"
      @click="emit('update:quantity', props.quantity - 1)"
    >
      <AppIcon name="minus" :size="14" />
    </button>
    <input
      type="number"
      min="1"
      :max="props.max"
      :value="props.quantity"
      :aria-label="`Cantidad de ${props.label}`"
      class="tnum w-10 border-x border-rail bg-transparent py-1 text-center text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink"
      @change="onInput"
    />
    <button
      type="button"
      class="flex size-8 items-center justify-center text-ink-soft transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
      :disabled="props.quantity >= props.max"
      :aria-label="`Agregar una unidad de ${props.label}`"
      @click="emit('update:quantity', props.quantity + 1)"
    >
      <AppIcon name="plus" :size="14" />
    </button>
  </div>
</template>
