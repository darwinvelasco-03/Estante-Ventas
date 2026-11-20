<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import StatePanel from '@/components/ui/StatePanel.vue'
import CompanyDetail from '@/components/companies/CompanyDetail.vue'
import CompanyList from '@/components/companies/CompanyList.vue'
import CompanySheet from '@/components/companies/CompanySheet.vue'
import { useCompanyFilters, type CompanyFilter } from '@/composables/useCompanyFilters'
import {
  activeCompany,
  companyErrorText,
  findCompany,
  removeCompany,
  saveCompany,
  setActiveCompany,
  companies,
} from '@/stores/companies'
import { isSuperuser } from '@/stores/users'
import type { Company, CompanyError, CompanyInput } from '@/types/company'

const props = defineProps<{ branch: string }>()

const { query, filter, filtered, counts, hasFilters, reset } = useCompanyFilters(companies)

const params = new URLSearchParams(window.location.search)
const error = ref(
  params.get('empresas') === 'error' ? 'Revisa tu conexión e inténtalo de nuevo.' : null,
)
const selectedId = ref<string | null>(null)
const sheetOpen = ref(false)
const editing = ref<string | null>(null)
const confirmOpen = ref(false)
const notice = ref<{ text: string; tone: 'ok' | 'error' } | null>(null)

onMounted(() => {
  selectedId.value = activeCompany.value?.id ?? filtered.value[0]?.id ?? null
})

const selected = computed(() => findCompany(selectedId.value))
const editingCompany = computed(() => findCompany(editing.value))
const isActive = (company: Company | null) => !!company && company.id === activeCompany.value?.id

const tabs: { id: CompanyFilter; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'activas', label: 'Activas' },
  { id: 'inactivas', label: 'Inactivas' },
]

watch(filtered, (list) => {
  if (list.length === 0) {
    selectedId.value = null
  } else if (!list.some((company) => company.id === selectedId.value)) {
    selectedId.value = list[0]?.id ?? null
  }
})

function showError(code: CompanyError, fallback: string) {
  notice.value = { text: companyErrorText[code] ?? fallback, tone: 'error' }
}

function openNew() {
  editing.value = null
  sheetOpen.value = true
  notice.value = null
}

function openEdit(id: string) {
  editing.value = id
  selectedId.value = id
  sheetOpen.value = true
  notice.value = null
}

function onSave(input: CompanyInput, id: string | null) {
  const result = saveCompany(input, id)
  if (result.error || !result.company) {
    showError(result.error ?? 'no-encontrado', 'No pudimos guardar la empresa.')
    return
  }
  sheetOpen.value = false
  selectedId.value = result.company.id
  notice.value = { text: id ? 'Datos actualizados' : 'Empresa registrada', tone: 'ok' }
}

function onActivate() {
  if (!selected.value) return
  const result = setActiveCompany(selected.value.id)
  if (result) {
    showError(result, 'No pudimos cambiar la empresa activa.')
    return
  }
  notice.value = { text: `${selected.value.tradeName} es la empresa activa`, tone: 'ok' }
}

function onRemove() {
  if (!selected.value) return
  const name = selected.value.tradeName
  const result = removeCompany(selected.value.id)
  confirmOpen.value = false
  if (result) {
    showError(result, 'No pudimos eliminar la empresa.')
    return
  }
  selectedId.value = activeCompany.value?.id ?? filtered.value[0]?.id ?? null
  notice.value = { text: `${name} se eliminó`, tone: 'ok' }
}
</script>

<template>
  <div v-if="!isSuperuser" class="rounded-sm border border-rail bg-surface">
    <StatePanel
      icon="alert"
      tone="danger"
      title="Sin permiso"
      message="Solo un superusuario puede administrar las empresas y la empresa activa."
    />
  </div>

  <div v-else class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="font-display text-xl font-semibold tracking-tight text-ink">Empresas</h2>
        <p class="mt-0.5 text-sm text-ink-soft">
          Directorio · {{ activeCompany?.tradeName ?? 'Sin empresa activa' }} · {{ props.branch }}
        </p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 font-display text-sm font-semibold text-surface hover:bg-ink-soft"
        @click="openNew"
      >
        <AppIcon name="plus" :size="15" />
        Nueva empresa
      </button>
    </div>

    <p
      v-if="notice"
      class="flex items-center gap-1.5 text-xs"
      :class="notice.tone === 'ok' ? 'text-ok' : 'text-brick'"
      aria-live="polite"
    >
      <AppIcon :name="notice.tone === 'ok' ? 'check' : 'alert'" :size="14" />
      {{ notice.text }}
    </p>

    <div class="space-y-3">
      <div class="relative">
        <AppIcon
          name="search"
          :size="16"
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft"
        />
        <input
          id="company-search"
          :value="query"
          type="search"
          autocomplete="off"
          placeholder="Buscar razón social o identificación fiscal"
          class="w-full rounded-sm border border-rail bg-surface py-2 pr-3 pl-9 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
          @input="query = ($event.target as HTMLInputElement).value"
        />
      </div>

      <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div class="flex flex-wrap gap-x-3 gap-y-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="text-xs transition-colors"
            :class="
              filter === tab.id
                ? 'font-semibold text-ink underline decoration-2 underline-offset-4'
                : 'text-ink-soft hover:text-ink'
            "
            :aria-pressed="filter === tab.id"
            @click="filter = tab.id"
          >
            {{ tab.label }} <span class="tnum">{{ counts[tab.id] }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="grid gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(280px,5fr)]">
      <section aria-label="Directorio de empresas" class="min-w-0 rounded-sm border border-rail bg-surface">
        <CompanyList
          :companies="filtered"
          :error="error"
          :has-filters="hasFilters"
          :selected-id="selectedId"
          :active-id="activeCompany?.id ?? null"
          @retry="error = null"
          @clear-filters="reset"
          @select="selectedId = $event"
          @edit="openEdit"
        />

        <div
          class="flex flex-wrap items-center justify-between gap-2 border-t border-rail px-4 py-2.5 text-xs text-ink-soft"
        >
          <span class="tnum">{{ filtered.length }} de {{ companies.length }} empresas</span>
          <span v-if="selected">
            Ficha abierta ·
            <strong class="font-semibold text-ink">{{ selected.tradeName }}</strong>
          </span>
        </div>
      </section>

      <section aria-label="Detalle de la empresa" class="rounded-sm border border-rail bg-surface p-4">
        <CompanyDetail
          :company="selected"
          :is-active="isActive(selected)"
          @edit="openEdit(selected?.id ?? '')"
          @activate="onActivate"
          @remove="confirmOpen = true"
        />
      </section>
    </div>

    <CompanySheet
      :open="sheetOpen"
      :company="editingCompany"
      :is-active="isActive(editingCompany)"
      @close="sheetOpen = false"
      @save="onSave"
    />

    <ConfirmDialog
      v-if="confirmOpen && selected && !isActive(selected)"
      tone="danger"
      title="Eliminar empresa"
      :message="`¿Eliminar ${selected.legalName}? Esta acción no se puede deshacer.`"
      confirm-label="Eliminar empresa"
      @confirm="onRemove"
      @cancel="confirmOpen = false"
    />
  </div>
</template>
