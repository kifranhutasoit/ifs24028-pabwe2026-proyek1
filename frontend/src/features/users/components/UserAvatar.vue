<script setup>
import { computed } from 'vue'
import { photoUrl } from '../../../helpers/toolsHelper.js'

const props = defineProps({
  name: { type: String, required: true },
  photo: { type: String, default: '' },
  size: { type: String, default: 'md' },
})
const sizes = { sm: 'h-8 w-8 text-sm', md: 'h-10 w-10 text-base', lg: 'h-24 w-24 text-4xl' }
const src = computed(() => photoUrl(props.photo))
</script>

<template>
  <img v-if="src" loading="lazy" decoding="async" :src="src" alt="" :class="['shrink-0 rounded-full object-cover', sizes[size]]" />
  <span v-else aria-hidden="true" :class="['grid shrink-0 place-items-center rounded-full bg-brand font-bold text-white', sizes[size]]">{{ name.charAt(0).toUpperCase() }}</span>
</template>
