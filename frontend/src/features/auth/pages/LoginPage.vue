<script setup>
import { useRouter } from 'vue-router'
import { useInput } from '../../../hooks/useInput.js'
import { useAuthStore } from '../states/authStore.js'
import { showErrorDialog } from '../../../helpers/toolsHelper.js'

const router = useRouter()
const auth = useAuthStore()
const { value: email, onInput: onEmail } = useInput()
const { value: password, onInput: onPassword } = useInput()

async function submit() {
  const res = await auth.loginUser({ email: email.value, password: password.value })
  if (res.success) router.push('/')
  else showErrorDialog(res.message)
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <h2 class="text-lg font-semibold">Masuk ke akun Anda</h2>
    <div>
      <label for="login-email-input" class="block text-sm font-semibold mb-1">Email</label>
      <input id="login-email-input" type="email" aria-label="Email" required :value="email" @input="onEmail"
        class="w-full rounded-lg border border-stone-500 px-3 py-2" />
    </div>
    <div>
      <label for="login-password-input" class="block text-sm font-semibold mb-1">Kata sandi</label>
      <input id="login-password-input" type="password" aria-label="Kata sandi" required :value="password" @input="onPassword"
        class="w-full rounded-lg border border-stone-500 px-3 py-2" />
    </div>
    <button id="login-submit-button" type="submit" aria-label="Masuk"
      class="w-full rounded-lg bg-brand px-4 py-2 font-semibold text-white">Masuk</button>
    <p class="text-sm">Belum punya akun?
      <RouterLink to="/auth/register" class="font-semibold text-brand underline">Daftar</RouterLink>
    </p>
  </form>
</template>
