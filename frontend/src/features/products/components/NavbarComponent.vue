<script setup>
import UserAvatar from '../../users/components/UserAvatar.vue'
import { LogOut } from 'lucide-vue-next'

defineProps({ profile: { type: Object, default: null } })
const emit = defineEmits(['logout'])
</script>

<template>
  <header class="sticky top-0 z-30 bg-brand text-white shadow-md">
    <nav class="flex w-full items-center gap-3 p-3 lg:px-8" aria-label="Navigasi utama">
      <RouterLink to="/" class="mr-auto flex items-center gap-2 text-lg font-extrabold tracking-tight">
        <img src="/logo.svg" alt="" class="h-8 w-8 rounded-lg" />
        <span>Oper.in</span>
      </RouterLink>
      <RouterLink v-if="profile" to="/profile" class="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-4 font-semibold transition hover:bg-white/20">
        <UserAvatar :name="profile.name" :photo="profile.photo" size="sm" />
        <span class="max-w-32 truncate">{{ profile.name }}</span>
      </RouterLink>
      <button type="button" aria-label="Keluar" class="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 font-semibold text-brand transition hover:bg-stone-200" @click="emit('logout')">
        <LogOut :size="16" aria-hidden="true" /><span class="hidden sm:inline">Keluar</span>
      </button>
    </nav>
  </header>
</template>
