import { screen, fireEvent, waitFor } from '@testing-library/vue'
import { renderWithProviders } from '../../../test-utils.js'
import AdminUsersPage from './AdminUsersPage.vue'
import * as api from '../api/adminApi.js'
import { useUsersStore } from '../../users/states/usersStore.js'
import { showSuccessDialog, showErrorDialog, showConfirmDialog } from '../../../helpers/toolsHelper.js'

vi.mock('../api/adminApi.js')
vi.mock('../../../helpers/toolsHelper.js', async (orig) => ({
  ...(await orig()), showSuccessDialog: vi.fn(), showErrorDialog: vi.fn(), showConfirmDialog: vi.fn(),
}))

const row = (id, name, extra = {}) => ({
  id, name, email: `${name.toLowerCase()}@x.id`, photo: '', role: 'user', is_active: true,
  created_at: '2026-10-01T08:00:00.000Z', product_count: 2, bid_count: 3, ...extra,
})
const users = [row(1, 'Admin', { role: 'admin' }), row(2, 'Budi'), row(3, 'Sari', { is_active: false })]
const click = (name) => fireEvent.click(screen.getByRole('button', { name }))

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.getUsers.mockResolvedValue({ success: true, data: { users } })
  })

  it('lists users with role and status, and shows actions for everyone when the profile is unknown', async () => {
    renderWithProviders(AdminUsersPage)
    expect(await screen.findByText('budi@x.id')).toBeInTheDocument()
    expect(screen.getAllByText('Admin').length).toBeGreaterThan(0)
    expect(screen.getByText('Nonaktif')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hapus Admin' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Jadikan pengguna Admin' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Aktifkan Sari' })).toBeInTheDocument()
  })

  it('hides actions on your own row', async () => {
    const utils = renderWithProviders(AdminUsersPage)
    useUsersStore(utils.pinia).profile = { id: 1, role: 'admin' }
    await screen.findByText('budi@x.id')
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Hapus Admin' })).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Hapus Budi' })).toBeInTheDocument()
  })

  it('changes the role and reloads, or reports an error', async () => {
    renderWithProviders(AdminUsersPage)
    await screen.findByText('budi@x.id')
    api.updateUser.mockResolvedValueOnce({ success: false, message: 'Gagal ubah' }).mockResolvedValueOnce({ success: true, message: 'Diubah' })
    await click('Jadikan admin Budi')
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Gagal ubah'))
    expect(api.updateUser).toHaveBeenLastCalledWith(2, { role: 'admin' })
    await click('Jadikan pengguna Admin')
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith('Diubah'))
    expect(api.updateUser).toHaveBeenLastCalledWith(1, { role: 'user' })
    await waitFor(() => expect(api.getUsers).toHaveBeenCalledTimes(2))
  })

  it('deactivates and reactivates users', async () => {
    renderWithProviders(AdminUsersPage)
    await screen.findByText('budi@x.id')
    api.updateUser.mockResolvedValue({ success: true, message: 'Ok' })
    await click('Nonaktifkan Budi')
    await waitFor(() => expect(api.updateUser).toHaveBeenLastCalledWith(2, { is_active: false }))
    await click('Aktifkan Sari')
    await waitFor(() => expect(api.updateUser).toHaveBeenLastCalledWith(3, { is_active: true }))
  })

  it('asks for confirmation before deleting', async () => {
    renderWithProviders(AdminUsersPage)
    await screen.findByText('budi@x.id')
    showConfirmDialog.mockResolvedValueOnce(false).mockResolvedValue(true)
    api.deleteUser.mockResolvedValue({ success: true, message: 'Dihapus' })
    await click('Hapus Budi')
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalledWith('Hapus pengguna Budi beserta semua barangnya?'))
    expect(api.deleteUser).not.toHaveBeenCalled()
    await click('Hapus Budi')
    await waitFor(() => expect(api.deleteUser).toHaveBeenCalledWith(2))
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith('Dihapus'))
  })
})
