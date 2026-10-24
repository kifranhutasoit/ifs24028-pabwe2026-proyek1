<script setup>
import ModalShell from './ModalShell.vue'
import { useProductsStore } from '../states/productsStore.js'
import { showSuccessDialog, showErrorDialog } from '../../../helpers/toolsHelper.js'

const props = defineProps({ id: { type: String, required: true } })
const emit = defineEmits(['close', 'saved'])
const store = useProductsStore()

async function submit(event) {
  const res = await store.changeCover(props.id, event.target.files[0])
  if (res.success) {
    showSuccessDialog(res.message)
    emit('saved')
    emit('close')
  } else showErrorDialog(res.message)
}
</script>

<template>
  <ModalShell title="Ubah foto" @close="emit('close')">
    <label class="flex flex-col items-center gap-1 rounded-xl border-2 border-dashed border-brand/50 p-8 text-center transition hover:bg-brand/5 focus-within:ring-2 focus-within:ring-brand">
      <input type="file" accept="image/*" aria-label="File foto" class="sr-only" @change="submit" />
      <span class="font-semibold text-brand">Klik untuk memilih foto barang</span>
      <span class="text-sm text-stone-700">Format JPG atau PNG. Gambar langsung diunggah setelah dipilih.</span>
    </label>
  </ModalShell>
</template>
