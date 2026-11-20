<script setup lang="ts">
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import type { CashSessionEntry } from '@/types/cash'
import { sessionRowGrid } from './grid'
import CashSessionRow from './CashSessionRow.vue'

const props = defineProps<{
  entries: CashSessionEntry[]
  loading: boolean
  error: string | null
  selectedId: string | null
  showBranch: boolean
  branchName: (key: string) => string
}>()

const emit = defineEmits<{ retry: []; select: [id: string] }>()
</script>

<template>
  <div>
    <div v-if="props.loading" class="space-y-2 p-3" aria-hidden="true">
      <SkeletonBlock v-for="row in 4" :key="row" class="h-16 w-full" />
    </div>

    <StatePanel
      v-else-if="props.error"
      icon="alert"
      tone="danger"
      title="No pudimos cargar las sesiones"
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
      v-else-if="props.entries.length === 0"
      icon="cash"
      title="Todavía no hay sesiones cerradas"
      message="Cuando cierres una sesión con su arqueo, aparecerá aquí con el descuadre calculado."
    />

    <template v-else>
      <div :class="[sessionRowGrid, 'hidden border-y border-rail px-3 py-2 md:grid']">
        <span class="text-[11px] font-medium text-ink-soft">Sesión</span>
        <span class="text-[11px] font-medium text-ink-soft">Periodo</span>
        <span class="text-right text-[11px] font-medium text-ink-soft">Esperado</span>
        <span class="text-right text-[11px] font-medium text-ink-soft">Contado</span>
        <span class="text-right text-[11px] font-medium text-ink-soft">Diferencia</span>
        <span class="sr-only">Estatus</span>
      </div>
      <div class="divide-y divide-rail">
        <CashSessionRow
          v-for="entry in props.entries"
          :key="entry.session.id"
          :entry="entry"
          :selected="entry.session.id === props.selectedId"
          :branch-name="props.showBranch ? props.branchName(entry.session.branch) : undefined"
          @select="emit('select', $event)"
        />
      </div>
    </template>
  </div>
</template>
