<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ClientDetail from '@/components/clients/ClientDetail.vue'
import ClientDirectory from '@/components/clients/ClientDirectory.vue'
import ClientSheet from '@/components/clients/ClientSheet.vue'
import { useClientFilters, type ClientFilter } from '@/composables/useClientFilters'
import { isAllBranches } from '@/stores/branch'
import { clients, findClient, removeClient, saveClient } from '@/stores/clients'
import type { ClientInput } from '@/types/client'

const props = defineProps<{ branch: string }>()

const { query, filter, filtered, counts, hasFilters, reset } = useClientFilters(clients)

const params = new URLSearchParams(window.location.search)
const error = ref(params.get('clientes') === 'error' ? 'Revisa tu conexión e inténtalo de nuevo.' : null)
const loading = ref(params.get('clientes') === 'cargando')
const selectedId = ref<string | null>(null)
const sheetOpen = ref(false)
const editing = ref<string | null>(null)
const confirmOpen = ref(false)
const notice = ref<{ text: string; tone: 'ok' | 'error' } | null>(null)
let timer: number | undefined

onMounted(() => {
  selectedId.value = filtered.value[0]?.id ?? null
  if (loading.value) timer = window.setTimeout(() => (loading.value = false), 1200)
})
onUnmounted(() => window.clearTimeout(timer))

const tabs: { id: ClientFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'frecuentes', label: 'Frecuentes' },
  { id: 'sin-visita', label: 'Sin visita' },
]

const selected = computed(() => findClient(selectedId.value))
const editingClient = computed(() => findClient(editing.value))

watch(filtered, (list) => {
  if (list.length === 0) {
    selectedId.value = null
  } else if (!list.some((client) => client.id === selectedId.value)) {
    selectedId.value = list[0]?.id ?? null
  }
})

function openNew() {
  if (isAllBranches.value) return
  editing.value = null
  sheetOpen.value = true
  notice.value = null
}

function openEdit(id: string) {
  if (isAllBranches.value) return
  editing.value = id
  selectedId.value = id
  sheetOpen.value = true
  notice.value = null
}

function onSave(input: ClientInput, id: string | null) {
  if (isAllBranches.value) return
  const result = saveClient(input, id)
  if (result.error || !result.client) {
    notice.value = { text: 'No pudimos guardar la ficha. Revisa los datos.', tone: 'error' }
    return
  }
  sheetOpen.value = false
  selectedId.value = result.client.id
  notice.value = {
    text: id ? 'Ficha actualizada' : 'Cliente agregado al directorio',
    tone: 'ok',
  }
}

function onRemove() {
  if (isAllBranches.value || !selected.value) return
  const name = selected.value.name
  removeClient(selected.value.id)
  confirmOpen.value = false
  selectedId.value = filtered.value[0]?.id ?? null
  notice.value = { text: `${name} se eliminó del directorio`, tone: 'ok' }
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="font-display text-xl font-semibold tracking-tight text-ink">Clientes</h2>
        <p class="mt-0.5 text-sm text-ink-soft">Directorio · {{ props.branch }}</p>
      </div>
      <button
        v-if="!isAllBranches"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 font-display text-sm font-semibold text-surface hover:bg-ink-soft"
        @click="openNew"
      >
        <AppIcon name="plus" :size="15" />
        Nuevo cliente
      </button>
    </div>

    <p v-if="isAllBranches" class="text-xs text-ink-soft">
      Vista agregada de solo lectura. Selecciona una sucursal para administrar sus clientes.
    </p>

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
          id="client-search"
          :value="query"
          type="search"
          autocomplete="off"
          placeholder="Buscar nombre, apodo o teléfono"
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
      <section aria-label="Directorio de clientes" class="min-w-0 rounded-sm border border-rail bg-surface">
        <ClientDirectory
          :clients="filtered"
          :loading="loading"
          :error="error"
          :has-filters="hasFilters"
          :selected-id="selectedId"
          :readonly="isAllBranches"
          @retry="error = null"
          @clear-filters="reset"
          @select="selectedId = $event"
          @edit="openEdit"
        />

        <div
          class="flex flex-wrap items-center justify-between gap-2 border-t border-rail px-4 py-2.5 text-xs text-ink-soft"
        >
          <span class="tnum">{{ filtered.length }} de {{ clients.length }} clientes</span>
          <span v-if="selected">
            Ficha abierta ·
            <strong class="font-semibold text-ink">{{ selected.name }}</strong>
          </span>
        </div>
      </section>

      <section aria-label="Ficha del cliente" class="rounded-sm border border-rail bg-surface p-4">
        <ClientDetail
          :client="selected"
          :readonly="isAllBranches"
          @edit="openEdit(selected?.id ?? '')"
          @remove="confirmOpen = true"
          @create="openNew"
        />
      </section>
    </div>

    <ClientSheet
      v-if="!isAllBranches"
      :open="sheetOpen"
      :client="editingClient"
      @close="sheetOpen = false"
      @save="onSave"
    />

    <ConfirmDialog
      v-if="confirmOpen && selected && !isAllBranches"
      tone="danger"
      title="Eliminar cliente"
      :message="`¿Eliminar a ${selected.name} del directorio? Esta acción no se puede deshacer.`"
      confirm-label="Eliminar cliente"
      @confirm="onRemove"
      @cancel="confirmOpen = false"
    />
  </div>
</template>
