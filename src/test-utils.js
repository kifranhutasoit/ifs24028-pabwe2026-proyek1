import { render } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

const stub = { render: () => null }

export function renderWithProviders(component, { route = '/', ...options } = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/products/:productId', component: stub },
      { path: '/:pathMatch(.*)*', component: stub },
    ],
  })
  const utils = render(component, { global: { plugins: [pinia, router] }, ...options })
  router.push(route)
  return { router, pinia, ...utils }
}
