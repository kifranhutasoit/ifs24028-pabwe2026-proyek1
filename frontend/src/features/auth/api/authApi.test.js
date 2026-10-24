import { login, register, logout } from './authApi.js'

describe('authApi', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ status: 'success' }) })))
  afterEach(() => vi.unstubAllGlobals())

  it('posts login and normalises the response', async () => {
    expect(await login({ email: 'a@b.c', password: 'pw' })).toEqual({ status: 'success', success: true })
    expect(fetch.mock.calls[0][0]).toBe('/api/v1/auth/login')
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ email: 'a@b.c', password: 'pw' })
  })

  it('posts register', async () => {
    await register({ name: 'N', email: 'a@b.c', password: 'pw' })
    expect(fetch.mock.calls[0][0]).toMatch(/\/auth\/register$/)
  })

  it('posts logout with the auth helper', async () => {
    expect((await logout()).success).toBe(true)
    expect(fetch.mock.calls[0][0]).toMatch(/\/auth\/logout$/)
    expect(fetch.mock.calls[0][1].method).toBe('POST')
  })
})
