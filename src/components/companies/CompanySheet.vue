<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import { companyErrorText } from '@/stores/companies'
import type { Company, CompanyError, CompanyInput } from '@/types/company'

const props = defineProps<{ open: boolean; company: Company | null; isActive: boolean }>()

const emit = defineEmits<{
  close: []
  save: [input: CompanyInput, id: string | null]
}>()

const legalName = ref('')
const tradeName = ref('')
const taxId = ref('')
const phone = ref('')
const email = ref('')
const street = ref('')
const city = ref('')
const active = ref(true)
const error = ref<CompanyError | null>(null)
const nameInput = ref<HTMLInputElement | null>(null)
const dialog = ref<HTMLElement | null>(null)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    legalName.value = props.company?.legalName ?? ''
    tradeName.value = props.company?.tradeName ?? ''
    taxId.value = props.company?.taxId ?? ''
    phone.value = props.company?.phone ?? ''
    email.value = props.company?.email ?? ''
    street.value = props.company?.street ?? ''
    city.value = props.company?.city ?? ''
    active.value = props.company?.active ?? false
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
  if (!legalName.value.trim()) return (error.value = 'legalName')
  if (!taxId.value.trim()) return (error.value = 'taxId')
  const value = email.value.trim()
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return (error.value = 'correo')
  if (props.isActive && !active.value) return (error.value = 'activa')

  error.value = null
  emit(
    'save',
    {
      legalName: legalName.value,
      tradeName: tradeName.value,
      taxId: taxId.value,
      phone: phone.value,
      email: value,
      street: street.value,
      city: city.value,
      active: active.value,
    },
    props.company?.id ?? null,
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
        aria-labelledby="company-sheet-title"
        class="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-sm border border-rail bg-surface p-5 shadow-[0_24px_60px_-30px_rgba(18,59,52,0.7)] sm:rounded-sm"
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="company-sheet-title" class="font-display text-lg font-semibold text-ink">
              {{ props.company ? 'Editar empresa' : 'Nueva empresa' }}
            </h2>
            <p class="mt-0.5 text-xs text-ink-soft">
              Datos fiscales y de contacto de la razón social.
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
            <label for="company-legal" class="mb-1 block text-xs font-medium text-ink-soft">
              Razón social
            </label>
            <input
              id="company-legal"
              ref="nameInput"
              v-model="legalName"
              type="text"
              autocomplete="organization"
              placeholder="Estante Abarrotes, S.A. de C.V."
              class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              @input="error = null"
            />
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="company-trade" class="mb-1 block text-xs font-medium text-ink-soft">
                Nombre comercial
              </label>
              <input
                id="company-trade"
                v-model="tradeName"
                type="text"
                placeholder="Estante"
                class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              />
            </div>
            <div>
              <label for="company-tax" class="mb-1 block text-xs font-medium text-ink-soft">
                Identificación fiscal
              </label>
              <input
                id="company-tax"
                v-model="taxId"
                type="text"
                placeholder="RFC / NIT"
                class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
                @input="error = null"
              />
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="company-phone" class="mb-1 block text-xs font-medium text-ink-soft">
                Teléfono
              </label>
              <input
                id="company-phone"
                v-model="phone"
                type="tel"
                autocomplete="tel"
                placeholder="55 1234 5678"
                class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              />
            </div>
            <div>
              <label for="company-email" class="mb-1 block text-xs font-medium text-ink-soft">
                Correo
              </label>
              <input
                id="company-email"
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="contacto@estante.local"
                class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
                @input="error = null"
              />
            </div>
          </div>

          <div>
            <label for="company-street" class="mb-1 block text-xs font-medium text-ink-soft">
              Domicilio
            </label>
            <input
              id="company-street"
              v-model="street"
              type="text"
              autocomplete="street-address"
              placeholder="Calle, número y colonia"
              class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
            />
          </div>

          <div>
            <label for="company-city" class="mb-1 block text-xs font-medium text-ink-soft">
              Ciudad
            </label>
            <input
              id="company-city"
              v-model="city"
              type="text"
              autocomplete="address-level2"
              placeholder="Ciudad de México"
              class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
            />
          </div>

          <label class="flex cursor-pointer items-center gap-2 rounded-sm border border-rail bg-paper px-3 py-2.5">
            <input
              v-model="active"
              type="checkbox"
              :disabled="props.isActive"
              class="size-4 accent-ink"
            />
            <span class="text-sm text-ink">Empresa activa</span>
          </label>
          <p v-if="props.isActive" class="-mt-2 text-[11px] text-ink-soft">
            Marca otra empresa como activa antes de desactivar esta.
          </p>

          <p v-if="error" class="flex items-start gap-1.5 text-xs text-brick" role="alert">
            <AppIcon name="alert" :size="14" class="mt-px shrink-0" />
            {{ companyErrorText[error] }}
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
              Guardar empresa
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
