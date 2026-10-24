import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '../api/userApi.js'

export const useUsersStore = defineStore('users', () => {
  const users = ref([])
  const profile = ref(null)

  async function loadUsers() {
    const res = await api.getUsers()
    if (res.success) users.value = res.data.users
    return res
  }
  async function loadProfile() {
    const res = await api.getMe()
    if (res.success) profile.value = res.data.user
    return res
  }
  async function saveProfile(payload) {
    const res = await api.updateMe(payload)
    if (res.success) await loadProfile()
    return res
  }
  async function savePhoto(file) {
    const res = await api.uploadPhoto(file)
    if (res.success) await loadProfile()
    return res
  }
  const savePassword = (payload) => api.changePassword(payload)

  return { users, profile, loadUsers, loadProfile, saveProfile, savePhoto, savePassword }
})
