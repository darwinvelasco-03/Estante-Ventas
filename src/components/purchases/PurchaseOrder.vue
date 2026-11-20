<script setup lang="ts">
import { computed } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import DeliveryWeek from '@/components/suppliers/DeliveryWeek.vue'
import { findSupplier } from '@/stores/suppliers'
import type { Purchase } from '@/types/purchase'
import { formatCurrency, formatVisitParts } from '@/utils/format'
import { purchaseLineGrid } from './grid'
import PurchaseLineRow from './PurchaseLineRow.vue'
import ReceivedStamp from './ReceivedStamp.vue'

const props = defineProps<{ purchase: Purchase; readonly?: boolean }>()

const emit = defineEmits<{ edit: []; receive: []; remove: [] }>()

const supplier = computed(() => findSupplier(props.purchase.supplierId))
const ordered = computed(() =>
  props.purchase.lines.reduce((sum, line) => sum + line.ordered * line.unitCost, 0),
)
const received = computed(() =>
  props.purchase.lines.reduce((sum, line) => sum + line.received * line.unitCost, 0),
)
const pending = computed(() => Math.max(0, ordered.value - received.value))
const created = computed(() => formatVisitParts(props.purchase.createdAt).full)
</script>

<template>
  <div>
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-[11px] font-medium text-ink-soft">Orden</p>
        <h2 class="mt-1 font-display text-lg leading-tight font-semibold text-ink">
          {{ props.purchase.folio }}
        </h2>
        <p class="mt-0.5 truncate text-sm text-ink-soft">{{ props.purchase.supplierName }}</p>
      </div>
      <ReceivedStamp :received="!!props.purchase.receivedAt" :date="props.purchase.receivedAt" />
    </div>

    <dl class="mt-5 divide-y divide-rail border-y border-rail">
      <div class="flex items-start justify-between gap-4 py-2.5">
        <dt class="shrink-0 text-xs text-ink-soft">Pedido</dt>
        <dd class="text-right text-sm text-ink">{{ created }}</dd>
      </div>
      <div class="flex items-start justify-between gap-4 py-2.5">
        <dt class="shrink-0 text-xs text-ink-soft">Línea</dt>
        <dd class="max-w-[65%] text-right text-sm leading-relaxed text-ink">
          {{ supplier?.line || 'Sin línea registrada' }}
        </dd>
      </div>
      <div v-if="supplier && supplier.deliveryDays.length > 0" class="flex items-start justify-between gap-4 py-2.5">
        <dt class="shrink-0 text-xs text-ink-soft">Entrega del proveedor</dt>
        <dd class="text-right"><DeliveryWeek :days="supplier.deliveryDays" align="end" /></dd>
      </div>
      <div class="flex items-start justify-between gap-4 py-2.5">
        <dt class="shrink-0 text-xs text-ink-soft">Moneda</dt>
        <dd class="text-right text-sm font-medium text-ink">{{ props.purchase.currency }}</dd>
      </div>
      <div v-if="props.purchase.note" class="flex items-start justify-between gap-4 py-2.5">
        <dt class="shrink-0 text-xs text-ink-soft">Nota</dt>
        <dd class="max-w-[65%] text-right text-sm leading-relaxed text-ink">{{ props.purchase.note }}</dd>
      </div>
    </dl>

    <div class="mt-5">
      <p class="mb-1.5 text-[11px] font-medium text-ink-soft">Renglones</p>
      <div class="rounded-sm border border-rail">
        <div :class="[purchaseLineGrid, 'hidden border-b border-rail px-3 py-2 md:grid']">
          <span class="text-[11px] font-medium text-ink-soft">Producto</span>
          <span class="text-right text-[11px] font-medium text-ink-soft">Pedido</span>
          <span class="text-[11px] font-medium text-ink-soft">Recibido</span>
          <span class="text-right text-[11px] font-medium text-ink-soft">Costo c/u</span>
          <span class="text-right text-[11px] font-medium text-ink-soft">Subtotal</span>
        </div>
        <div class="divide-y divide-rail">
          <PurchaseLineRow
            v-for="line in props.purchase.lines"
            :key="line.id"
            :line="line"
            :currency="props.purchase.currency"
          />
        </div>
      </div>

      <dl class="mt-3 space-y-1.5 text-sm">
        <div class="flex items-center justify-between gap-3">
          <dt class="text-ink-soft">Total pedido</dt>
          <dd class="tnum font-medium text-ink">
            {{ formatCurrency(ordered, 0, props.purchase.currency) }}
          </dd>
        </div>
        <div class="flex items-center justify-between gap-3">
          <dt class="text-ink-soft">Total recibido</dt>
          <dd class="tnum font-medium text-ok">{{ formatCurrency(received, 0, props.purchase.currency) }}</dd>
        </div>
        <div v-if="pending > 0" class="flex items-center justify-between gap-3 border-t border-dashed border-rail pt-1.5">
          <dt class="text-ink-soft">Pendiente</dt>
          <dd class="tnum font-medium text-mustard">{{ formatCurrency(pending, 0, props.purchase.currency) }}</dd>
        </div>
      </dl>
    </div>

    <div class="mt-5 flex flex-wrap gap-2">
      <button
        v-if="!props.purchase.receivedAt && !props.readonly"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 font-display text-sm font-semibold text-surface hover:bg-ink-soft"
        @click="emit('receive')"
      >
        <AppIcon name="check" :size="15" />
        Registrar recepción
      </button>
      <button
        v-if="!props.purchase.receivedAt && !props.readonly"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-sm border border-rail px-3 py-2 text-sm text-ink hover:border-ink"
        @click="emit('edit')"
      >
        <AppIcon name="save" :size="15" />
        Editar orden
      </button>
      <a
        v-else
        href="#/inventario"
        class="inline-flex items-center gap-1.5 rounded-sm border border-rail px-3 py-2 text-sm text-ink hover:border-ink"
      >
        <AppIcon name="inventory" :size="15" />
        Ver entradas en Inventario
      </a>
      <button
        v-if="!props.readonly"
        type="button"
        class="inline-flex items-center gap-1.5 rounded-sm border border-brick/40 px-3 py-2 text-sm text-brick hover:border-brick"
        @click="emit('remove')"
      >
        <AppIcon name="trash" :size="15" />
        Eliminar
      </button>
    </div>
  </div>
</template>
