<script setup lang="ts">
import { computed, ref } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import BranchCard from '@/components/branches/BranchCard.vue'
import BranchSheet from '@/components/branches/BranchSheet.vue'
import {
  branchProfileErrorText,
  branchProfiles,
  findBranchProfile,
  saveBranchProfile,
} from '@/stores/branchProfiles'
import { isSuperuser } from '@/stores/users'
import type { BranchKey } from '@/config/branches'
import type { BranchProfileInput } from '@/types/branchProfile'

defineProps<{ branch: string }>()

const sheetOpen = ref(false)
const editing = ref<BranchKey | null>(null)
const notice = ref<{ text: string; tone: 'ok' | 'error' } | null>(null)

const editingProfile = computed(() => findBranchProfile(editing.value))

function openEdit(id: BranchKey) {
  editing.value = id
  sheetOpen.value = true
  notice.value = null
}

function onSave(input: BranchProfileInput, id: BranchKey) {
  const result = saveBranchProfile(id, input)
  if (result.error || !result.profile) {
    notice.value = {
      text: branchProfileErrorText[result.error ?? 'direccion'],
      tone: 'error',
    }
    return
  }
  sheetOpen.value = false
  notice.value = { text: `Ficha de ${result.profile.name} actualizada`, tone: 'ok' }
}
</script>

<template>
  <div v-if="!isSuperuser" class="rounded-sm border border-rail bg-surface">
    <StatePanel
      icon="alert"
      tone="danger"
      title="Sin permiso"
      message="Solo un superusuario puede administrar las fichas de las sucursales."
    />
  </div>

  <div v-else class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="font-display text-xl font-semibold tracking-tight text-ink">Sucursales</h2>
        <p class="mt-0.5 text-sm text-ink-soft">Fichas de operación · {{ branch }}</p>
      </div>
      <span class="text-xs text-ink-soft">Sucursal activa: {{ branch }}</span>
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

    <div class="rounded-sm border border-rail bg-paper px-4 py-3">
      <p class="flex items-start gap-2 text-xs leading-relaxed text-ink-soft">
        <AppIcon name="alert" :size="14" class="mt-px shrink-0 text-mustard" />
        Centro y Norte son los únicos identificadores de sucursal. De ellos dependen los datos
        guardados, los folios y los permisos de los usuarios, por lo que aquí solo se edita la
        ficha: no se pueden crear ni borrar sucursales. El estado es informativo.
      </p>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <BranchCard
        v-for="profile in branchProfiles"
        :key="profile.id"
        :profile="profile"
        @edit="openEdit"
      />
    </div>

    <p class="text-[11px] leading-relaxed text-ink-soft">
      Para operar en una sucursal, cambia la selección en la barra lateral. «Todas las sucursales»
      reúne la información de ambas en una vista de solo lectura.
    </p>

    <BranchSheet
      :open="sheetOpen"
      :profile="editingProfile"
      @close="sheetOpen = false"
      @save="onSave"
    />
  </div>
</template>
