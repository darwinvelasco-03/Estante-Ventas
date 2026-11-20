<script setup lang="ts">
import { computed } from 'vue'

import CurrencyText from '@/components/ui/CurrencyText.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import { currencySymbol, toUsd } from '@/stores/currency'
import { amountForInput } from '@/utils/format'
import type { Client } from '@/types/client'
import type { SaleLine as SaleLineData } from '@/types/pos'
import SaleLine from './SaleLine.vue'

const props = defineProps<{
  lines: SaleLineData[]
  clients: Client[]
  clientId: string | null
  customer: string
  subtotal: number
  discount: number
  total: number
  itemCount: number
}>()

const emit = defineEmits<{
  'update:clientId': [value: string | null]
  'update:customer': [value: string]
  'update:discount': [value: number]
  'update:quantity': [id: string, value: number]
  remove: [id: string]
}>()

const chosen = computed(() => props.clients.find((client) => client.id === props.clientId) ?? null)

function onClientChange(event: Event) {
  const id = (event.target as HTMLSelectElement).value || null
  emit('update:clientId', id)
  emit('update:customer', props.clients.find((client) => client.id === id)?.name ?? '')
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-baseline justify-between gap-3">
      <div>
        <h2 class="font-display text-base font-semibold text-ink">Venta en curso</h2>
        <p class="text-xs text-ink-soft">
          {{ props.itemCount }} {{ props.itemCount === 1 ? 'artículo' : 'artículos' }} · sin folio
        </p>
      </div>
      <span class="text-xs text-ink-soft">IVA incluido</span>
    </div>

    <label for="sale-customer" class="mb-1.5 block text-xs font-medium text-ink-soft">
      Cliente (opcional)
    </label>
    <select
      id="sale-customer"
      :value="props.clientId ?? ''"
      class="w-full rounded-sm border border-rail bg-surface px-3 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
      @change="onClientChange"
    >
      <option value="">Cliente ocasional</option>
      <option v-for="client in props.clients" :key="client.id" :value="client.id">
        {{ client.name }}{{ client.alias ? ` · ${client.alias}` : '' }}
      </option>
    </select>
    <input
      v-if="!props.clientId"
      id="sale-customer-name"
      :value="props.customer"
      type="text"
      placeholder="Nombre o teléfono (opcional)"
      class="mt-2 mb-4 w-full rounded-sm border border-rail bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
      @input="emit('update:customer', ($event.target as HTMLInputElement).value)"
    />
    <p v-else-if="chosen" class="mt-1.5 mb-4 truncate text-xs text-ink-soft">
      {{ chosen.phone || 'Sin teléfono registrado' }}
    </p>

    <StatePanel
      v-if="props.lines.length === 0"
      icon="barcode"
      title="Escanea un producto para empezar"
      message="La venta aparecerá aquí línea por línea. El campo de búsqueda ya está listo."
    />

    <template v-else>
      <div class="divide-y divide-rail">
        <SaleLine
          v-for="line in props.lines"
          :key="line.id"
          :line="line"
          @update:quantity="emit('update:quantity', line.id, $event)"
          @remove="emit('remove', line.id)"
        />
      </div>

      <div class="my-4 border-t border-dashed border-rail" aria-hidden="true" />

      <div class="space-y-2 text-sm">
        <div class="flex items-center justify-between gap-3">
          <span class="text-ink-soft">Subtotal</span>
          <CurrencyText :value="props.subtotal" class="text-ink" />
        </div>
        <div class="flex items-center justify-between gap-3">
          <label for="sale-discount" class="text-ink-soft">Descuento</label>
          <div class="relative w-28">
            <span class="absolute top-1/2 left-2 -translate-y-1/2 text-xs text-ink-soft">{{ currencySymbol }}</span>
            <input
              id="sale-discount"
              type="number"
              min="0"
              :max="amountForInput(props.subtotal)"
              :value="amountForInput(props.discount)"
              class="tnum w-full rounded-sm border border-rail bg-surface py-1 pr-2 pl-10 text-right text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              @change="
                emit(
                  'update:discount',
                  toUsd(Number(($event.target as HTMLInputElement).value)),
                )
              "
            />
          </div>
        </div>
        <div class="flex items-baseline justify-between gap-3 border-t border-rail pt-3" aria-live="polite">
          <span class="font-display font-semibold text-ink">Total</span>
          <CurrencyText
            :value="props.total"
            class="font-display text-2xl font-bold tracking-tight text-ink"
          />
        </div>
      </div>
    </template>
  </div>
</template>
