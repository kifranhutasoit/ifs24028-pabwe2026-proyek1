<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '../states/productsStore.js'
import UserAvatar from '../../users/components/UserAvatar.vue'
import AddModal from '../modals/AddModal.vue'
import { Plus, Search, PackageOpen, CalendarClock } from 'lucide-vue-next'
import { CATEGORIES } from '../categories.js'
import { formatRupiah, formatDate, isClosedAt } from '../../../helpers/toolsHelper.js'

const store = useProductsStore()
const tabs = [
  { id: 'all', label: 'Semua', filters: {} },
  { id: 'mine', label: 'Barang saya', filters: { is_me: true } },
  { id: 'open', label: 'Tersedia', filters: { is_closed: false } },
  { id: 'closed', label: 'Ditutup', filters: { is_closed: true } },
]
const tab = ref('all')
const search = ref('')
const category = ref('Semua')
const categoryOptions = ['Semua', ...CATEGORIES]
const showAdd = ref(false)

const shown = computed(() => store.products.filter((a) =>
  a.title.toLowerCase().includes(search.value.toLowerCase()) && (category.value === 'Semua' || a.category === category.value)))
function load(t) {
  tab.value = t.id
  return store.loadProducts(t.filters)
}
onMounted(() => load(tabs[0]))
</script>

<template>
  <section aria-label="Daftar barang" class="space-y-6">
    <div class="flex flex-wrap items-center gap-3 rounded-2xl bg-gradient-to-r from-brand to-brand/80 p-5 text-white shadow-sm">
      <div class="mr-auto">
        <h1 class="text-2xl font-extrabold">Barang preloved</h1>
        <p class="text-sm text-white/85">Temukan barang bekas berkualitas dari sesama warga IT Del.</p>
      </div>
      <button type="button" aria-label="Jual barang" class="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 font-bold text-brand shadow-sm transition hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" @click="showAdd = true">
        <Plus :size="18" aria-hidden="true" />Jual barang
      </button>
    </div>
    <div class="flex flex-col gap-3 md:flex-row md:items-center">
      <div role="tablist" class="flex flex-wrap gap-2">
        <button v-for="t in tabs" :key="t.id" role="tab" type="button" :aria-selected="tab === t.id" :aria-label="t.label"
          class="rounded-full border border-stone-300 bg-white px-4 py-1.5 text-sm font-semibold text-stone-700 transition hover:border-brand hover:text-brand aria-selected:border-brand aria-selected:bg-brand aria-selected:text-white" @click="load(t)">{{ t.label }}</button>
      </div>
      <div class="relative md:ml-auto md:w-72">
        <Search :size="18" aria-hidden="true" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
        <input v-model="search" type="search" aria-label="Cari barang" placeholder="Cari nama barang" class="w-full rounded-xl border border-stone-300 bg-white py-2 pl-10 pr-3 transition focus:border-brand focus:outline-2 focus:outline-brand/30" />
      </div>
    </div>
    <div role="group" aria-label="Kategori" class="flex gap-2 overflow-x-auto pb-1">
      <button v-for="c in categoryOptions" :key="c" type="button" :aria-pressed="category === c" :aria-label="`Kategori ${c}`"
        class="shrink-0 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-sm font-semibold text-stone-700 transition hover:border-accent hover:text-accent aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-white" @click="category = c">{{ c }}</button>
    </div>
    <p v-if="shown.length === 0" class="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-600">Belum ada barang yang cocok.</p>
    <ul class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      <li v-for="a in shown" :key="a.id">
        <article class="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-xl focus-within:ring-2 focus-within:ring-brand">
          <div class="relative aspect-4/3 overflow-hidden bg-stone-100">
            <img v-if="a.cover" loading="lazy" decoding="async" :src="a.cover" :alt="`Foto ${a.title}`" class="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
            <div v-else class="grid h-full place-items-center bg-gradient-to-br from-brand/10 to-accent/15 text-brand/40">
              <PackageOpen :size="44" :stroke-width="1.5" aria-hidden="true" />
            </div>
            <span v-if="isClosedAt(a.closed_at)" class="absolute left-3 top-3 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800 shadow-sm">Penjualan ditutup</span>
            <span v-else class="absolute left-3 top-3 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-900 shadow-sm">Masih tersedia</span>
          </div>
          <div class="flex flex-1 flex-col gap-2 p-4">
            <p class="text-xs font-bold uppercase tracking-wide text-brand/70">{{ a.category }}</p>
            <h2 class="line-clamp-2 min-h-[2.5rem] text-base font-bold leading-snug"><RouterLink :to="`/products/${a.id}`" class="text-stone-900 after:absolute after:inset-0 hover:text-brand">{{ a.title }}</RouterLink></h2>
            <p class="text-xl font-extrabold text-accent">{{ formatRupiah(a.start_bid) }}</p>
            <p class="flex items-center gap-1.5 text-xs text-stone-600"><CalendarClock :size="14" aria-hidden="true" /><span>Dijual hingga {{ formatDate(a.closed_at) }}</span></p>
            <div class="mt-auto flex items-center gap-2 border-t border-stone-100 pt-3 text-sm text-stone-700">
              <UserAvatar :name="a.author.name" :photo="a.author.photo" size="sm" />
              <span class="truncate font-medium">{{ a.author.name }}</span>
            </div>
          </div>
        </article>
      </li>
    </ul>
    <AddModal v-if="showAdd" @close="showAdd = false" @saved="load(tabs[0])" />
  </section>
</template>
