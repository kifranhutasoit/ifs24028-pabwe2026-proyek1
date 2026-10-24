<script setup>
import { useRouter } from 'vue-router'
import { useInput } from '../../../hooks/useInput.js'
import { useAuthStore } from '../states/authStore.js'
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper.js'

const router = useRouter()
const auth = useAuthStore()
const { value: name, onInput: onName } = useInput()
const { value: email, onInput: onEmail } = useInput()
const { value: password, onInput: onPassword } = useInput()

async function submit() {
  const res = await auth.registerUser({ name: name.value, email: email.value, password: password.value })
  if (res.success) {
    await showSuccessDialog(res.message)
    router.push('/auth/login')
  } else showErrorDialog(res.message)
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <h2 class="text-lg font-semibold">Buat akun baru</h2>
    <div>
      <label for="register-name-input" class="block text-sm font-semibold mb-1">Nama</label>
      <input id="register-name-input" aria-label="Nama" required :value="name" @input="onName"
        class="w-full rounded-lg border border-stone-500 px-3 py-2" />
    </div>
    <div>
      <label for="register-email-input" class="block text-sm font-semibold mb-1">Email</label>
      <input id="register-email-input" type="email" aria-label="Email" required :value="email" @input="onEmail"
        class="w-full rounded-lg border border-stone-500 px-3 py-2" />
    </div>
    <div>
      <label for="register-password-input" class="block text-sm font-semibold mb-1">Kata sandi</label>
      <input id="register-password-input" type="password" aria-label="Kata sandi" required :value="password" @input="onPassword"
        class="w-full rounded-lg border border-stone-500 px-3 py-2" />
    </div>
    <button id="register-submit-button" type="submit" aria-label="Daftar"
      class="w-full rounded-lg bg-brand px-4 py-2 font-semibold text-white">Daftar</button>
    <p class="text-sm">Sudah punya akun?
      <RouterLink to="/auth/login" class="font-semibold text-brand underline">Masuk</RouterLink>
    </p>
  </form>
</template>
