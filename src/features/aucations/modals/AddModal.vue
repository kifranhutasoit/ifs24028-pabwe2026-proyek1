<script setup>
import { onBeforeUnmount, ref } from "vue";
import ModalShell from "./ModalShell.vue";
import MarkdownEditor from "../components/MarkdownEditor.vue";
import { useAucationsStore } from "../states/aucationsStore.js";
import { useInput } from "../../../hooks/useInput.js";
import { showWarningDialog, toApiDate } from "../../../helpers/toolsHelper.js";

const emit = defineEmits(["close", "done"]);
const store = useAucationsStore();
const [title, onTitle] = useInput("");
const [startBid, onStartBid] = useInput("");
const [closedAt, onClosedAt] = useInput("");
const description = ref("");

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB, sama dengan batas server
const file = ref(null);
const preview = ref("");
const fileInput = ref(null);
let objectUrl = null;

function clearPhoto() {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = null;
  file.value = null;
  preview.value = "";
  if (fileInput.value) fileInput.value.value = "";
}

async function onFile(e) {
  const picked = e.target.files[0];
  if (!picked) return clearPhoto();
  if (!picked.type.startsWith("image/")) {
    clearPhoto();
    return showWarningDialog("File harus berupa gambar");
  }
  if (picked.size > MAX_SIZE) {
    clearPhoto();
    return showWarningDialog("Ukuran foto maksimal 5 MB");
  }
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(picked);
  file.value = picked;
  preview.value = objectUrl;
}

onBeforeUnmount(() => objectUrl && URL.revokeObjectURL(objectUrl));

async function submit() {
  if (!title.value || !startBid.value || !closedAt.value) {
    await showWarningDialog("Nama barang, harga jual, dan batas waktu wajib diisi");
    return;
  }
  const ok = await store.addAucation(
    {
      title: title.value,
      description: description.value,
      start_bid: Number(startBid.value),
      closed_at: toApiDate(closedAt.value),
    },
    file.value,
  );
  if (ok) emit("done");
}
const input = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-500";
</script>

<template>
  <ModalShell title="Jual Barang" @close="emit('close')">
    <form class="space-y-3" @submit.prevent="submit">
      <input :value="title" :class="input" placeholder="Nama barang" data-testid="add-title" @input="onTitle" />
      <MarkdownEditor v-model="description" />

      <div class="space-y-2">
        <label class="block text-xs font-semibold text-slate-700">Foto barang (opsional)</label>
        <img
          v-if="preview"
          :src="preview"
          alt="Pratinjau foto"
          class="h-48 w-full rounded-xl object-cover"
          data-testid="add-photo-preview"
        />
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:font-semibold file:text-teal-700"
          data-testid="add-photo"
          @change="onFile"
        />
        <button
          v-if="preview"
          type="button"
          class="text-xs font-semibold text-red-700 hover:underline"
          data-testid="add-photo-remove"
          @click="clearPhoto"
        >
          Hapus foto
        </button>
      </div>

      <input :value="startBid" type="number" min="0" :class="input" placeholder="Harga jual (Rp)" data-testid="add-start-bid" @input="onStartBid" />
      <label class="block text-xs font-semibold text-slate-700">Tersedia sampai</label>
      <input :value="closedAt" type="datetime-local" :class="input" data-testid="add-closed-at" @input="onClosedAt" />
      <button type="submit" :disabled="store.isAucationAdd" class="w-full rounded-xl bg-teal-700 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
        {{ store.isAucationAdd ? "Menyimpan..." : "Simpan Barang" }}
      </button>
    </form>
  </ModalShell>
</template>
