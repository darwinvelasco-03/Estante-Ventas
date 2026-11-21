<script setup lang="ts">
import type { ReversalAdjustment } from '@/types/reversal'
import { formatCurrency, formatMovementDate } from '@/utils/format'

const props = defineProps<{ adjustments: ReversalAdjustment[] }>()
</script>

<template>
  <div v-if="props.adjustments.length">
    <p class="mb-2 text-[11px] font-medium tracking-wide text-ink-soft">
      Ajustes por anulación ({{ props.adjustments.length }})
    </p>
    <ul class="divide-y divide-rail border-y border-rail">
      <li
        v-for="adjustment in props.adjustments"
        :key="adjustment.id"
        class="flex items-center justify-between gap-3 py-2 text-xs"
      >
        <span class="min-w-0">
          <span class="block truncate font-medium text-ink">{{ adjustment.folio }}</span>
          <span class="block text-[11px] text-ink-soft">
            {{ adjustment.reason }} · {{ formatMovementDate(adjustment.createdAt) }}
          </span>
        </span>
        <span class="tnum shrink-0 font-medium text-ok">
          -{{ formatCurrency(adjustment.amount, 2) }}
        </span>
      </li>
    </ul>
  </div>
</template>
