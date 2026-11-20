<script setup lang="ts">
import { computed, ref } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import { currencyCode, currencySymbol, toUsd } from '@/stores/currency'
import { amountForInput } from '@/utils/format'
import type { Product, ProductInput } from '@/types/pos'

const props = defineProps<{
  product: Product | null
  categories: string[]
  mode: 'edit' | 'create'
  readonly?: boolean
}>()

const emit = defineEmits<{ save: [input: ProductInput]; cancel: []; remove: [] }>()

const form = ref<ProductInput>({
  barcode: props.product?.barcode ?? '',
  sku: props.product?.sku ?? '',
  name: props.product?.name ?? '',
  price: props.product?.price ?? 0,
  stock: props.product?.stock ?? 0,
  unit: props.product?.unit ?? 'und',
  category: props.product?.category ?? props.categories[1] ?? 'Abarrotes',
})

/** El formulario muestra la moneda activa; `form.price` se mantiene en USD. */
const priceInput = computed<string>({
  get: () => amountForInput(form.value.price),
  set: (value) => {
    const amount = Number(value)
    form.value.price = Number.isFinite(amount) && amount >= 0 ? toUsd(amount) : 0
  },
})

const invalid = computed(
  () =>
    !form.value.name.trim() ||
    !form.value.sku.trim() ||
    !form.value.category.trim() ||
    !Number.isFinite(form.value.price) ||
    form.value.price < 0 ||
    !Number.isFinite(form.value.stock) ||
    form.value.stock < 0,
)

function submit() {
  if (invalid.value) return
  emit('save', {
    ...form.value,
    name: form.value.name.trim(),
    sku: form.value.sku.trim(),
    barcode: form.value.barcode.trim(),
    category: form.value.category.trim(),
    stock: Math.round(form.value.stock),
  })
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-baseline justify-between gap-3">
      <div>
        <h2 class="font-display text-base font-semibold text-ink">
          {{ props.mode === 'create' ? 'Nuevo producto' : 'Ficha del producto' }}
        </h2>
        <p class="font-data text-[11px] text-ink-soft">
          {{ props.mode === 'create' ? 'Se agregará al catálogo' : props.product?.sku }}
        </p>
      </div>
      <AppIcon :name="props.mode === 'create' ? 'plus' : 'save'" :size="16" class="text-ink-soft" />
    </div>

    <form class="space-y-3" :inert="props.readonly" @submit.prevent="submit">
      <div>
        <label for="p-name" class="mb-1 block text-xs font-medium text-ink-soft">Nombre</label>
        <input
          id="p-name"
          v-model="form.name"
          type="text"
          placeholder="Harina de trigo 1 kg"
          class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="p-sku" class="mb-1 block text-xs font-medium text-ink-soft">SKU</label>
          <input
            id="p-sku"
            v-model="form.sku"
            type="text"
            placeholder="HAR-001"
            class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 font-data text-xs text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
          />
        </div>
        <div>
          <label for="p-barcode" class="mb-1 block text-xs font-medium text-ink-soft">
            Código de barras
          </label>
          <input
            id="p-barcode"
            v-model="form.barcode"
            type="text"
            inputmode="numeric"
            placeholder="7501000123456"
            class="tnum w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-xs text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="p-category" class="mb-1 block text-xs font-medium text-ink-soft">
            Categoría
          </label>
          <input
            id="p-category"
            v-model="form.category"
            type="text"
            list="product-categories"
            class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
          />
          <datalist id="product-categories">
            <option v-for="option in props.categories" :key="option" :value="option" />
          </datalist>
        </div>
        <div>
          <label for="p-unit" class="mb-1 block text-xs font-medium text-ink-soft">Presentación</label>
          <input
            id="p-unit"
            v-model="form.unit"
            type="text"
            placeholder="und"
            class="w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="p-price" class="mb-1 block text-xs font-medium text-ink-soft">Precio</label>
          <div class="relative">
            <span class="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-ink-soft">{{ currencySymbol }}</span>
            <input
              id="p-price"
              v-model="priceInput"
              type="number"
              min="0"
              step="0.01"
              class="tnum w-full rounded-sm border border-rail bg-surface py-2 pr-2 pl-11 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
            />
          </div>
        </div>
        <div>
          <label for="p-stock" class="mb-1 block text-xs font-medium text-ink-soft">Existencia</label>
          <input
            id="p-stock"
            v-model.number="form.stock"
            type="number"
            min="0"
            step="1"
            class="tnum w-full rounded-sm border border-rail bg-surface px-2.5 py-2 text-sm text-ink focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
          />
        </div>
      </div>

      <p class="text-[11px] text-ink-soft">
        Precio de etiqueta con IVA incluido. Capturado en {{ currencyCode }} y guardado en USD.
      </p>

      <p v-if="props.readonly" class="text-[11px] text-ink-soft">
        Vista agregada de solo lectura. Selecciona una sucursal para editar.
      </p>

      <button
        v-if="!props.readonly"
        type="submit"
        class="flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-3 py-2.5 font-display text-sm font-semibold text-surface transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="invalid"
      >
        <AppIcon name="check" :size="15" />
        {{ props.mode === 'create' ? 'Agregar producto' : 'Guardar cambios' }}
      </button>
    </form>

    <div v-if="!props.readonly" class="mt-3 space-y-1">
      <button
        v-if="props.mode === 'edit'"
        type="button"
        class="w-full rounded-sm px-2 py-1.5 text-left text-xs text-brick transition-colors hover:bg-brick-soft"
        @click="emit('remove')"
      >
        Quitar del catálogo
      </button>
      <button
        type="button"
        class="w-full rounded-sm px-2 py-1.5 text-left text-xs text-ink-soft transition-colors hover:text-ink"
        @click="emit('cancel')"
      >
        {{ props.mode === 'create' ? 'Cancelar' : 'Descartar cambios' }}
      </button>
    </div>
  </div>
</template>
