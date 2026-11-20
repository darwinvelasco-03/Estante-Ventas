<script setup lang="ts">
import { computed } from 'vue'

import { fromUsd } from '@/stores/currency'
import { formatCurrency } from '@/utils/format'

const props = defineProps<{ value: number; decimals?: number }>()

// El valor llega en USD; la decisión de mostrar centavos se toma ya convertido.
const converted = computed(() => fromUsd(props.value))
const formatted = computed(() =>
  formatCurrency(props.value, props.decimals ?? (Number.isInteger(converted.value) ? 0 : 2)),
)
</script>

<template>
  <span class="tnum">{{ formatted }}</span>
</template>
