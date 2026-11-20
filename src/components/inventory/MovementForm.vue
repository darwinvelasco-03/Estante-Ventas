<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import type { Product } from '@/types/pos'
import type { MovementInput, MovementType } from '@/types/inventory'

const props = defineProps<{
  catalog: Product[]
  initialProductId: string | null
  error: string | null
}>()

const emit = defineEmits<{
  save: [input: MovementInput]
  selectProduct: [id: string | null]
  clearError: []
}>()

const reasons: Record<MovementType, string[]> = {
  entrada: ['Compra', 'Devolución', 'Transferencia'],
  salida: ['Merma', 'Consumo', 'Transferencia'],
  conteo: ['Conteo físico'],
}
const typeLabels: Record<MovementType, string> = {
  entrada: 'Entrada',
  salida: 'Salida',
  conteo: 'Conteo',
}

const productId = ref(props.initialProductId ?? props.catalog[0]?.id ?? '')
const type = ref<MovementType>('entrada')
const quantity = ref('')
const reason = ref('Compra')
const note = ref('')

watch(
  () => props.initialProductId,
  (value) => {
    if (value) productId.value = value
  },
)

watch(type, (value) => {
  reason.value = reasons[value][0] ?? ''
  quantity.value = ''
})

const selected = computed(() => props.catalog.find((product) => product.id === productId.value) ?? null)
const qty = computed(() => Number(quantity.value))
const validQty = computed(
  () =>
    Number.isFinite(qty.value) &&
    qty.value >= 0 &&
    (type.value === 'conteo' ? quantity.value !== '' : qty.value > 0),
)

const preview = computed(() => {
  const product = selected.value
  if (!product || !validQty.value) return null
  const result =
    type.value === 'entrada'
      ? product.stock + qty.value
      : type.value === 'salida'
        ? Math.max(0, product.stock - qty.value)
        : qty.value
  return { current: product.stock, result, delta: result - product.stock }
})

const invalid = computed(() => {
  if (!selected.value || !preview.value) return true
  if (type.value === 'salida' && qty.value > selected.value.stock) return true
  if (type.value === 'conteo' && qty.value === selected.value.stock) return true
  return false
})

function onProductChange() {
  emit('selectProduct', productId.value || null)
  emit('clearError')
}

function submit() {
  if (invalid.value || !selected.value) return
  emit('save', {
    productId: selected.value.id,
    type: type.value,
    quantity: qty.value,
    reason: reason.value,
    note: note.value.trim(),
  })
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-baseline justify-between gap-3">
      <div>
        <h2 class="font-display text-base font-semibold text-ink">Registrar movimiento</h2>
        <p class="text-xs text-ink-soft">La bitácora no se corrige: cada ajuste queda registrado</p>
      </div>
    </div>

    <form id="movement-form" class="space-y-3" @submit.prevent="submit">
      <div>
        <label for="m-product" class="mb-1 block text-xs font-medium text-ink-soft">Producto</label>
        <select
          id="m-product"
          v-model="productId"
          class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
          @change="onProductChange"
        >
          <option v-for="product in props.catalog" :key="product.id" :value="product.id">
            {{ product.name }} · {{ product.sku }}
          </option>
        </select>
      </div>

      <fieldset>
        <legend class="mb-1 text-xs font-medium text-ink-soft">Tipo de movimiento</legend>
        <div class="grid grid-cols-3 gap-2">
          <label
            v-for="(label, value) in typeLabels"
            :key="value"
            class="flex cursor-pointer items-center justify-center rounded-sm border px-1 py-2 text-xs transition-colors"
            :class="
              type === value
                ? 'border-ink bg-paper font-semibold text-ink'
                : 'border-rail text-ink-soft hover:border-ink'
            "
          >
            <input
              type="radio"
              name="movement-type"
              class="sr-only"
              :value="value"
              :checked="type === value"
              @change="type = value"
            />
            {{ label }}
          </label>
        </div>
      </fieldset>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="m-quantity" class="mb-1 block text-xs font-medium text-ink-soft">
            {{ type === 'conteo' ? 'Cantidad contada' : 'Cantidad' }}
          </label>
          <input
            id="m-quantity"
            v-model="quantity"
            type="number"
            min="0"
            step="1"
            :placeholder="type === 'conteo' ? String(selected?.stock ?? 0) : '0'"
            class="tnum w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
          />
        </div>
        <div>
          <label for="m-reason" class="mb-1 block text-xs font-medium text-ink-soft">Motivo</label>
          <select
            id="m-reason"
            v-model="reason"
            class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
          >
            <option v-for="option in reasons[type]" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
      </div>

      <div>
        <label for="m-note" class="mb-1 block text-xs font-medium text-ink-soft">Nota (opcional)</label>
        <input
          id="m-note"
          v-model="note"
          type="text"
          placeholder="Pedido, anaquel, responsable…"
          class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
        />
      </div>

      <div class="rounded-sm border border-rail bg-paper px-3 py-2.5" aria-live="polite">
        <template v-if="preview">
          <div class="flex items-center justify-between gap-3 text-xs">
            <span class="text-ink-soft">Existencia actual</span>
            <span class="tnum font-medium text-ink">{{ preview.current }}</span>
          </div>
          <div class="mt-1.5 flex items-center justify-between gap-3 text-xs">
            <span class="text-ink-soft">Después del movimiento</span>
            <span class="tnum font-medium text-ink">{{ preview.result }}</span>
          </div>
          <div class="mt-1.5 flex items-center justify-between gap-3 border-t border-rail pt-1.5">
            <span class="font-display text-sm font-semibold text-ink">Ajuste</span>
            <span
              class="tnum font-display text-base font-semibold"
              :class="preview.delta >= 0 ? 'text-ok' : 'text-brick'"
            >
              {{ preview.delta >= 0 ? '+' : '−' }}{{ Math.abs(preview.delta) }}
            </span>
          </div>
        </template>
        <p v-else class="text-xs text-ink-soft">Escribe una cantidad para ver el ajuste.</p>
      </div>

      <p v-if="props.error" class="flex items-start gap-1.5 text-xs text-brick" role="alert">
        <AppIcon name="alert" :size="14" class="mt-px shrink-0" />
        {{ props.error }}
      </p>

      <button
        type="submit"
        class="flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-3 py-2.5 font-display text-sm font-semibold text-surface transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="invalid"
      >
        <AppIcon name="check" :size="15" />
        Guardar movimiento
      </button>
    </form>
  </div>
</template>
