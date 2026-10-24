import { render, screen, waitFor } from '@testing-library/vue'
import { createPinia } from 'pinia'
import { createMemoryHistory } from 'vue-router'
import App from './App.vue'
import { createAppRouter } from './router.js'

async function renderAt(path) {
  const router = createAppRouter(createMemoryHistory())
  router.push(path)
  await router.isReady()
  render(App, { global: { plugins: [createPinia(), router] } })
}

describe('App routing', () => {
  it('renders login page', async () => {
    await renderAt('/auth/login')
    await waitFor(() => expect(document.querySelector('#login-submit-button')).toBeInTheDocument())
  })

  it('renders register page', async () => {
    await renderAt('/auth/register')
    expect(await screen.findByText('Buat akun baru')).toBeInTheDocument()
  })

  it('renders 404 for unknown path', async () => {
    await renderAt('/nope')
    expect(await screen.findByText('404')).toBeInTheDocument()
  })

  it('redirects / to login', async () => {
    await renderAt('/')
    expect(await screen.findByText('Masuk ke akun Anda')).toBeInTheDocument()
  })
})
