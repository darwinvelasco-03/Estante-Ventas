<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import type { LedgerEntry } from '@/types/reversal'
import { formatCurrency, formatMovementDate } from '@/utils/format'

const props = defineProps<{ open: boolean; entry: LedgerEntry | null }>()
const emit = defineEmits<{ close: []; confirm: [reason: string] }>()

const reason = ref('')
const reasonInput = ref<HTMLTextAreaElement | null>(null)
const dialog = ref<HTMLElement | null>(null)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    reason.value = ''
    nextTick(() => reasonInput.value?.focus())
  },
)

function onKeydown(event: KeyboardEvent) {
  if (!props.open) return
  if (event.key === 'Escape') {
    emit('close')
    return
  }
  if (event.key !== 'Tab' || !dialog.value) return
  const focusable = Array.from(
    dialog.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), textarea:not([disabled])',
    ),
  )
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first || !last) return
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

function submit() {
  emit('confirm', reason.value.trim())
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.open && props.entry"
      class="fixed inset-0 z-[60] flex items-end justify-center bg-ink/50 sm:items-center sm:p-4"
      @click.self="emit('close')"
    >
      <div
        ref="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reversal-title"
        class="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-sm border border-rail bg-surface p-5 shadow-[0_24px_60px_-30px_rgba(18,59,52,0.7)] sm:rounded-sm"
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="reversal-title" class="font-display text-lg font-semibold text-ink">
              Anular movimiento
            </h2>
            <p class="mt-0.5 text-xs text-ink-soft">
              El registro se conserva y se compensa con un ajuste.
            </p>
          </div>
          <button
            type="button"
            class="rounded-sm p-1 text-ink-soft hover:bg-paper hover:text-ink"
            aria-label="Cerrar"
            @click="emit('close')"
          >
            <AppIcon name="close" :size="18" />
          </button>
        </div>

        <div class="rounded-sm border border-rail bg-paper p-3">
          <p class="font-data text-[11px] tracking-wide text-ink-soft">
            {{ props.entry.folio }} · {{ formatMovementDate(props.entry.date) }}
          </p>
          <p class="mt-0.5 font-display text-sm font-semibold text-ink">
            {{ props.entry.title }}
          </p>
          <p class="mt-1 text-xs text-ink-soft">{{ props.entry.detail }}</p>
          <p
            v-if="props.entry.amount !== null"
            class="tnum mt-2 font-display text-base font-semibold text-ink"
          >
            {{ formatCurrency(props.entry.amount, 2, props.entry.currency) }}
          </p>
        </div>

        <p class="mt-3 rounded-sm border border-brick/30 bg-brick-soft px-3 py-2 text-xs leading-relaxed text-brick">
          No se borrará nada. El documento quedará marcado como anulado, se generará un
          contra-movimiento de inventario cuando corresponda y el importe se descontará con un
          ajuste en Caja y Reportes.
        </p>

        <form class="mt-4 space-y-4" @submit.prevent="submit">
          <div>
            <label for="reversal-reason" class="mb-1 block text-xs font-medium text-ink-soft">
              Motivo de la anulación
            </label>
            <textarea
              id="reversal-reason"
              ref="reasonInput"
              v-model="reason"
              rows="3"
              placeholder="Ej. Cobro duplicado, precio equivocado, gasto registrado dos veces"
              class="w-full resize-y rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
            />
            <p class="mt-1 text-[11px] text-ink-soft">
              Si lo dejas vacío se registrará «Corrección de registro».
            </p>
          </div>

          <div class="flex justify-end gap-2 pt-1">
            <button
              type="button"
              class="rounded-sm border border-rail px-3 py-2 text-sm text-ink hover:border-ink"
              @click="emit('close')"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="inline-flex items-center gap-1.5 rounded-sm bg-brick px-3 py-2 font-display text-sm font-semibold text-surface hover:bg-brick/85"
            >
              <AppIcon name="close" :size="15" />
              Confirmar anulación
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
