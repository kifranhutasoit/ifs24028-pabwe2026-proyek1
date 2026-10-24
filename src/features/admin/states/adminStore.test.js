import { setActivePinia, createPinia } from 'pinia'
import { useAdminStore } from './adminStore.js'
import * as api from '../api/adminApi.js'

vi.mock('../api/adminApi.js')

describe('adminStore', () => {
  beforeEach(() => { setActivePinia(createPinia()); vi.resetAllMocks() })

  it('loads stats and users, ignoring failures', async () => {
    const s = useAdminStore()
    api.getStats.mockResolvedValueOnce({ success: false }).mockResolvedValueOnce({ success: true, data: { stats: { users: 2 } } })
    await s.loadStats()
    expect(s.stats).toBeNull()
    await s.loadStats()
    expect(s.stats).toEqual({ users: 2 })
    api.getUsers.mockResolvedValueOnce({ success: false }).mockResolvedValueOnce({ success: true, data: { users: [1] } })
    await s.loadUsers()
    expect(s.users).toEqual([])
    await s.loadUsers()
    expect(s.users).toEqual([1])
  })

  it('passes user changes through to the api', async () => {
    const s = useAdminStore()
    api.updateUser.mockResolvedValue({ success: true })
    api.deleteUser.mockResolvedValue({ success: true })
    await s.changeUser(1, { role: 'admin' }); await s.removeUser(1)
    expect(api.updateUser).toHaveBeenCalledWith(1, { role: 'admin' })
    expect(api.deleteUser).toHaveBeenCalledWith(1)
  })
})
