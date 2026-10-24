<script setup>
import { Store, Users, UserRound, ShieldCheck } from 'lucide-vue-next'
import { useUsersStore } from '../../users/states/usersStore.js'

const users = useUsersStore()
</script>

<template>
  <aside class="md:sticky md:top-20 md:w-48 md:shrink-0 md:self-start">
    <nav aria-label="Menu samping" class="flex gap-2 overflow-x-auto md:flex-col md:rounded-2xl md:bg-white md:p-2 md:shadow-sm md:ring-1 md:ring-stone-200">
      <RouterLink to="/" class="nav-link"><Store :size="18" aria-hidden="true" />Barang</RouterLink>
      <RouterLink to="/users" class="nav-link"><Users :size="18" aria-hidden="true" />Pengguna</RouterLink>
      <RouterLink to="/profile" class="nav-link"><UserRound :size="18" aria-hidden="true" />Profil</RouterLink>
      <RouterLink v-if="users.profile?.role === 'admin'" to="/admin" class="nav-link"><ShieldCheck :size="18" aria-hidden="true" />Admin</RouterLink>
    </nav>
  </aside>
</template>
