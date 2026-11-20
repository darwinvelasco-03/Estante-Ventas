<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import UserDetail from '@/components/users/UserDetail.vue'
import UserList from '@/components/users/UserList.vue'
import UserSheet from '@/components/users/UserSheet.vue'
import { useUserFilters, type UserFilter } from '@/composables/useUserFilters'
import {
  canManageUsers,
  currentUser,
  findUser,
  removeUser,
  saveUser,
  userErrorText,
  users,
} from '@/stores/users'
import type { User, UserInput, UserError } from '@/types/user'

const props = defineProps<{ branch: string }>()

const { query, filter, filtered, counts, hasFilters, reset } = useUserFilters(users)

const params = new URLSearchParams(window.location.search)
const error = ref(params.get('usuarios') === 'error' ? 'Revisa tu conexión e inténtalo de nuevo.' : null)
const selectedId = ref<string | null>(null)
const sheetOpen = ref(false)
const editing = ref<string | null>(null)
const confirmOpen = ref(false)
const notice = ref<{ text: string; tone: 'ok' | 'error' } | null>(null)

onMounted(() => {
  selectedId.value = filtered.value[0]?.id ?? null
})

const selected = computed(() => findUser(selectedId.value))
const editingUser = computed(() => findUser(editing.value))
const isSelf = (user: User | null) => !!user && user.id === currentUser.value?.id

const tabs: { id: UserFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'superuser', label: 'Superusuarios' },
  { id: 'branch', label: 'Sucursal' },
  { id: 'inactivos', label: 'Inactivos' },
]

watch(filtered, (list) => {
  if (list.length === 0) {
    selectedId.value = null
  } else if (!list.some((user) => user.id === selectedId.value)) {
    selectedId.value = list[0]?.id ?? null
  }
})

function toInput(user: User): UserInput {
  return {
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
    branches: [...user.branches],
    active: user.active,
  }
}

function showError(code: UserError, fallback: string) {
  notice.value = { text: userErrorText[code] ?? fallback, tone: 'error' }
}

function openNew() {
  editing.value = null
  sheetOpen.value = true
  notice.value = null
}

function openEdit(id: string) {
  editing.value = id
  selectedId.value = id
  sheetOpen.value = true
  notice.value = null
}

function onSave(input: UserInput, id: string | null) {
  const result = saveUser(input, id)
  if (result.error || !result.user) {
    showError(result.error ?? 'no-encontrado', 'No pudimos guardar el usuario.')
    return
  }
  sheetOpen.value = false
  selectedId.value = result.user.id
  notice.value = { text: id ? 'Permisos actualizados' : 'Usuario creado', tone: 'ok' }
}

function onToggleActive() {
  if (!selected.value) return
  const input = toInput(selected.value)
  input.active = !input.active
  const result = saveUser(input, selected.value.id)
  if (result.error || !result.user) {
    showError(result.error ?? 'no-encontrado', 'No pudimos cambiar el estado.')
    return
  }
  notice.value = {
    text: result.user.active ? 'Cuenta activada' : 'Cuenta desactivada',
    tone: 'ok',
  }
}

function onRemove() {
  if (!selected.value) return
  const name = selected.value.name
  const result = removeUser(selected.value.id)
  confirmOpen.value = false
  if (result) {
    showError(result, 'No pudimos eliminar el usuario.')
    return
  }
  selectedId.value = filtered.value[0]?.id ?? null
  notice.value = { text: `${name} se eliminó`, tone: 'ok' }
}
</script>

<template>
  <div v-if="!canManageUsers" class="rounded-sm border border-rail bg-surface">
    <StatePanel
      icon="alert"
      tone="danger"
      title="Sin permiso"
      message="Solo un superusuario puede administrar las cuentas y sus permisos."
    />
  </div>

  <div v-else class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="font-display text-xl font-semibold tracking-tight text-ink">Usuarios</h2>
        <p class="mt-0.5 text-sm text-ink-soft">Cuentas y permisos · {{ props.branch }}</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 font-display text-sm font-semibold text-surface hover:bg-ink-soft"
        @click="openNew"
      >
        <AppIcon name="plus" :size="15" />
        Nuevo usuario
      </button>
    </div>

    <p
      v-if="notice"
      class="flex items-center gap-1.5 text-xs"
      :class="notice.tone === 'ok' ? 'text-ok' : 'text-brick'"
      aria-live="polite"
    >
      <AppIcon :name="notice.tone === 'ok' ? 'check' : 'alert'" :size="14" />
      {{ notice.text }}
    </p>

    <div class="space-y-3">
      <div class="relative">
        <AppIcon
          name="search"
          :size="16"
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft"
        />
        <input
          id="user-search"
          :value="query"
          type="search"
          autocomplete="off"
          placeholder="Buscar nombre o correo"
          class="w-full rounded-sm border border-rail bg-surface py-2 pr-3 pl-9 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
          @input="query = ($event.target as HTMLInputElement).value"
        />
      </div>

      <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div class="flex flex-wrap gap-x-3 gap-y-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="text-xs transition-colors"
            :class="
              filter === tab.id
                ? 'font-semibold text-ink underline decoration-2 underline-offset-4'
                : 'text-ink-soft hover:text-ink'
            "
            :aria-pressed="filter === tab.id"
            @click="filter = tab.id"
          >
            {{ tab.label }} <span class="tnum">{{ counts[tab.id] }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(280px,5fr)]">
      <section aria-label="Directorio de usuarios" class="min-w-0 rounded-sm border border-rail bg-surface">
        <UserList
          :users="filtered"
          :loading="false"
          :error="error"
          :has-filters="hasFilters"
          :selected-id="selectedId"
          :current-user-id="currentUser?.id ?? null"
          @retry="error = null"
          @clear-filters="reset"
          @select="selectedId = $event"
          @edit="openEdit"
        />

        <div
          class="flex flex-wrap items-center justify-between gap-2 border-t border-rail px-4 py-2.5 text-xs text-ink-soft"
        >
          <span class="tnum">{{ filtered.length }} de {{ users.length }} usuarios</span>
          <span v-if="selected">
            Cuenta abierta ·
            <strong class="font-semibold text-ink">{{ selected.name }}</strong>
          </span>
        </div>
      </section>

      <section aria-label="Detalle del usuario" class="rounded-sm border border-rail bg-surface p-4">
        <UserDetail
          :user="selected"
          :is-self="isSelf(selected)"
          @edit="openEdit(selected?.id ?? '')"
          @toggle-active="onToggleActive"
          @remove="confirmOpen = true"
        />
      </section>
    </div>

    <UserSheet
      :open="sheetOpen"
      :user="editingUser"
      @close="sheetOpen = false"
      @save="onSave"
    />

    <ConfirmDialog
      v-if="confirmOpen && selected && !isSelf(selected)"
      tone="danger"
      title="Eliminar usuario"
      :message="`¿Eliminar la cuenta de ${selected.name}? Perderá el acceso a la plataforma.`"
      confirm-label="Eliminar usuario"
      @confirm="onRemove"
      @cancel="confirmOpen = false"
    />
  </div>
</template>
