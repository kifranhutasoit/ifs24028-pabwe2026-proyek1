<script setup>
import { reactive, ref, computed } from 'vue'
import ModalShell from './ModalShell.vue'
import MarkdownEditor from '../components/MarkdownEditor.vue'
import { useProductsStore } from '../states/productsStore.js'
import { showSuccessDialog, showErrorDialog, toApiTimestamp } from '../../../helpers/toolsHelper.js'

const emit = defineEmits(['close', 'saved'])
const store = useProductsStore()
const defaultClosedAt = () => new Date(Date.now() + 7 * 864e5 - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 16)
const form = reactive({ title: '', description: '', start_bid: '', closed_at: defaultClosedAt() })
const photo = ref(null)
const preview = computed(() => (photo.value ? URL.createObjectURL(photo.value) : ''))
const pickPhoto = (event) => { photo.value = event.target.files[0] }

async function submit() {
  const res = await store.addProduct({ ...form, start_bid: Number(form.start_bid), closed_at: toApiTimestamp(form.closed_at) })
  if (res.success) {
    let message = res.message
    if (photo.value) {
      const upload = await store.changeCover(res.data.product_id, photo.value)
      if (!upload.success) message = `${res.message}, tetapi foto gagal diunggah: ${upload.message}`
    }
    showSuccessDialog(message)
    emit('saved')
    emit('close')
  } else showErrorDialog(res.message)
}
</script>

<template>
  <ModalShell title="Jual barang" @close="emit('close')">
    <form class="space-y-3" @submit.prevent="submit">
      <label for="product-title" class="block text-sm font-semibold">Nama barang</label>
      <input id="product-title" v-model="form.title" class="w-full rounded-lg border border-stone-500 px-3 py-2" />
      <MarkdownEditor id="product-description" v-model="form.description" label="Deskripsi" />
      <label for="product-start-bid" class="block text-sm font-semibold">Harga</label>
      <input id="product-start-bid" v-model="form.start_bid" type="number" class="w-full rounded-lg border border-stone-500 px-3 py-2" />
      <label for="product-closed-at" class="block text-sm font-semibold">Dijual hingga</label>
      <input id="product-closed-at" v-model="form.closed_at" type="datetime-local" class="w-full rounded-lg border border-stone-500 px-3 py-2" />
      <label for="product-photo" class="block text-sm font-semibold">Foto barang (opsional)</label>
      <input id="product-photo" type="file" accept="image/*" aria-label="Foto barang" class="w-full rounded-lg border border-stone-500 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:font-semibold file:text-white" @change="pickPhoto" />
      <img v-if="preview" :src="preview" alt="Pratinjau foto barang" class="aspect-4/3 w-full rounded-xl object-cover" />
      <button type="submit" aria-label="Simpan barang" class="rounded-lg bg-brand px-4 py-2 font-semibold text-white">Simpan barang</button>
    </form>
  </ModalShell>
</template>
