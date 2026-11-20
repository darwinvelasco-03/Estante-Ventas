<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import { branchProfileErrorText } from '@/stores/branchProfiles'
import type { BranchProfile, BranchProfileError, BranchProfileInput } from '@/types/branchProfile'

const props = defineProps<{ open: boolean; profile: BranchProfile | null }>()

const emit = defineEmits<{
  close: []
  save: [input: BranchProfileInput, id: BranchProfile['id']]
}>()

const street = ref('')
const city = ref('')
const phone = ref('')
const email = ref('')
const manager = ref('')
const schedule = ref('')
const status = ref<BranchProfile['status']>('operativa')
const note = ref('')
const error = ref<BranchProfileError | null>(null)
const streetInput = ref<HTMLInputElement | null>(null)
const dialog = ref<HTMLElement | null>(null)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    street.value = props.profile?.street ?? ''
    city.value = props.profile?.city ?? ''
    phone.value = props.profile?.phone ?? ''
    email.value = props.profile?.email ?? ''
    manager.value = props.profile?.manager ?? ''
    schedule.value = props.profile?.schedule ?? ''
    status.value = props.profile?.status ?? 'operativa'
    note.value = props.profile?.note ?? ''
    error.value = null
    nextTick(() => streetInput.value?.focus())
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
  if (!props.profile) return
  if (!street.value.trim()) return (error.value = 'direccion')
  if (!manager.value.trim()) return (error.value = 'responsable')
  error.value = null
  emit(
    'save',
    {
      street: street.value,
      city: city.value,
      phone: phone.value,
      email: email.value,
      manager: manager.value,
      schedule: schedule.value,
      status: status.value,
      note: note.value,
    },
    props.profile.id,
  )
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.open && props.profile"
      class="fixed inset-0 z-[60] flex items-end justify-center bg-ink/50 sm:items-center sm:p-4"
      @click.self="emit('close')"
    >
      <div
        ref="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="branch-sheet-title"
        class="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-sm border border-rail bg-surface p-5 shadow-[0_24px_60px_-30px_rgba(18,59,52,0.7)] sm:rounded-sm"
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="branch-sheet-title" class="font-display text-lg font-semibold text-ink">
              Editar {{ props.profile.name }}
            </h2>
            <p class="mt-0.5 text-xs text-ink-soft">
              Identificador {{ props.profile.id }} y folios {{ props.profile.code }}: no se pueden cambiar.
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
          <div>
            <label for="branch-street" class="mb-1 block text-xs font-medium text-ink-soft">
              Domicilio
            </label>
            <input
              id="branch-street"
              ref="streetInput"
              v-model="street"
              type="text"
              autocomplete="street-address"
              placeholder="Calle, número y colonia"
              class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              @input="error = null"
            />
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="branch-city" class="mb-1 block text-xs font-medium text-ink-soft">
                Ciudad
              </label>
              <input
                id="branch-city"
                v-model="city"
                type="text"
                autocomplete="address-level2"
                class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              />
            </div>
            <div>
              <label for="branch-manager" class="mb-1 block text-xs font-medium text-ink-soft">
                Responsable
              </label>
              <input
                id="branch-manager"
                v-model="manager"
                type="text"
                autocomplete="name"
                placeholder="Nombre del encargado"
                class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
                @input="error = null"
              />
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="branch-phone" class="mb-1 block text-xs font-medium text-ink-soft">
                Teléfono
              </label>
              <input
                id="branch-phone"
                v-model="phone"
                type="tel"
                autocomplete="tel"
                class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              />
            </div>
            <div>
              <label for="branch-email" class="mb-1 block text-xs font-medium text-ink-soft">
                Correo
              </label>
              <input
                id="branch-email"
                v-model="email"
                type="email"
                autocomplete="email"
                class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              />
            </div>
          </div>

          <div>
            <label for="branch-schedule" class="mb-1 block text-xs font-medium text-ink-soft">
              Horario
            </label>
            <input
              id="branch-schedule"
              v-model="schedule"
              type="text"
              placeholder="Lunes a domingo · 07:00 a 22:00"
              class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
            />
          </div>

          <fieldset>
            <legend class="mb-2 text-xs font-medium text-ink-soft">Estado operativo</legend>
            <div class="grid gap-2 sm:grid-cols-2">
              <label
                class="flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2.5 text-sm transition-colors"
                :class="status === 'operativa' ? 'border-ink bg-paper' : 'border-rail hover:border-ink'"
              >
                <input
                  v-model="status"
                  type="radio"
                  name="branch-status"
                  value="operativa"
                  class="size-4 accent-ink"
                />
                <span class="text-ink">Operativa</span>
              </label>
              <label
                class="flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2.5 text-sm transition-colors"
                :class="status === 'pausa' ? 'border-ink bg-paper' : 'border-rail hover:border-ink'"
              >
                <input
                  v-model="status"
                  type="radio"
                  name="branch-status"
                  value="pausa"
                  class="size-4 accent-ink"
                />
                <span class="text-ink">En pausa</span>
              </label>
            </div>
          </fieldset>

          <div>
            <label for="branch-note" class="mb-1 block text-xs font-medium text-ink-soft">
              Nota interna
            </label>
            <textarea
              id="branch-note"
              v-model="note"
              rows="3"
              placeholder="Detalles para el equipo"
              class="w-full resize-none rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
            />
          </div>

          <p v-if="error" class="flex items-start gap-1.5 text-xs text-brick" role="alert">
            <AppIcon name="alert" :size="14" class="mt-px shrink-0" />
            {{ branchProfileErrorText[error] }}
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
              Guardar ficha
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
