import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '../api/adminApi.js'

export const useAdminStore = defineStore('admin', () => {
  const stats = ref(null)
  const users = ref([])

  async function loadStats() {
    const res = await api.getStats()
    if (res.success) stats.value = res.data.stats
    return res
  }
  async function loadUsers() {
    const res = await api.getUsers()
    if (res.success) users.value = res.data.users
    return res
  }
  const changeUser = (id, body) => api.updateUser(id, body)
  const removeUser = (id) => api.deleteUser(id)

  return { stats, users, loadStats, loadUsers, changeUser, removeUser }
})
