import { setActivePinia, createPinia } from 'pinia'
import { useUsersStore } from './usersStore.js'
import * as api from '../api/userApi.js'

vi.mock('../api/userApi.js')
const ok = (data) => ({ success: true, data })
const fail = { success: false }

describe('usersStore', () => {
  beforeEach(() => { setActivePinia(createPinia()); vi.resetAllMocks() })

  it('loads users on success and ignores failure', async () => {
    const s = useUsersStore()
    api.getUsers.mockResolvedValueOnce(ok({ users: [{ id: 1 }] }))
    await s.loadUsers()
    expect(s.users).toEqual([{ id: 1 }])
    api.getUsers.mockResolvedValueOnce(fail)
    await s.loadUsers()
    expect(s.users).toEqual([{ id: 1 }])
  })

  it('loads profile on success and ignores failure', async () => {
    const s = useUsersStore()
    api.getMe.mockResolvedValueOnce(fail)
    await s.loadProfile()
    expect(s.profile).toBeNull()
    api.getMe.mockResolvedValueOnce(ok({ user: { name: 'A' } }))
    await s.loadProfile()
    expect(s.profile).toEqual({ name: 'A' })
  })

  it('reloads profile after successful save and photo upload only', async () => {
    const s = useUsersStore()
    api.getMe.mockResolvedValue(ok({ user: { name: 'B' } }))
    api.updateMe.mockResolvedValueOnce(ok({})).mockResolvedValueOnce(fail)
    api.uploadPhoto.mockResolvedValueOnce(ok({})).mockResolvedValueOnce(fail)
    await s.saveProfile({}); await s.saveProfile({})
    await s.savePhoto({}); await s.savePhoto({})
    expect(api.getMe).toHaveBeenCalledTimes(2)
  })

  it('changes password', async () => {
    api.changePassword.mockResolvedValue(ok({}))
    expect((await useUsersStore().savePassword({})).success).toBe(true)
  })
})
