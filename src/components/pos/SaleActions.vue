<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps<{ heldCount: number; disabled: boolean; canRestore?: boolean }>()
const emit = defineEmits<{ hold: []; restore: []; cancel: [] }>()
</script>

<template>
  <div class="space-y-2">
    <button
      type="button"
      class="flex w-full items-center gap-2 rounded-sm border border-rail bg-surface px-3 py-2.5 text-left text-sm text-ink transition-colors duration-150 hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="props.disabled"
      @click="emit('hold')"
    >
      <AppIcon name="save" :size="16" class="text-ink-soft" />
      Guardar en espera
    </button>

    <button
      v-if="props.heldCount > 0"
      type="button"
      class="flex w-full items-center gap-2 rounded-sm border border-mustard/50 bg-mustard-soft px-3 py-2.5 text-left text-sm text-ink transition-colors duration-150 hover:border-mustard disabled:cursor-not-allowed disabled:opacity-45"
      :disabled="props.canRestore === false"
      :title="props.canRestore === false ? 'Cierra o cancela la venta actual antes de recuperar otra' : undefined"
      @click="emit('restore')"
    >
      <AppIcon name="save" :size="16" />
      Recuperar venta ({{ props.heldCount }})
    </button>

    <button
      type="button"
      class="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-brick transition-colors duration-150 hover:bg-brick-soft disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="props.disabled"
      @click="emit('cancel')"
    >
      <AppIcon name="close" :size="16" />
      Cancelar venta
    </button>
  </div>
</template>
