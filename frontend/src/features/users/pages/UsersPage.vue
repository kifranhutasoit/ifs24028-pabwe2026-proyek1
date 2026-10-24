<script setup>
import { onMounted } from 'vue'
import { useUsersStore } from '../states/usersStore.js'
import UserAvatar from '../components/UserAvatar.vue'

const store = useUsersStore()
onMounted(store.loadUsers)
</script>

<template>
  <section aria-label="Daftar pengguna">
    <h1 class="mb-4 text-2xl font-extrabold text-brand">Pengguna</h1>
    <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      <li v-for="user in store.users" :key="user.id" class="flex items-center gap-4 rounded-2xl bg-white p-4 shadow">
        <UserAvatar :name="user.name" :photo="user.photo" size="lg" />
        <div class="min-w-0">
          <p class="truncate font-bold">{{ user.name }}</p>
          <p class="truncate text-sm text-stone-700">{{ user.email }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>
