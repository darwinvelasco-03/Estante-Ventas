<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import PurchaseEditor from '@/components/purchases/PurchaseEditor.vue'
import PurchaseList from '@/components/purchases/PurchaseList.vue'
import PurchaseOrder from '@/components/purchases/PurchaseOrder.vue'
import ReceiveSheet from '@/components/purchases/ReceiveSheet.vue'
import { usePurchaseFilters, type PurchaseFilter } from '@/composables/usePurchaseFilters'
import { isAllBranches } from '@/stores/branch'
import {
  findPurchase,
  markPurchasePaid,
  purchases,
  receivePurchase,
  removePurchase,
  savePurchase,
} from '@/stores/purchases'
import type { PurchaseError, PurchaseInput } from '@/types/purchase'

const props = defineProps<{ branch: string }>()

const { query, filter, filtered, counts, hasFilters, reset } = usePurchaseFilters(purchases)

const params = new URLSearchParams(window.location.search)
const error = ref(
  params.get('compras') === 'error' ? 'Revisa tu conexión e inténtalo de nuevo.' : null,
)
const loading = ref(params.get('compras') === 'cargando')
const selectedId = ref<string | null>(null)
const editorOpen = ref(false)
const editing = ref<string | null>(null)
const receiveOpen = ref(false)
const confirmOpen = ref(false)
const notice = ref<{ text: string; tone: 'ok' | 'error' } | null>(null)
let timer: number | undefined

onMounted(() => {
  selectedId.value = filtered.value[0]?.id ?? null
  if (loading.value) timer = window.setTimeout(() => (loading.value = false), 1200)
})
onUnmounted(() => window.clearTimeout(timer))

const tabs: { id: PurchaseFilter; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendientes', label: 'Pendientes' },
  { id: 'recibidas', label: 'Recibidas' },
]

const selected = computed(() => findPurchase(selectedId.value))
const editingPurchase = computed(() => findPurchase(editing.value))

watch(filtered, (list) => {
  if (list.length === 0) {
    selectedId.value = null
  } else if (!list.some((purchase) => purchase.id === selectedId.value)) {
    selectedId.value = list[0]?.id ?? null
  }
})

function openNew() {
  if (isAllBranches.value) return
  editing.value = null
  editorOpen.value = true
  notice.value = null
}

function openEdit(id: string) {
  if (isAllBranches.value) return
  editing.value = id
  editorOpen.value = true
  notice.value = null
}

function onSave(input: PurchaseInput, id: string | null) {
  if (isAllBranches.value) return
  const result = savePurchase(input, id)
  if (result.error || !result.purchase) {
    notice.value = {
      text: `No pudimos guardar la orden. ${errorText[result.error ?? 'renglones']}`,
      tone: 'error',
    }
    return
  }
  editorOpen.value = false
  selectedId.value = result.purchase.id
  notice.value = {
    text: id ? 'Orden actualizada' : `Orden ${result.purchase.folio} registrada`,
    tone: 'ok',
  }
}

function onPay(id: string) {
  if (isAllBranches.value) return
  const result = markPurchasePaid(id)
  if (result.error || !result.purchase) {
    notice.value = {
      text: `No pudimos registrar el pago. ${errorText[result.error ?? 'no-encontrado']}`,
      tone: 'error',
    }
    return
  }
  notice.value = {
    text: `Orden ${result.purchase.folio} pagada en ${result.purchase.paymentMethod === 'efectivo' ? 'efectivo' : 'tarjeta'}. Ya aparece en Caja y Reportes.`,
    tone: 'ok',
  }
}

function onReceive(id: string, quantities: Record<string, number>) {
  if (isAllBranches.value) return
  const result = receivePurchase(id, quantities)
  if (result.error || !result.purchase) {
    notice.value = {
      text: `No pudimos registrar la recepción. ${errorText[result.error ?? 'cantidad']}`,
      tone: 'error',
    }
    return
  }
  receiveOpen.value = false
  notice.value = {
    text: result.completed
      ? `Orden ${result.purchase.folio} recibida y entradas generadas en Inventario`
      : `Recepciones registradas en ${result.receivedLines} renglones`,
    tone: 'ok',
  }
}

function onRemove() {
  if (isAllBranches.value || !selected.value) return
  const folio = selected.value.folio
  removePurchase(selected.value.id)
  confirmOpen.value = false
  selectedId.value = filtered.value[0]?.id ?? null
  notice.value = { text: `Orden ${folio} eliminada`, tone: 'ok' }
}

const errorText: Record<PurchaseError, string> = {
  proveedor: 'Falta el proveedor.',
  renglones: 'Agrega al menos un renglón.',
  cantidad: 'Revisa las cantidades.',
  costo: 'Revisa los costos unitarios.',
  'no-encontrado': 'La orden ya no existe.',
  recibida: 'Una orden recibida no se puede modificar.',
  pagada: 'Esta orden ya está pagada.',
  anulado: 'Esta orden fue anulada; consulta el rastro en Movimientos.',
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="font-display text-xl font-semibold tracking-tight text-ink">Compras</h2>
        <p class="mt-0.5 text-sm text-ink-soft">Órdenes · {{ props.branch }}</p>
      </div>
      <button
        v-if="!isAllBranches"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 font-display text-sm font-semibold text-surface hover:bg-ink-soft"
        @click="openNew"
      >
        <AppIcon name="plus" :size="15" />
        Nueva orden
      </button>
    </div>

    <p v-if="isAllBranches" class="text-xs text-ink-soft">
      Vista agregada de solo lectura. Selecciona una sucursal para crear o recibir órdenes.
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
          id="purchase-search"
          :value="query"
          type="search"
          autocomplete="off"
          placeholder="Buscar folio, proveedor o producto"
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

    <div class="grid gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(300px,5fr)]">
      <section aria-label="Órdenes de compra" class="min-w-0 rounded-sm border border-rail bg-surface">
        <PurchaseList
          :purchases="filtered"
          :loading="loading"
          :error="error"
          :has-filters="hasFilters"
          :selected-id="selectedId"
          @retry="error = null"
          @clear-filters="reset"
          @select="selectedId = $event"
        />

        <div
          class="flex flex-wrap items-center justify-between gap-2 border-t border-rail px-4 py-2.5 text-xs text-ink-soft"
        >
          <span class="tnum">{{ filtered.length }} de {{ purchases.length }} órdenes</span>
          <span v-if="selected">
            Orden abierta ·
            <strong class="font-semibold text-ink">{{ selected.folio }}</strong>
          </span>
        </div>
      </section>

      <section aria-label="Detalle de la orden" class="rounded-sm border border-rail bg-surface p-4">
        <PurchaseOrder
          v-if="selected"
          :purchase="selected"
          :readonly="isAllBranches"
          @edit="openEdit(selected.id)"
          @pay="onPay(selected.id)"
          @receive="receiveOpen = true"
          @remove="confirmOpen = true"
        />
        <div v-else class="py-10 text-center text-sm text-ink-soft">
          Selecciona una orden para ver sus renglones.
        </div>
      </section>
    </div>

    <PurchaseEditor
      v-if="!isAllBranches"
      :open="editorOpen"
      :purchase="editingPurchase"
      @close="editorOpen = false"
      @save="onSave"
    />

    <ReceiveSheet
      v-if="!isAllBranches"
      :open="receiveOpen && !!selected"
      :purchase="selected"
      @close="receiveOpen = false"
      @receive="onReceive"
    />

    <ConfirmDialog
      v-if="confirmOpen && selected && !isAllBranches"
      tone="danger"
      title="Eliminar orden de compra"
      :message="`¿Eliminar la orden ${selected.folio}? Las entradas de inventario ya registradas no se eliminan.`"
      confirm-label="Eliminar orden"
      @confirm="onRemove"
      @cancel="confirmOpen = false"
    />
  </div>
</template>
