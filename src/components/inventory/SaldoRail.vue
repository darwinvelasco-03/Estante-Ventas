<script setup lang="ts">
const props = defineProps<{ tone: 'ink' | 'mustard' | 'brick'; last: boolean }>()

const dots = { ink: 'bg-ink', mustard: 'bg-mustard', brick: 'bg-brick' }
</script>

<template>
  <span class="relative flex w-4 shrink-0 justify-center self-stretch" aria-hidden="true">
    <span
      v-if="!props.last"
      class="ledger-line absolute top-2 bottom-0 left-1/2 w-px -translate-x-1/2 bg-rail"
    />
    <span class="relative mt-2 size-2 rounded-full ring-2 ring-surface" :class="dots[props.tone]" />
  </span>
</template>
