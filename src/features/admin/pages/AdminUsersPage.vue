<script setup>
import { onMounted } from 'vue'
import UserAvatar from '../../users/components/UserAvatar.vue'
import { useAdminStore } from '../states/adminStore.js'
import { useUsersStore } from '../../users/states/usersStore.js'
import { formatDate, showSuccessDialog, showErrorDialog, showConfirmDialog } from '../../../helpers/toolsHelper.js'

const admin = useAdminStore()
const users = useUsersStore()
onMounted(admin.loadUsers)

async function act(call, confirmMessage) {
  if (confirmMessage && !(await showConfirmDialog(confirmMessage))) return
  const res = await call()
  if (res.success) {
    showSuccessDialog(res.message)
    await admin.loadUsers()
  } else showErrorDialog(res.message)
}
const toggleRole = (u) => act(() => admin.changeUser(u.id, { role: u.role === 'admin' ? 'user' : 'admin' }))
const toggleActive = (u) => act(() => admin.changeUser(u.id, { is_active: !u.is_active }))
const remove = (u) => act(() => admin.removeUser(u.id), `Hapus pengguna ${u.name} beserta semua barangnya?`)
const btn = 'rounded-lg border px-3 py-1.5 text-sm font-semibold transition'
</script>

<template>
  <section aria-label="Kelola pengguna" class="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
    <table class="w-full min-w-[44rem] text-left text-sm">
      <thead class="bg-stone-50 text-stone-700">
        <tr><th class="p-3">Pengguna</th><th class="p-3">Peran</th><th class="p-3">Status</th><th class="p-3">Barang</th><th class="p-3">Tawaran</th><th class="p-3">Bergabung</th><th class="p-3"><span class="sr-only">Aksi</span></th></tr>
      </thead>
      <tbody class="divide-y divide-stone-100">
        <tr v-for="u in admin.users" :key="u.id">
          <td class="p-3">
            <div class="flex items-center gap-3">
              <UserAvatar :name="u.name" :photo="u.photo" size="sm" />
              <div class="min-w-0"><p class="truncate font-semibold">{{ u.name }}</p><p class="truncate text-xs text-stone-600">{{ u.email }}</p></div>
            </div>
          </td>
          <td class="p-3"><span :class="['rounded-full px-2.5 py-1 text-xs font-bold', u.role === 'admin' ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-800']">{{ u.role === 'admin' ? 'Admin' : 'Pengguna' }}</span></td>
          <td class="p-3"><span :class="['rounded-full px-2.5 py-1 text-xs font-bold', u.is_active ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-800']">{{ u.is_active ? 'Aktif' : 'Nonaktif' }}</span></td>
          <td class="p-3 tabular-nums">{{ u.product_count }}</td>
          <td class="p-3 tabular-nums">{{ u.bid_count }}</td>
          <td class="p-3 whitespace-nowrap">{{ formatDate(u.created_at) }}</td>
          <td class="p-3">
            <div v-if="u.id !== users.profile?.id" class="flex flex-wrap justify-end gap-2">
              <button type="button" :aria-label="u.role === 'admin' ? `Jadikan pengguna ${u.name}` : `Jadikan admin ${u.name}`" :class="[btn, 'border-brand text-brand hover:bg-brand/10']" @click="toggleRole(u)">{{ u.role === 'admin' ? 'Jadikan pengguna' : 'Jadikan admin' }}</button>
              <button type="button" :aria-label="u.is_active ? `Nonaktifkan ${u.name}` : `Aktifkan ${u.name}`" :class="[btn, 'border-stone-400 text-stone-800 hover:bg-stone-100']" @click="toggleActive(u)">{{ u.is_active ? 'Nonaktifkan' : 'Aktifkan' }}</button>
              <button type="button" :aria-label="`Hapus ${u.name}`" :class="[btn, 'border-red-800 text-red-800 hover:bg-red-50']" @click="remove(u)">Hapus</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
