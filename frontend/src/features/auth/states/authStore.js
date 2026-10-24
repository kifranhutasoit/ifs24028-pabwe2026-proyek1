import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, register, logout } from '../api/authApi.js'
import { getAccessToken, putAccessToken, removeAccessToken } from '../../../helpers/apiHelper.js'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getAccessToken())
  const profile = ref(null)
  const isAuthLogin = ref(false)
  const isAuthRegister = ref(false)
  const isAuthLogout = ref(false)

  async function loginUser(payload) {
    const res = await login(payload)
    isAuthLogin.value = Boolean(res.success)
    if (res.success) {
      token.value = res.data.token
      putAccessToken(res.data.token)
    }
    return res
  }

  async function registerUser(payload) {
    const res = await register(payload)
    isAuthRegister.value = Boolean(res.success)
    return res
  }

  async function logoutUser() {
    try {
      await logout()
    } finally {
      removeAccessToken()
      token.value = null
      profile.value = null
      isAuthLogin.value = false
      isAuthLogout.value = true
    }
  }

  return { token, profile, isAuthLogin, isAuthRegister, isAuthLogout, loginUser, registerUser, logoutUser }
})
