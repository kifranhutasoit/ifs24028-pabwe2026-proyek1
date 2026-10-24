<script setup>
import { computed } from 'vue'
import { useUsersStore } from '../../users/states/usersStore.js'

const users = useUsersStore()
const state = computed(() => {
  if (!users.profile) return 'loading'
  return users.profile.role === 'admin' ? 'admin' : 'denied'
})
const tabs = [
  { to: '/admin', label: 'Ringkasan' },
  { to: '/admin/users', label: 'Pengguna' },
  { to: '/admin/products', label: 'Barang' },
]
</script>

<template>
  <section aria-label="Panel admin" class="space-y-6">
    <p v-if="state === 'loading'" role="status" class="text-stone-700">Memeriksa akses...</p>
    <p v-else-if="state === 'denied'" role="alert" class="rounded-2xl bg-red-50 p-6 font-semibold text-red-800">Halaman ini hanya untuk admin.</p>
    <template v-else>
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="mr-auto text-2xl font-extrabold text-brand">Panel admin</h1>
        <nav aria-label="Menu admin" class="flex gap-2">
          <RouterLink v-for="t in tabs" :key="t.to" :to="t.to" class="nav-link">{{ t.label }}</RouterLink>
        </nav>
      </div>
      <RouterView />
    </template>
  </section>
</template>
