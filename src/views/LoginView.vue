<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import AppIcon from '@/components/ui/AppIcon.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import { branchOptions } from '@/config/branches'
import { platform } from '@/config/platform'
import { login, userErrorText, users } from '@/stores/users'
import type { UserError } from '@/types/user'

const email = ref('')
const password = ref('')
const error = ref<UserError | null>(null)
const emailInput = ref<HTMLInputElement | null>(null)

const demoAccounts = computed(() =>
  users.value
    .filter((user) => user.active)
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      scope:
        user.role === 'superuser'
          ? 'Todas las sucursales'
          : user.branches
              .map((key) => branchOptions.find((option) => option.id === key)?.label ?? key)
              .join(' y '),
    })),
)

onMounted(() => emailInput.value?.focus())

function fill(account: (typeof demoAccounts.value)[number]) {
  email.value = account.email
  password.value = account.password
  error.value = null
}

function submit() {
  error.value = login(email.value, password.value)
}
</script>

<template>
  <div class="min-h-screen bg-paper lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
    <section
      class="hidden flex-col justify-between bg-ink px-10 py-12 text-surface lg:flex xl:px-14"
      aria-hidden="true"
    >
      <div class="flex items-center gap-3">
        <span class="flex size-9 items-center justify-center rounded-sm bg-mint/15">
          <span class="flex flex-col gap-[3px]">
            <span class="block h-[2px] w-5 bg-mint" />
            <span class="block h-[2px] w-4 bg-mint" />
            <span class="block h-[2px] w-5 bg-mint" />
          </span>
        </span>
        <span class="font-display text-lg font-bold tracking-[0.12em] uppercase">
          {{ platform.brand }}
        </span>
      </div>

      <div class="max-w-md">
        <p class="font-display text-[11px] font-medium tracking-[0.18em] text-mint uppercase">
          Control de acceso
        </p>
        <p class="mt-4 font-display text-4xl leading-tight font-semibold tracking-tight xl:text-5xl">
          Cada usuario, en su estante.
        </p>
        <p class="mt-5 text-sm leading-relaxed text-[#C6D8CF]">
          Los superusuarios ven el resumen de toda la operación. Los usuarios sucursal trabajan
          solo en las tiendas que se les asignan.
        </p>
        <div class="mt-8 h-px w-24 bg-mint/50" />
        <p class="mt-5 font-display text-xs tracking-[0.16em] text-[#8FB0A3] uppercase">
          {{ platform.tagline }}
        </p>
      </div>

      <p class="font-data text-[11px] text-[#8FB0A3]">
        Entorno de demostración · datos guardados en este navegador
      </p>
    </section>

    <main class="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
      <div class="w-full max-w-md">
        <div class="mb-8 flex items-center gap-3 lg:hidden">
          <span class="flex size-9 items-center justify-center rounded-sm bg-ink">
            <span class="flex flex-col gap-[3px]">
              <span class="block h-[2px] w-5 bg-mint" />
              <span class="block h-[2px] w-4 bg-mint" />
              <span class="block h-[2px] w-5 bg-mint" />
            </span>
          </span>
          <span class="font-display text-base font-bold tracking-[0.12em] text-ink uppercase">
            {{ platform.brand }}
          </span>
        </div>

        <h1 class="font-display text-2xl font-semibold tracking-tight text-ink">
          Ingresar a {{ platform.brand }}
        </h1>
        <p class="mt-1 text-sm text-ink-soft">Usa tu correo y contraseña para continuar.</p>

        <form class="mt-6 space-y-4" @submit.prevent="submit">
          <div>
            <label for="login-email" class="mb-1.5 block text-xs font-medium text-ink-soft">
              Correo
            </label>
            <input
              id="login-email"
              ref="emailInput"
              v-model="email"
              type="email"
              autocomplete="username"
              placeholder="nombre@estante.local"
              class="w-full rounded-sm border border-rail bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              :aria-invalid="!!error"
              @input="error = null"
            />
          </div>

          <div>
            <label for="login-password" class="mb-1.5 block text-xs font-medium text-ink-soft">
              Contraseña
            </label>
            <input
              id="login-password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full rounded-sm border border-rail bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/70 focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink/20"
              :aria-invalid="!!error"
              @input="error = null"
            />
          </div>

          <p v-if="error" class="flex items-start gap-1.5 text-xs text-brick" role="alert">
            <AppIcon name="alert" :size="14" class="mt-px shrink-0" />
            {{ userErrorText[error] }}
          </p>

          <button
            type="submit"
            class="flex w-full items-center justify-center gap-2 rounded-sm bg-ink px-4 py-2.5 font-display text-sm font-semibold text-surface transition-colors hover:bg-ink-soft"
          >
            <AppIcon name="check" :size="16" />
            Ingresar
          </button>
        </form>

        <section class="mt-8 rounded-sm border border-rail bg-surface" aria-labelledby="demo-accounts-title">
          <div class="flex items-center justify-between gap-3 border-b border-rail px-4 py-3">
            <h2 id="demo-accounts-title" class="font-display text-sm font-semibold text-ink">
              Cuentas de demostración
            </h2>
            <span class="text-[11px] text-ink-soft">Un clic para llenar</span>
          </div>
          <ul class="divide-y divide-rail">
            <li v-for="account in demoAccounts" :key="account.id">
              <button
                type="button"
                class="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-3 text-left transition-colors hover:bg-paper"
                :aria-label="`Usar cuenta de ${account.name}, ${account.scope}`"
                @click="fill(account)"
              >
                <span class="min-w-0">
                  <span class="block truncate text-xs font-medium text-ink">{{ account.name }}</span>
                  <span class="block truncate font-data text-[11px] text-ink-soft">
                    {{ account.email }} · {{ account.password }}
                  </span>
                </span>
                <span class="flex items-center gap-2">
                  <span class="hidden text-[11px] text-ink-soft sm:inline">{{ account.scope }}</span>
                  <StatusTag
                    :tone="account.role === 'superuser' ? 'ok' : 'neutral'"
                    :label="account.role === 'superuser' ? 'Admin' : 'Sucursal'"
                  />
                </span>
              </button>
            </li>
          </ul>
        </section>

        <p class="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-ink-soft">
          <AppIcon name="alert" :size="13" class="mt-px shrink-0 text-mustard" />
          Demo local: las cuentas y contraseñas se guardan en este navegador sin cifrar. No uses
          contraseñas reales; la gestión de usuarios de verdad requiere un servidor.
        </p>
      </div>
    </main>
  </div>
</template>
