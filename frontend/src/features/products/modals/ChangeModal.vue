<script setup>
import { reactive } from 'vue'
import ModalShell from './ModalShell.vue'
import MarkdownEditor from '../components/MarkdownEditor.vue'
import { CATEGORIES } from '../categories.js'
import { useProductsStore } from '../states/productsStore.js'
import { showSuccessDialog, showErrorDialog, toApiTimestamp, toInputTimestamp } from '../../../helpers/toolsHelper.js'

const props = defineProps({ id: { type: String, required: true }, product: { type: Object, required: true } })
const emit = defineEmits(['close', 'saved'])
const store = useProductsStore()
const form = reactive({
  title: props.product.title,
  category: props.product.category,
  description: props.product.description,
  start_bid: props.product.start_bid,
  closed_at: toInputTimestamp(props.product.closed_at),
})

async function submit() {
  const res = await store.changeProduct(props.id, {
    title: form.title,
    category: form.category,
    description: form.description,
    start_bid: Number(form.start_bid),
    closed_at: toApiTimestamp(form.closed_at),
  })
  if (res.success) {
    showSuccessDialog(res.message)
    emit('saved')
    emit('close')
  } else showErrorDialog(res.message)
}
</script>

<template>
  <ModalShell title="Ubah barang" @close="emit('close')">
    <form class="space-y-3" @submit.prevent="submit">
      <label for="change-title" class="block text-sm font-semibold">Nama barang</label>
      <input id="change-title" v-model="form.title" class="w-full rounded-lg border border-stone-500 px-3 py-2" />
      <label for="change-category" class="block text-sm font-semibold">Kategori</label>
      <select id="change-category" v-model="form.category" class="w-full rounded-lg border border-stone-500 px-3 py-2">
        <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
      </select>
      <MarkdownEditor id="change-description" v-model="form.description" label="Deskripsi" />
      <label for="change-start-bid" class="block text-sm font-semibold">Harga</label>
      <input id="change-start-bid" v-model="form.start_bid" type="number" class="w-full rounded-lg border border-stone-500 px-3 py-2" />
      <label for="change-closed-at" class="block text-sm font-semibold">Dijual hingga</label>
      <input id="change-closed-at" v-model="form.closed_at" type="datetime-local" class="w-full rounded-lg border border-stone-500 px-3 py-2" />
      <button type="submit" aria-label="Simpan perubahan" class="rounded-lg bg-brand px-4 py-2 font-semibold text-white">Simpan perubahan</button>
    </form>
  </ModalShell>
</template>
