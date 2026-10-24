<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '../states/productsStore.js'
import { useUsersStore } from '../../users/states/usersStore.js'
import UserAvatar from '../../users/components/UserAvatar.vue'
import MarkdownViewer from '../components/MarkdownViewer.vue'
import BidModal from '../modals/BidModal.vue'
import ChangeModal from '../modals/ChangeModal.vue'
import ChangeCoverModal from '../modals/ChangeCoverModal.vue'
import { formatRupiah, formatDate, isClosedAt, showSuccessDialog, showErrorDialog, showConfirmDialog } from '../../../helpers/toolsHelper.js'

const route = useRoute()
const router = useRouter()
const store = useProductsStore()
const users = useUsersStore()
const modal = ref('')
const ownerActions = [
  { key: 'change', label: 'Ubah barang' },
  { key: 'cover', label: 'Ubah foto' },
]
const isOwner = computed(() => users.profile.id === store.product.user_id)
const isClosed = computed(() => isClosedAt(store.product.closed_at))
const sortedBids = computed(() => [...store.product.bids].sort((a, b) => b.bid - a.bid))
const currentBid = computed(() => Math.max(store.product.start_bid, ...store.product.bids.map((b) => b.bid)))
const load = () => store.loadProduct(route.params.productId)
const closeModal = () => { modal.value = '' }
watch(() => route.params.productId, load, { immediate: true })

async function cancelBid() {
  if (!(await showConfirmDialog('Batalkan tawaran Anda?'))) return
  const res = await store.removeBid(route.params.productId)
  if (res.success) {
    showSuccessDialog(res.message)
    await load()
  } else showErrorDialog(res.message)
}

async function remove() {
  if (!(await showConfirmDialog('Hapus barang ini?'))) return
  const res = await store.removeProduct(route.params.productId)
  if (res.success) {
    await showSuccessDialog(res.message)
    router.push('/')
  } else showErrorDialog(res.message)
}
</script>

<template>
  <article v-if="store.product" class="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
    <img v-if="store.product.cover" :src="store.product.cover" :alt="`Foto ${store.product.title}`" class="aspect-video max-h-96 w-full rounded-2xl bg-stone-100 object-cover" />
    <h1 class="text-2xl font-extrabold text-brand">{{ store.product.title }}</h1>
    <div class="flex items-center gap-3 text-sm">
      <UserAvatar :name="store.product.author.name" :photo="store.product.author.photo" />
      <p>Dijual oleh <span class="font-semibold">{{ store.product.author.name }}</span></p>
    </div>
    <MarkdownViewer :source="store.product.description" />
    <p class="text-2xl font-extrabold text-accent">Harga {{ formatRupiah(store.product.start_bid) }}</p>
    <p class="text-sm">Dijual hingga {{ formatDate(store.product.closed_at) }}</p>
    <output v-if="isClosed" class="block font-semibold text-red-800">Penjualan sudah ditutup</output>
    <section aria-label="Tawaran">
      <h2 class="mb-2 text-lg font-bold">Tawaran ({{ sortedBids.length }})</h2>
      <p v-if="sortedBids.length === 0" class="text-stone-700">Belum ada tawaran</p>
      <ul v-else aria-label="Daftar tawaran" class="divide-y divide-stone-200">
        <li v-for="b in sortedBids" :key="b.id" class="flex justify-between gap-2 py-2">
          <span class="font-semibold">{{ formatRupiah(b.bid) }}<span v-if="b.user" class="font-normal"> oleh {{ b.user.name }}</span></span>
          <span class="text-sm text-stone-700">{{ formatDate(b.created_at) }}</span>
        </li>
      </ul>
    </section>
    <div v-if="users.profile" class="flex flex-wrap items-center gap-2">
      <template v-if="isOwner">
        <button v-for="a in ownerActions" :key="a.key" type="button" :aria-label="a.label"
          class="rounded-lg bg-brand px-4 py-2 font-semibold text-white transition hover:bg-brand/90" @click="modal = a.key">{{ a.label }}</button>
        <button type="button" aria-label="Hapus barang" class="rounded-lg border border-red-800 px-4 py-2 font-semibold text-red-800 transition hover:bg-red-50" @click="remove">Hapus barang</button>
      </template>
      <template v-else-if="!isClosed">
        <template v-if="store.product.my_bid">
          <p class="mr-2">Tawaran Anda <strong>{{ formatRupiah(store.product.my_bid.bid) }}</strong></p>
          <button type="button" aria-label="Batalkan tawaran" class="rounded-lg border border-red-800 px-4 py-2 font-semibold text-red-800 transition hover:bg-red-50" @click="cancelBid">Batalkan tawaran</button>
        </template>
        <button v-else type="button" aria-label="Tawar" class="rounded-lg bg-brand px-4 py-2 font-semibold text-white transition hover:bg-brand/90" @click="modal = 'bid'">Tawar</button>
      </template>
    </div>
    <BidModal v-if="modal === 'bid'" :id="route.params.productId" :current="currentBid" @close="closeModal" @saved="load" />
    <ChangeModal v-if="modal === 'change'" :id="route.params.productId" :product="store.product" @close="closeModal" @saved="load" />
    <ChangeCoverModal v-if="modal === 'cover'" :id="route.params.productId" @close="closeModal" @saved="load" />
  </article>
</template>
