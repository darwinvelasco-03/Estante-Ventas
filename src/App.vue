<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import AppShell from '@/components/layout/AppShell.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import { allNavItems } from '@/config/navigation'
import { branchLabel, setBranchByLabel } from '@/stores/branch'
import DashboardView from '@/views/DashboardView.vue'
import PosView from '@/views/PosView.vue'
import ProductsView from '@/views/ProductsView.vue'
import InventoryView from '@/views/InventoryView.vue'
import ClientsView from '@/views/ClientsView.vue'
import SuppliersView from '@/views/SuppliersView.vue'
import ConfigView from '@/views/ConfigView.vue'
import PurchasesView from '@/views/PurchasesView.vue'
import ExpensesView from '@/views/ExpensesView.vue'
import CashView from '@/views/CashView.vue'
import ReportsView from '@/views/ReportsView.vue'

const branchOptions = ['Sucursal Centro', 'Sucursal Norte', 'Todas las sucursales']
const menuOpen = ref(false)

function readRoute() {
  return window.location.hash.replace(/^#\/?/, '') || 'dashboard'
}

const route = ref(readRoute())

function onHashChange() {
  route.value = readRoute()
  menuOpen.value = false
}

onMounted(() => window.addEventListener('hashchange', onHashChange))
onUnmounted(() => window.removeEventListener('hashchange', onHashChange))

const currentItem = computed(() => allNavItems.find((item) => item.id === route.value))
const section = computed(() => currentItem.value?.label ?? 'Sección no disponible')
</script>

<template>
  <AppShell
    :branch="branchLabel"
    :branches="branchOptions"
    :section="section"
    :active="route"
    :menu-open="menuOpen"
    @toggle-menu="menuOpen = !menuOpen"
    @close-menu="menuOpen = false"
    @update:branch="setBranchByLabel"
  >
    <DashboardView v-if="route === 'dashboard'" :branch="branchLabel" />
    <PosView v-else-if="route === 'pos'" :branch="branchLabel" />
    <ProductsView v-else-if="route === 'productos'" :branch="branchLabel" />
    <InventoryView v-else-if="route === 'inventario'" :branch="branchLabel" />
    <ClientsView v-else-if="route === 'clientes'" :branch="branchLabel" />
    <SuppliersView v-else-if="route === 'proveedores'" :branch="branchLabel" />
    <ConfigView v-else-if="route === 'configuracion'" :branch="branchLabel" />
    <PurchasesView v-else-if="route === 'compras'" :branch="branchLabel" />
    <ExpensesView v-else-if="route === 'gastos'" :branch="branchLabel" />
    <CashView v-else-if="route === 'caja'" :branch="branchLabel" />
    <ReportsView v-else-if="route === 'reportes'" :branch="branchLabel" />
    <StatePanel
      v-else
      icon="clock"
      :title="`${section} en preparación`"
      message="Esta pantalla se diseñará en una etapa posterior del proyecto. Vuelve al dashboard para seguir trabajando."
    >
      <a
        href="#/dashboard"
        class="rounded-sm bg-ink px-3 py-1.5 text-xs font-medium text-surface hover:bg-ink-soft"
      >
        Ir al dashboard
      </a>
    </StatePanel>
  </AppShell>
</template>
