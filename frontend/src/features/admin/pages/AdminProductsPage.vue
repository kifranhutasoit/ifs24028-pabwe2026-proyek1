<script setup>
import { onMounted } from 'vue'
import { useProductsStore } from '../../products/states/productsStore.js'
import { formatRupiah, showSuccessDialog, showErrorDialog, showConfirmDialog } from '../../../helpers/toolsHelper.js'

const store = useProductsStore()
const load = () => store.loadProducts({})
onMounted(load)

async function remove(p) {
  if (!(await showConfirmDialog(`Hapus barang "${p.title}"?`))) return
  const res = await store.removeProduct(p.id)
  if (res.success) {
    showSuccessDialog(res.message)
    await load()
  } else showErrorDialog(res.message)
}
</script>

<template>
  <section aria-label="Kelola barang">
    <p v-if="store.products.length === 0" class="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-600">Belum ada barang.</p>
    <ul class="divide-y divide-stone-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
      <li v-for="p in store.products" :key="p.id" class="flex flex-wrap items-center gap-3 p-4">
        <div class="mr-auto min-w-0">
          <RouterLink :to="`/products/${p.id}`" class="block truncate font-bold text-brand hover:underline">{{ p.title }}</RouterLink>
          <p class="text-sm text-stone-700">{{ p.category }} · {{ formatRupiah(p.start_bid) }} · oleh {{ p.author.name }}</p>
        </div>
        <button type="button" :aria-label="`Hapus barang ${p.title}`" class="rounded-lg border border-red-800 px-3 py-1.5 text-sm font-semibold text-red-800 transition hover:bg-red-50" @click="remove(p)">Hapus</button>
      </li>
    </ul>
  </section>
</template>
