<script setup lang="ts">
import { computed } from 'vue'

import type { IconName } from '@/types/icons'

const props = withDefaults(defineProps<{ name: IconName; size?: number }>(), { size: 20 })

const paths: Record<IconName, string> = {
  dashboard:
    '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  pos: '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  products:
    '<path d="M12 3 21 8l-9 5-9-5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  inventory:
    '<path d="M3 5h18v5H3z"/><path d="M3 14h18v5H3z"/><circle cx="7" cy="7.5" r=".7" fill="currentColor" stroke="none"/><circle cx="7" cy="16.5" r=".7" fill="currentColor" stroke="none"/>',
  clients:
    '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.5a3 3 0 0 1 0 5"/><path d="M18 15a5 5 0 0 1 3 4.6"/>',
  providers:
    '<path d="M3 7h11v10H3z"/><path d="M14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  purchases:
    '<path d="M4 4h2l2.2 10h9.8l2-7H8"/><circle cx="10" cy="19" r="1"/><circle cx="18" cy="19" r="1"/>',
  expenses: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/>',
  cash: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/>',
  reports: '<path d="M3 20h18M6 20v-6M11 20V8M16 20v-9M21 20V5"/>',
  companies:
    '<path d="M4 21V5l8-2v18"/><path d="M12 9h8v12"/><path d="M7 8h2M7 12h2M7 16h2M15 13h2M15 17h2"/>',
  branches: '<path d="M4 10l8-6 8 6v10H4V10Z"/><path d="M9 20v-6h6v6"/>',
  users: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9 7 7m10 10 2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  bell: '<path d="M18 9a6 6 0 0 0-12 0c0 5-2 6-2 6h16s-2-1-2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2 6"/><path d="M20 5v6h-6"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  'arrow-up': '<path d="M12 19V5M6 11l6-6 6 6"/>',
  'arrow-down': '<path d="M12 5v14M6 13l6 6 6-6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  alert: '<path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5M12 17h.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  history:
    '<path d="M3.5 12a8.5 8.5 0 1 0 2.8-6.3"/><path d="M3 4.5V10h5.5"/><path d="M12 8v4.3l3 1.8"/>',
  logout: '<path d="M10 4H5v16h5"/><path d="m14 8 4 4-4 4M18 12H9"/>',
  minus: '<path d="M5 12h14"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/><path d="M10 11v6M14 11v6"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  save: '<path d="M5 3h12l4 4v14H5V3Z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
  barcode: '<path d="M4 5v14M7 5v14M11 5v14M14 5v14M18 5v14M20 5v14"/>',
}

const svg = computed(
  () =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${props.size}" height="${props.size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[props.name]}</svg>`,
)
</script>

<template>
  <span class="inline-flex shrink-0 items-center justify-center" aria-hidden="true" v-html="svg" />
</template>
