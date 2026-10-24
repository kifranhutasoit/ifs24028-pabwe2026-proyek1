<script setup>
import { onMounted } from 'vue'
import { Users, ShieldCheck, Ban, Package, PackageOpen, PackageX, HandCoins } from 'lucide-vue-next'
import { useAdminStore } from '../states/adminStore.js'

const store = useAdminStore()
onMounted(store.loadStats)

const cards = (s) => [
  { label: 'Pengguna', value: s.users, icon: Users },
  { label: 'Admin', value: s.admins, icon: ShieldCheck },
  { label: 'Dinonaktifkan', value: s.banned, icon: Ban },
  { label: 'Total barang', value: s.products, icon: Package },
  { label: 'Barang tersedia', value: s.products_open, icon: PackageOpen },
  { label: 'Penjualan ditutup', value: s.products_closed, icon: PackageX },
  { label: 'Total tawaran', value: s.bids, icon: HandCoins },
]
const widest = (s) => Math.max(1, ...s.by_category.map((c) => c.total))
</script>

<template>
  <div v-if="store.stats" class="space-y-6">
    <ul aria-label="Statistik" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <li v-for="c in cards(store.stats)" :key="c.label" class="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
        <span class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand"><component :is="c.icon" :size="24" aria-hidden="true" /></span>
        <div>
          <p class="text-2xl font-extrabold">{{ c.value }}</p>
          <p class="text-sm text-stone-700">{{ c.label }}</p>
        </div>
      </li>
    </ul>
    <section aria-label="Barang per kategori" class="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
      <h2 class="mb-4 text-lg font-bold">Barang per kategori</h2>
      <ul class="space-y-3">
        <li v-for="c in store.stats.by_category" :key="c.name" class="flex items-center gap-3 text-sm">
          <span class="w-24 shrink-0 font-semibold">{{ c.name }}</span>
          <span class="h-3 flex-1 overflow-hidden rounded-full bg-stone-100"><span class="block h-full rounded-full bg-accent" :style="{ width: `${(c.total / widest(store.stats)) * 100}%` }"></span></span>
          <span class="w-8 text-right tabular-nums">{{ c.total }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>
