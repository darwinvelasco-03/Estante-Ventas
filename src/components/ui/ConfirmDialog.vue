<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

import AppIcon from './AppIcon.vue'

const props = withDefaults(
  defineProps<{
    title: string
    message: string
    confirmLabel: string
    cancelLabel?: string
    tone?: 'neutral' | 'danger'
  }>(),
  { cancelLabel: 'Volver', tone: 'neutral' },
)

const emit = defineEmits<{ confirm: []; cancel: [] }>()
const confirmButton = ref<HTMLButtonElement | null>(null)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('cancel')
}

onMounted(() => {
  confirmButton.value?.focus()
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[70] flex items-center justify-center bg-ink/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        class="w-full max-w-sm rounded-sm border border-rail bg-surface p-5 shadow-[0_24px_60px_-30px_rgba(18,59,52,0.7)]"
      >
        <div class="flex items-start gap-3">
          <span
            class="flex size-9 shrink-0 items-center justify-center rounded-full"
            :class="props.tone === 'danger' ? 'bg-brick-soft text-brick' : 'bg-mustard-soft text-mustard'"
            aria-hidden="true"
          >
            <AppIcon name="alert" :size="18" />
          </span>
          <div>
            <h2 id="confirm-dialog-title" class="font-display text-base font-semibold text-ink">
              {{ props.title }}
            </h2>
            <p class="mt-1 text-sm leading-relaxed text-ink-soft">{{ props.message }}</p>
          </div>
        </div>
        <div class="mt-5 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-sm border border-rail px-3 py-2 text-sm text-ink hover:border-ink"
            @click="emit('cancel')"
          >
            {{ props.cancelLabel }}
          </button>
          <button
            ref="confirmButton"
            type="button"
            class="rounded-sm px-3 py-2 text-sm font-medium text-surface focus-visible:outline-surface"
            :class="props.tone === 'danger' ? 'bg-brick hover:bg-brick/85' : 'bg-ink hover:bg-ink-soft'"
            @click="emit('confirm')"
          >
            {{ props.confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
