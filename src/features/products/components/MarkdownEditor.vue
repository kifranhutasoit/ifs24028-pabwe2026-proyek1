<script setup>
import MarkdownViewer from './MarkdownViewer.vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  id: { type: String, required: true },
  label: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])
const tools = [
  { key: 'bold', label: 'Tebal', snippet: '**teks tebal**' },
  { key: 'italic', label: 'Miring', snippet: '*teks miring*' },
  { key: 'list', label: 'Daftar', snippet: '\n- butir' },
]
const append = (snippet) => emit('update:modelValue', props.modelValue + snippet)
const onInput = (event) => emit('update:modelValue', event.target.value)
</script>

<template>
  <div class="space-y-2">
    <label :for="id" class="block text-sm font-semibold">{{ label }}</label>
    <fieldset class="m-0 flex min-w-0 gap-2 border-0 p-0">
      <legend class="sr-only">Format teks</legend>
      <button v-for="t in tools" :key="t.key" type="button" :aria-label="t.label"
        class="min-h-11 min-w-11 rounded border border-stone-500 px-2 py-1 text-sm" @click="append(t.snippet)">{{ t.label }}</button>
    </fieldset>
    <textarea :id="id" :value="modelValue" rows="4" class="w-full rounded-lg border border-stone-500 px-3 py-2" @input="onInput" />
    <section aria-label="Pratinjau" class="rounded-lg bg-stone-100 p-3">
      <MarkdownViewer :source="modelValue" />
    </section>
  </div>
</template>
