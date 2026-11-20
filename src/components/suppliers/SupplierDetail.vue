<script setup lang="ts">
import { computed } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import type { Supplier } from '@/types/supplier'
import { formatCurrency } from '@/utils/format'
import DeliveryWeek from './DeliveryWeek.vue'

const props = defineProps<{ supplier: Supplier | null; readonly?: boolean }>()

const emit = defineEmits<{ edit: []; remove: []; create: [] }>()

const phoneHref = computed(() => {
  const digits = props.supplier?.phone.replace(/\D/g, '') ?? ''
  return digits ? `tel:${digits}` : null
})
const minimum = computed(() =>
  props.supplier && props.supplier.minimum > 0
    ? formatCurrency(props.supplier.minimum)
    : 'Sin mínimo',
)
</script>

<template>
  <div>
    <StatePanel
      v-if="!props.supplier"
      icon="providers"
      title="Selecciona un proveedor"
      message="Abre una ficha para ver sus datos, o da de alta a alguien nuevo."
    >
      <button
        v-if="!props.readonly"
        type="button"
        class="rounded-sm border border-rail px-3 py-1.5 text-xs font-medium text-ink hover:border-ink"
        @click="emit('create')"
      >
        Nuevo proveedor
      </button>
    </StatePanel>

    <template v-else>
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[11px] font-medium text-ink-soft">Ficha</p>
          <h2 class="mt-1 font-display text-lg leading-tight font-semibold text-ink">
            {{ props.supplier.name }}
          </h2>
          <p v-if="props.supplier.contact" class="mt-0.5 text-sm text-ink-soft">
            {{ props.supplier.contact }}
          </p>
        </div>
        <StatusTag
          v-if="props.supplier.deliveryDays.length === 0"
          tone="danger"
          label="Sin entrega"
        />
      </div>

      <dl class="mt-5 divide-y divide-rail border-y border-rail">
        <div class="flex items-start justify-between gap-4 py-2.5">
          <dt class="shrink-0 text-xs text-ink-soft">Teléfono</dt>
          <dd class="min-w-0 text-right text-sm text-ink">
            <a
              v-if="phoneHref"
              :href="phoneHref"
              class="tnum underline decoration-rail underline-offset-2 hover:decoration-ink"
            >
              {{ props.supplier.phone }}
            </a>
            <span v-else class="text-ink-soft">Sin teléfono</span>
          </dd>
        </div>
        <div class="flex items-start justify-between gap-4 py-2.5">
          <dt class="shrink-0 text-xs text-ink-soft">Línea</dt>
          <dd class="min-w-0 max-w-[65%] text-right text-sm leading-relaxed text-ink">
            {{ props.supplier.line || 'Sin línea registrada' }}
          </dd>
        </div>
        <div class="flex items-start justify-between gap-4 py-2.5">
          <dt class="shrink-0 text-xs text-ink-soft">Pedido mínimo</dt>
          <dd class="min-w-0 text-right text-sm font-medium text-ink">{{ minimum }}</dd>
        </div>
        <div class="flex items-start justify-between gap-4 py-2.5">
          <dt class="shrink-0 text-xs text-ink-soft">Pago</dt>
          <dd class="min-w-0 text-right text-sm text-ink">{{ props.supplier.paymentTerms }}</dd>
        </div>
        <div class="flex items-start justify-between gap-4 py-2.5">
          <dt class="shrink-0 text-xs text-ink-soft">Entrega</dt>
          <dd class="min-w-0 text-right">
            <DeliveryWeek :days="props.supplier.deliveryDays" align="end" />
          </dd>
        </div>
        <div class="flex items-start justify-between gap-4 py-2.5">
          <dt class="shrink-0 text-xs text-ink-soft">Nota</dt>
          <dd class="min-w-0 max-w-[65%] text-right text-sm leading-relaxed text-ink">
            {{ props.supplier.note || 'Sin nota' }}
          </dd>
        </div>
      </dl>

      <div v-if="!props.readonly" class="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 font-display text-sm font-semibold text-surface hover:bg-ink-soft"
          @click="emit('edit')"
        >
          <AppIcon name="save" :size="15" />
          Editar ficha
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-sm border border-brick/40 px-3 py-2 text-sm text-brick hover:border-brick"
          @click="emit('remove')"
        >
          <AppIcon name="trash" :size="15" />
          Eliminar
        </button>
      </div>
    </template>
  </div>
</template>
