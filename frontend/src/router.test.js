import { createMemoryHistory } from 'vue-router'
import { createAppRouter } from './router.js'

async function go(path) {
  const router = createAppRouter(createMemoryHistory())
  await router.push(path)
  return router.currentRoute.value.fullPath
}

describe('route guard', () => {
  it('redirects guests away from protected routes', async () => {
    expect(await go('/users')).toBe('/auth/login')
  })
  it('redirects logged-in users away from auth pages', async () => {
    localStorage.setItem('accessToken', 't')
    expect(await go('/auth/login')).toBe('/')
  })
  it('allows logged-in users on protected routes and 404', async () => {
    localStorage.setItem('accessToken', 't')
    expect(await go('/profile')).toBe('/profile')
    expect(await go('/nope')).toBe('/nope')
  })
  it('allows guests on auth pages', async () => {
    expect(await go('/auth/register')).toBe('/auth/register')
  })
})
