<script setup lang="ts">
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import type { User } from '@/types/user'
import { userGrid } from './grid'
import UserRow from './UserRow.vue'

const props = defineProps<{
  users: User[]
  loading: boolean
  error: string | null
  hasFilters: boolean
  selectedId: string | null
  currentUserId: string | null
}>()

const emit = defineEmits<{
  retry: []
  clearFilters: []
  select: [id: string]
  edit: [id: string]
}>()
</script>

<template>
  <div>
    <div v-if="props.loading" class="space-y-2 p-3" aria-hidden="true">
      <SkeletonBlock v-for="row in 4" :key="row" class="h-14 w-full" />
    </div>

    <StatePanel
      v-else-if="props.error"
      icon="alert"
      tone="danger"
      title="No pudimos cargar los usuarios"
      :message="props.error"
    >
      <button
        type="button"
        class="rounded-sm border border-rail px-3 py-1.5 text-xs font-medium text-ink hover:border-ink"
        @click="emit('retry')"
      >
        Reintentar
      </button>
    </StatePanel>

    <StatePanel
      v-else-if="props.users.length === 0"
      icon="users"
      :title="props.hasFilters ? 'Sin resultados' : 'Todavía no hay usuarios'"
      :message="
        props.hasFilters
          ? 'Prueba con otra búsqueda o quita los filtros aplicados.'
          : 'Crea la primera cuenta para dar acceso a la plataforma.'
      "
    >
      <button
        v-if="props.hasFilters"
        type="button"
        class="rounded-sm border border-rail px-3 py-1.5 text-xs font-medium text-ink hover:border-ink"
        @click="emit('clearFilters')"
      >
        Limpiar filtros
      </button>
    </StatePanel>

    <template v-else>
      <div :class="[userGrid, 'hidden border-y border-rail px-3 py-2 md:grid']">
        <span class="text-[11px] font-medium text-ink-soft">Usuario</span>
        <span class="text-[11px] font-medium text-ink-soft">Perfil</span>
        <span class="text-[11px] font-medium text-ink-soft">Sucursales</span>
        <span class="text-[11px] font-medium text-ink-soft">Estado</span>
        <span class="sr-only">Acciones</span>
      </div>
      <div class="divide-y divide-rail">
        <UserRow
          v-for="user in props.users"
          :key="user.id"
          :user="user"
          :selected="user.id === props.selectedId"
          :is-self="user.id === props.currentUserId"
          @select="emit('select', $event)"
          @edit="emit('edit', $event)"
        />
      </div>
    </template>
  </div>
</template>
