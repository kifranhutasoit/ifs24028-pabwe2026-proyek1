<script setup>
import { computed } from 'vue'
import InlineText from './InlineText.vue'
import { parseMarkdown } from '../../../helpers/markdownHelper.js'

const props = defineProps({ source: { type: String, default: '' } })
const blocks = computed(() => parseMarkdown(props.source))
</script>

<template>
  <div class="space-y-2">
    <template v-for="(block, i) in blocks" :key="i">
      <ul v-if="block.type === 'ul'" class="list-disc pl-5">
        <li v-for="(item, j) in block.items" :key="j"><InlineText :segments="item" /></li>
      </ul>
      <p v-else><InlineText :segments="block.items[0]" /></p>
    </template>
  </div>
</template>
