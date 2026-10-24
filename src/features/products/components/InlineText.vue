<script setup>
defineProps({ segments: { type: Array, required: true } })
</script>

<template>
  <template v-for="(s, i) in segments" :key="i">
    <strong v-if="s.bold">{{ s.text }}</strong>
    <em v-else-if="s.italic">{{ s.text }}</em>
    <template v-else>{{ s.text }}</template>
  </template>
</template>
