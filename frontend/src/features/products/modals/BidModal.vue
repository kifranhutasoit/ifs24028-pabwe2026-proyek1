<script setup>
import { ref } from 'vue'
import ModalShell from './ModalShell.vue'
import { useProductsStore } from '../states/productsStore.js'
import { formatRupiah, showSuccessDialog, showErrorDialog } from '../../../helpers/toolsHelper.js'

const props = defineProps({ id: { type: String, required: true }, current: { type: Number, required: true } })
const emit = defineEmits(['close', 'saved'])
const store = useProductsStore()
const bid = ref('')

async function submit() {
  if (Number(bid.value) <= props.current) {
    showErrorDialog(`Tawaran harus lebih tinggi dari ${formatRupiah(props.current)}`)
    return
  }
  const res = await store.placeBid(props.id, { bid: Number(bid.value) })
  if (res.success) {
    showSuccessDialog(res.message)
    emit('saved')
    emit('close')
  } else showErrorDialog(res.message)
}
</script>

<template>
  <ModalShell title="Tawar barang" @close="emit('close')">
    <form class="space-y-3" @submit.prevent="submit">
      <p class="text-sm text-stone-700">Tawaran tertinggi saat ini <strong>{{ formatRupiah(current) }}</strong>. Tawarlah lebih tinggi dari itu.</p>
      <label for="bid-input" class="block text-sm font-semibold">Nominal tawaran</label>
      <input id="bid-input" v-model="bid" type="number" class="w-full rounded-lg border border-stone-500 px-3 py-2" />
      <button type="submit" aria-label="Kirim tawaran" class="rounded-lg bg-brand px-4 py-2 font-semibold text-white">Kirim tawaran</button>
    </form>
  </ModalShell>
</template>
