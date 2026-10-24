<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../auth/states/authStore.js'
import { useUsersStore } from '../../users/states/usersStore.js'
import NavbarComponent from '../components/NavbarComponent.vue'
import SidebarComponent from '../components/SidebarComponent.vue'

const router = useRouter()
const auth = useAuthStore()
const users = useUsersStore()
onMounted(users.loadProfile)

async function logout() {
  await auth.logoutUser()
  router.push('/auth/login')
}
</script>

<template>
  <div class="min-h-screen">
    <NavbarComponent :profile="users.profile" @logout="logout" />
    <div class="flex w-full flex-col gap-6 p-4 md:flex-row lg:px-8">
      <SidebarComponent />
      <main class="min-w-0 flex-1"><RouterView /></main>
    </div>
    <footer class="mt-8 border-t border-stone-300/60 p-6 text-center text-sm text-stone-700">Oper.in · Platform Jual-Beli Barang Preloved IT Del</footer>
  </div>
</template>
