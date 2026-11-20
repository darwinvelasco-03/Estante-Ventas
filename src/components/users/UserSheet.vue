<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import type { BranchKey } from '@/config/branches'
import { userErrorText } from '@/stores/users'
import type { User, UserError, UserInput, UserRole } from '@/types/user'

const props = defineProps<{ open: boolean; user: User | null }>()

const emit = defineEmits<{
  close: []
  save: [input: UserInput, id: string | null]
}>()

const name = ref('')
const email = ref('')
const password = ref('')
const role = ref<UserRole>('branch')
const branches = ref<BranchKey[]>(['centro'])
const active = ref(true)
const error = ref<UserError | null>(null)
const nameInput = ref<HTMLInputElement | null>(null)
const dialog = ref<HTMLElement | null>(null)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    name.value = props.user?.name ?? ''
    email.value = props.user?.email ?? ''
    password.value = ''
    role.value = props.user?.role ?? 'branch'
    branches.value = props.user ? [...props.user.branches] : ['centro']
    active.value = props.user?.active ?? true
    error.value = null
    nextTick(() => nameInput.value?.focus())
  },
)

function onRoleChange(value: UserRole) {
  role.value = value
  if (value === 'branch' && branches.value.length === 0) branches.value = ['centro']
  error.value = null
}

/**
 * Se actualiza el arreglo vivo en lugar de usar `v-model`: el directorio de checkbox de Vue
 * conserva el valor del render anterior, por lo que dos cambios en el mismo tick se sobrescriben.
 */
function toggleBranch(id: BranchKey, event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  branches.value = checked
    ? Array.from(new Set([...branches.value, id]))
    : branches.value.filter((key) => key !== id)
  error.value = null
}

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
  if (!name.value.trim()) return (error.value = 'nombre')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) return (error.value = 'correo')
  if (!props.user && password.value.length < 6) return (error.value = 'clave')
  if (role.value === 'branch' && branches.value.length === 0) return (error.value = 'sucursales')

  error.value = null
  emit(
    'save',
    {
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value,
      branches: role.value === 'superuser' ? ['centro', 'norte'] : branches.value,
      active: active.value,
    },
    props.user?.id ?? null,
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
        aria-labelledby="user-sheet-title"
        class="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-sm border border-rail bg-surface p-5 shadow-[0_24px_60px_-30px_rgba(18,59,52,0.7)] sm:rounded-sm"
      >
        <div class="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="user-sheet-title" class="font-display text-lg font-semibold text-ink">
              {{ props.user ? 'Editar usuario' : 'Nuevo usuario' }}
            </h2>
            <p class="mt-0.5 text-xs text-ink-soft">
              Define el perfil y las sucursales a las que tendrá acceso.
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
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label for="user-name" class="mb-1 block text-xs font-medium text-ink-soft">Nombre</label>
              <input
                id="user-name"
                ref="nameInput"
                v-model="name"
                type="text"
                autocomplete="name"
                placeholder="Nombre completo"
                class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
                @input="error = null"
              />
            </div>
            <div>
              <label for="user-email" class="mb-1 block text-xs font-medium text-ink-soft">
                Correo de acceso
              </label>
              <input
                id="user-email"
                v-model="email"
                type="email"
                autocomplete="off"
                placeholder="nombre@estante.local"
                class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
                @input="error = null"
              />
            </div>
          </div>

          <div>
            <label for="user-password" class="mb-1 block text-xs font-medium text-ink-soft">
              Contraseña
            </label>
            <input
              id="user-password"
              v-model="password"
              type="password"
              autocomplete="new-password"
              :placeholder="props.user ? 'Dejar en blanco para conservar' : 'Mínimo 6 caracteres'"
              class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              @input="error = null"
            />
          </div>

          <fieldset>
            <legend class="mb-2 text-xs font-medium text-ink-soft">Perfil</legend>
            <div class="grid gap-2 sm:grid-cols-2">
              <label
                class="cursor-pointer rounded-sm border px-3 py-2.5 transition-colors"
                :class="role === 'branch' ? 'border-ink bg-paper' : 'border-rail hover:border-ink'"
              >
                <span class="flex items-start gap-2">
                  <input
                    type="radio"
                    name="user-role"
                    value="branch"
                    class="mt-0.5 size-4 accent-ink"
                    :checked="role === 'branch'"
                    @change="onRoleChange('branch')"
                  />
                  <span>
                    <span class="block text-sm font-medium text-ink">Usuario sucursal</span>
                    <span class="mt-0.5 block text-[11px] leading-snug text-ink-soft">
                      Ve solo las sucursales que se le asignen.
                    </span>
                  </span>
                </span>
              </label>
              <label
                class="cursor-pointer rounded-sm border px-3 py-2.5 transition-colors"
                :class="role === 'superuser' ? 'border-ink bg-paper' : 'border-rail hover:border-ink'"
              >
                <span class="flex items-start gap-2">
                  <input
                    type="radio"
                    name="user-role"
                    value="superuser"
                    class="mt-0.5 size-4 accent-ink"
                    :checked="role === 'superuser'"
                    @change="onRoleChange('superuser')"
                  />
                  <span>
                    <span class="block text-sm font-medium text-ink">Superusuario</span>
                    <span class="mt-0.5 block text-[11px] leading-snug text-ink-soft">
                      Ve todo, administra usuarios y opera en cualquier sucursal.
                    </span>
                  </span>
                </span>
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend class="mb-2 text-xs font-medium text-ink-soft">Sucursales permitidas</legend>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="option in [
                  { id: 'centro' as const, label: 'Sucursal Centro' },
                  { id: 'norte' as const, label: 'Sucursal Norte' },
                ]"
                :key="option.id"
                class="flex cursor-pointer items-center gap-2 rounded-sm border px-3 py-2 text-xs transition-colors"
                :class="[
                  role === 'superuser' ? 'cursor-not-allowed border-rail opacity-60' : 'border-rail',
                  branches.includes(option.id) && role === 'branch' ? 'bg-paper' : '',
                ]"
              >
                <input
                  type="checkbox"
                  :checked="branches.includes(option.id)"
                  :disabled="role === 'superuser'"
                  class="size-4 accent-ink"
                  @change="toggleBranch(option.id, $event)"
                />
                <span class="text-ink">{{ option.label }}</span>
              </label>
            </div>
            <p v-if="role === 'superuser'" class="mt-2 text-[11px] text-ink-soft">
              Los superusuarios tienen acceso a ambas sucursales; esta selección se ignora.
            </p>
          </fieldset>

          <label class="flex cursor-pointer items-center gap-2 rounded-sm border border-rail bg-paper px-3 py-2.5">
            <input v-model="active" type="checkbox" class="size-4 accent-ink" />
            <span class="text-sm text-ink">Cuenta activa</span>
          </label>

          <p v-if="error" class="flex items-start gap-1.5 text-xs text-brick" role="alert">
            <AppIcon name="alert" :size="14" class="mt-px shrink-0" />
            {{ userErrorText[error] }}
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
              Guardar usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
