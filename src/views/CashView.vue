<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import CashCloseSheet from '@/components/cash/CashCloseSheet.vue'
import CashOpenForm from '@/components/cash/CashOpenForm.vue'
import CashSessionCard from '@/components/cash/CashSessionCard.vue'
import CashSessionDetail from '@/components/cash/CashSessionDetail.vue'
import CashSessionList from '@/components/cash/CashSessionList.vue'
import { branchOptions } from '@/config/branches'
import { isAllBranches } from '@/stores/branch'
import {
  activeSessions,
  closeSession,
  closedSessions,
  openSession,
  sessionSummary,
  sessions,
} from '@/stores/cash'
import type { CashCloseInput, CashError, CashSessionEntry, CashSessionInput } from '@/types/cash'

const props = defineProps<{ branch: string }>()

const params = new URLSearchParams(window.location.search)
const error = ref(params.get('caja') === 'error' ? 'Revisa tu conexión e inténtalo de nuevo.' : null)
const loading = ref(params.get('caja') === 'cargando')
const selectedId = ref<string | null>(null)
const closeOpen = ref(false)
const notice = ref<{ text: string; tone: 'ok' | 'error' } | null>(null)
let timer: number | undefined

onMounted(() => {
  selectedId.value = listed.value[0]?.id ?? null
  if (loading.value) timer = window.setTimeout(() => (loading.value = false), 1200)
})
onUnmounted(() => window.clearTimeout(timer))

/** En la vista agregada se listan también las sesiones abiertas de cada sucursal. */
const listed = computed(() => (isAllBranches.value ? sessions.value : closedSessions.value))
const entries = computed<CashSessionEntry[]>(() =>
  listed.value
    .filter((session) => !!session.closedAt || isAllBranches.value)
    .map((session) => ({ session, summary: sessionSummary(session) })),
)
const active = computed(() => activeSessions.value[0] ?? null)
const activeEntry = computed<CashSessionEntry | null>(
  () =>
    active.value
      ? { session: active.value, summary: sessionSummary(active.value) }
      : null,
)
const selected = computed(() => entries.value.find((entry) => entry.session.id === selectedId.value) ?? null)
const selectedBranchName = computed(() =>
  selected.value ? branchName(selected.value.session.branch) : undefined,
)

watch(entries, (list) => {
  if (list.length === 0) {
    selectedId.value = null
  } else if (!list.some((entry) => entry.session.id === selectedId.value)) {
    selectedId.value = list[0]?.session.id ?? null
  }
})

function branchName(key: string) {
  return branchOptions.find((option) => option.id === key)?.label ?? key
}

function onOpen(input: CashSessionInput) {
  if (isAllBranches.value) return
  const result = openSession(input)
  if (result.error || !result.session) {
    notice.value = { text: `No pudimos abrir la caja. ${errorText[result.error ?? 'monto']}`, tone: 'error' }
    return
  }
  notice.value = { text: `Sesión ${result.session.folio} abierta`, tone: 'ok' }
}

function onClose(input: CashCloseInput) {
  if (isAllBranches.value || !active.value) return
  const folio = active.value.folio
  const result = closeSession(active.value.id, input)
  if (result.error || !result.session) {
    notice.value = { text: `No pudimos cerrar la caja. ${errorText[result.error ?? 'monto']}`, tone: 'error' }
    return
  }
  closeOpen.value = false
  selectedId.value = result.session.id
  const difference = sessionSummary(result.session).difference ?? 0
  notice.value = {
    text:
      Math.abs(difference) < 0.005
        ? `Sesión ${folio} cerrada · caja cuadrada`
        : `Sesión ${folio} cerrada con descuadre`,
    tone: 'ok',
  }
}

const errorText: Record<CashError, string> = {
  abierta: 'Ya hay una sesión abierta en esta sucursal.',
  monto: 'Revisa el importe capturado.',
  'no-encontrado': 'No pudimos encontrar la sesión.',
  cerrada: 'Esa sesión ya estaba cerrada.',
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="font-display text-xl font-semibold tracking-tight text-ink">Caja</h2>
        <p class="mt-0.5 text-sm text-ink-soft">
          Sesiones y arqueos · {{ props.branch }}
        </p>
      </div>
      <span
        v-if="active && !isAllBranches"
        class="inline-flex items-center gap-1.5 text-xs font-medium text-ok"
      >
        <AppIcon name="check" :size="14" />
        Sesión {{ active.folio }} en curso
      </span>
    </div>

    <p v-if="isAllBranches" class="text-xs text-ink-soft">
      Vista agregada de solo lectura. Selecciona una sucursal para abrir, cerrar o arquear una caja.
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

    <CashSessionCard
      v-if="activeEntry && !isAllBranches"
      :session="activeEntry.session"
      :summary="activeEntry.summary"
      @close="closeOpen = true"
    />
    <CashOpenForm v-else-if="!isAllBranches" @open="onOpen" />

    <div class="grid gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(300px,5fr)]">
      <section aria-label="Historial de sesiones" class="min-w-0 rounded-sm border border-rail bg-surface">
        <CashSessionList
          :entries="entries"
          :loading="loading"
          :error="error"
          :selected-id="selectedId"
          :show-branch="isAllBranches"
          :branch-name="branchName"
          @retry="error = null"
          @select="selectedId = $event"
        />

        <div class="flex flex-wrap items-center justify-between gap-2 border-t border-rail px-4 py-2.5 text-xs text-ink-soft">
          <span class="tnum">{{ entries.length }} sesiones en el historial</span>
          <span v-if="selected">
            Sesión abierta ·
            <strong class="font-semibold text-ink">{{ selected.session.folio }}</strong>
          </span>
        </div>
      </section>

      <section aria-label="Detalle del arqueo" class="rounded-sm border border-rail bg-surface p-4">
        <CashSessionDetail :entry="selected" :branch-name="selectedBranchName" />
      </section>
    </div>

    <CashCloseSheet
      v-if="!isAllBranches"
      :open="closeOpen"
      :session="active"
      :summary="activeEntry?.summary ?? null"
      @close="closeOpen = false"
      @confirm="onClose"
    />
  </div>
</template>
