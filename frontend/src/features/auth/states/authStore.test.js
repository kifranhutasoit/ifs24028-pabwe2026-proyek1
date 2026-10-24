import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from './authStore.js'
import * as api from '../api/authApi.js'

vi.mock('../api/authApi.js')

describe('authStore', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('logs in and stores token', async () => {
    api.login.mockResolvedValue({ success: true, data: { token: 't1' } })
    const s = useAuthStore()
    await s.loginUser({})
    expect(s.token).toBe('t1')
    expect(s.isAuthLogin).toBe(true)
    expect(localStorage.getItem('accessToken')).toBe('t1')
  })

  it('keeps state on failed login', async () => {
    api.login.mockResolvedValue({ success: false })
    const s = useAuthStore()
    await s.loginUser({})
    expect(s.isAuthLogin).toBe(false)
    expect(s.token).toBeNull()
  })

  it('registers', async () => {
    api.register.mockResolvedValue({ success: true })
    const s = useAuthStore()
    await s.registerUser({})
    expect(s.isAuthRegister).toBe(true)
  })

  it('clears local state even when the logout request fails', async () => {
    localStorage.setItem('accessToken', 'x')
    api.logout.mockRejectedValue(new Error('offline'))
    const s = useAuthStore()
    await expect(s.logoutUser()).rejects.toThrow('offline')
    expect(s.token).toBeNull()
    expect(localStorage.getItem('accessToken')).toBeNull()
  })

  it('logs out', async () => {
    localStorage.setItem('accessToken', 'x')
    api.logout.mockResolvedValue({ success: true })
    const s = useAuthStore()
    await s.logoutUser()
    expect(s.token).toBeNull()
    expect(s.isAuthLogout).toBe(true)
    expect(localStorage.getItem('accessToken')).toBeNull()
  })
})
