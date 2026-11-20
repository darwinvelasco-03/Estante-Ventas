<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import CurrencyText from '@/components/ui/CurrencyText.vue'
import { formatCurrency } from '@/utils/format'
import type { SaleLine } from '@/types/pos'
import QuantityStepper from './QuantityStepper.vue'

const props = defineProps<{ line: SaleLine }>()
const emit = defineEmits<{ 'update:quantity': [value: number]; remove: [] }>()
</script>

<template>
  <div class="flex items-start gap-3 py-3">
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium text-ink">{{ props.line.name }}</p>
      <p class="truncate text-[11px] text-ink-soft">
        {{ props.line.sku }} · {{ formatCurrency(props.line.unitPrice) }} c/u
      </p>
    </div>
    <div class="flex shrink-0 flex-col items-end gap-2">
      <CurrencyText
        :value="props.line.unitPrice * props.line.quantity"
        class="font-display text-base font-semibold text-ink"
      />
      <div class="flex items-center gap-1.5">
        <QuantityStepper
          :quantity="props.line.quantity"
          :max="props.line.stock"
          :label="props.line.name"
          @update:quantity="emit('update:quantity', $event)"
        />
        <button
          type="button"
          class="flex size-8 items-center justify-center rounded-sm text-ink-soft transition-colors hover:bg-brick-soft hover:text-brick"
          :aria-label="`Quitar ${props.line.name} de la venta`"
          @click="emit('remove')"
        >
          <AppIcon name="trash" :size="15" />
        </button>
      </div>
    </div>
  </div>
</template>
