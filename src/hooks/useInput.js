import { ref } from 'vue'

export function useInput(initial = '') {
  const value = ref(initial)
  const onInput = (event) => { value.value = event.target.value }
  const reset = () => { value.value = initial }
  return { value, onInput, reset }
}
