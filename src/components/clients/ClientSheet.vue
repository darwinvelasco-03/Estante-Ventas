<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import type { Client, ClientError, ClientInput } from '@/types/client'

const props = defineProps<{ open: boolean; client: Client | null }>()

const emit = defineEmits<{
  close: []
  save: [input: ClientInput, id: string | null]
}>()

const name = ref('')
const alias = ref('')
const phone = ref('')
const note = ref('')
const frequent = ref(false)
const error = ref<ClientError | null>(null)
const nameInput = ref<HTMLInputElement | null>(null)
const dialog = ref<HTMLElement | null>(null)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    name.value = props.client?.name ?? ''
    alias.value = props.client?.alias ?? ''
    phone.value = props.client?.phone ?? ''
    note.value = props.client?.note ?? ''
    frequent.value = props.client?.frequent ?? false
    error.value = null
    nextTick(() => nameInput.value?.focus())
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
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled])',
    ),
  )
  if (focusable.length === 0) return
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
  if (!name.value.trim()) {
    error.value = 'nombre'
    return
  }
  const digits = phone.value.replace(/\D/g, '')
  if (digits && digits.length !== 10) {
    error.value = 'telefono'
    return
  }
  error.value = null
  emit(
    'save',
    {
      name: name.value,
      alias: alias.value,
      phone: phone.value,
      note: note.value,
      frequent: frequent.value,
    },
    props.client?.id ?? null,
  )
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.open"
      class="fixed inset-0 z-[60] flex items-end justify-center bg-ink/50 sm:items-center sm:p-4"
      @click.self="emit('close')"
    >
      <div
        ref="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-sheet-title"
        class="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-sm border border-rail bg-surface p-5 shadow-[0_24px_60px_-30px_rgba(18,59,52,0.7)] sm:rounded-sm"
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="client-sheet-title" class="font-display text-lg font-semibold text-ink">
              {{ props.client ? 'Editar ficha' : 'Nuevo cliente' }}
            </h2>
            <p class="mt-0.5 text-xs text-ink-soft">
              El nombre y el teléfono aparecen al buscar en el punto de venta.
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

        <form class="space-y-3" @submit.prevent="submit">
          <div>
            <label for="client-name" class="mb-1 block text-xs font-medium text-ink-soft">
              Nombre
            </label>
            <input
              id="client-name"
              ref="nameInput"
              v-model="name"
              type="text"
              autocomplete="name"
              placeholder="Nombre completo"
              class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              @input="error = null"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="client-alias" class="mb-1 block text-xs font-medium text-ink-soft">
                Apodo (opcional)
              </label>
              <input
                id="client-alias"
                v-model="alias"
                type="text"
                placeholder="La de la esquina"
                class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              />
            </div>
            <div>
              <label for="client-phone" class="mb-1 block text-xs font-medium text-ink-soft">
                Teléfono (opcional)
              </label>
              <input
                id="client-phone"
                v-model="phone"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                placeholder="55 1234 5678"
                class="tnum w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
                @input="error = null"
              />
            </div>
          </div>

          <div>
            <label for="client-note" class="mb-1 block text-xs font-medium text-ink-soft">
              Nota (opcional)
            </label>
            <textarea
              id="client-note"
              v-model="note"
              rows="3"
              placeholder="Qué pide, cuándo suele venir, referencias…"
              class="w-full resize-y rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
            />
          </div>

          <label
            class="flex cursor-pointer items-center gap-2 rounded-sm border border-rail bg-paper px-3 py-2.5"
          >
            <input
              v-model="frequent"
              type="checkbox"
              class="size-4 accent-ink"
            />
            <span class="text-sm text-ink">Cliente frecuente</span>
          </label>

          <p v-if="error" class="flex items-start gap-1.5 text-xs text-brick" role="alert">
            <AppIcon name="alert" :size="14" class="mt-px shrink-0" />
            {{ error === 'nombre' ? 'Escribe el nombre del cliente.' : 'El teléfono debe tener 10 dígitos.' }}
          </p>

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
              class="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 font-display text-sm font-semibold text-surface hover:bg-ink-soft"
            >
              <AppIcon name="check" :size="15" />
              Guardar cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
