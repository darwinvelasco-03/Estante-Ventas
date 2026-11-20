<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import { formatCurrency } from '@/utils/format'
import type { Purchase } from '@/types/purchase'

const props = defineProps<{ open: boolean; purchase: Purchase | null }>()

const emit = defineEmits<{
  close: []
  receive: [id: string, quantities: Record<string, number>]
}>()

const quantities = ref<Record<string, number>>({})
const dialog = ref<HTMLElement | null>(null)
const firstInput = ref<HTMLInputElement | null>(null)

const pendingLines = ref<{ id: string; name: string; sku: string; pending: number; unitCost: number }[]>([])

watch(
  () => props.open,
  (open) => {
    if (!open || !props.purchase) return
    pendingLines.value = props.purchase.lines
      .filter((line) => line.received < line.ordered)
      .map((line) => ({
        id: line.id,
        name: line.name,
        sku: line.sku,
        pending: line.ordered - line.received,
        unitCost: line.unitCost,
      }))
    quantities.value = Object.fromEntries(pendingLines.value.map((line) => [line.id, line.pending]))
    nextTick(() => firstInput.value?.focus())
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
      'button:not([disabled]), input:not([disabled]), select:not([disabled])',
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

const total = () =>
  pendingLines.value.reduce(
    (sum, line) => sum + (Number(quantities.value[line.id]) || 0) * line.unitCost,
    0,
  )

const canSubmit = () => pendingLines.value.some((line) => (Number(quantities.value[line.id]) || 0) > 0)

function submit() {
  if (!props.purchase || !canSubmit()) return
  emit('receive', props.purchase.id, { ...quantities.value })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.open && props.purchase"
      class="fixed inset-0 z-[60] flex items-end justify-center bg-ink/50 sm:items-center sm:p-4"
      @click.self="emit('close')"
    >
      <div
        ref="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receive-sheet-title"
        class="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-sm border border-rail bg-surface p-5 shadow-[0_24px_60px_-30px_rgba(18,59,52,0.7)] sm:rounded-sm"
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="receive-sheet-title" class="font-display text-lg font-semibold text-ink">
              Registrar recepción
            </h2>
            <p class="mt-0.5 text-xs text-ink-soft">
              {{ props.purchase.folio }} · {{ props.purchase.supplierName }}
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

        <form class="space-y-4" @submit.prevent="submit">
          <div class="space-y-2">
            <div
              v-for="(line, index) in pendingLines"
              :key="line.id"
              class="grid grid-cols-[minmax(0,1fr)_88px] items-center gap-3 rounded-sm border border-rail p-2.5"
            >
              <div class="min-w-0">
                <p class="truncate text-sm text-ink">{{ line.name }}</p>
                <p class="tnum text-[11px] text-ink-soft">
                  {{ line.sku }} · faltan {{ line.pending }} ·
                  {{ formatCurrency(line.unitCost, 2, props.purchase.currency) }} c/u
                </p>
              </div>
              <div>
                <label class="sr-only" :for="`receive-${line.id}`">Recibir {{ line.name }}</label>
                <input
                  :id="`receive-${line.id}`"
                  :ref="(el) => { if (index === 0) firstInput = el as HTMLInputElement }"
                  v-model.number="quantities[line.id]"
                  type="number"
                  step="any"
                  min="0"
                  :max="line.pending"
                  class="tnum w-full rounded-sm border border-rail bg-surface px-2 py-1.5 text-right text-sm text-ink focus-visible:border-ink"
                />
              </div>
            </div>
          </div>

          <p class="text-xs leading-relaxed text-ink-soft">
            Cada renglón recibido genera una entrada en Inventario con el folio de la orden en la nota.
          </p>

          <div class="flex items-center justify-between gap-3 border-t border-rail pt-3">
            <span class="text-sm text-ink-soft">Valor recibido</span>
            <span class="tnum font-display text-base font-semibold text-ink">
              {{ formatCurrency(total(), 0, props.purchase.currency) }}
            </span>
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
              :disabled="!canSubmit()"
              class="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 font-display text-sm font-semibold text-surface hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              <AppIcon name="check" :size="15" />
              Registrar entrada
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
