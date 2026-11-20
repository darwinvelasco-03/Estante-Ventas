<script setup lang="ts">
import { computed } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import MyBranchCard from '@/components/mybranch/MyBranchCard.vue'
import type { BranchKey } from '@/config/branches'
import { branchId, setBranch } from '@/stores/branch'
import { findBranchProfile } from '@/stores/branchProfiles'
import { currentUser } from '@/stores/users'

defineProps<{ branch: string }>()

/** Solo las sucursales asignadas al usuario con sesión abierta. */
const assigned = computed<BranchKey[]>(() => currentUser.value?.branches ?? [])

const profiles = computed(() =>
  assigned.value
    .map((id) => findBranchProfile(id))
    .filter((profile): profile is NonNullable<ReturnType<typeof findBranchProfile>> => !!profile),
)

const firstName = computed(() => currentUser.value?.name.trim().split(/\s+/)[0] ?? 'Equipo')
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="font-display text-xl font-semibold tracking-tight text-ink">Mi sucursal</h2>
        <p class="mt-0.5 text-sm text-ink-soft">
          {{ firstName }} · {{ assigned.length === 1 ? '1 sucursal asignada' : `${assigned.length} sucursales asignadas` }} · {{ branch }}
        </p>
      </div>
      <a
        href="#/dashboard"
        class="inline-flex items-center gap-1.5 rounded-sm border border-rail px-3 py-2 text-xs text-ink transition-colors hover:border-ink"
      >
        <AppIcon name="dashboard" :size="14" />
        Ir al dashboard
      </a>
    </div>

    <StatePanel
      v-if="profiles.length === 0"
      icon="branches"
      title="Sin sucursales asignadas"
      message="Tu cuenta todavía no tiene una sucursal asignada. Pide al administrador que revise tus permisos."
    />

    <template v-else>
      <div class="flex items-start gap-2 rounded-sm border border-rail bg-paper px-4 py-3">
        <AppIcon name="alert" :size="14" class="mt-px shrink-0 text-mustard" />
        <p class="text-xs leading-relaxed text-ink-soft">
          Esta ficha es de solo lectura: los datos los administra el superusuario en Sucursales.
          Cambia la sucursal activa desde aquí o desde el selector lateral; las ventas, gastos y
          movimientos que registres se guardan únicamente en la sucursal activa. «Todas las
          sucursales» es un agregado y no permite escribir.
        </p>
      </div>

      <div class="grid gap-5 xl:grid-cols-2">
        <MyBranchCard
          v-for="profile in profiles"
          :key="profile.id"
          :profile="profile"
          :is-active="profile.id === branchId"
          @select="setBranch"
        />
      </div>

      <p class="text-[11px] leading-relaxed text-ink-soft">
        Los accesos directos abren cada módulo con la sucursal que esté activa en ese momento. Si
        tienes dos sucursales asignadas, verifica la cabecera antes de registrar un movimiento.
      </p>
    </template>
  </div>
</template>
