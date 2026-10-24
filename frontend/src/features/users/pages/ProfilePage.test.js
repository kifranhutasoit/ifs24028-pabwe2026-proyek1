import { screen, fireEvent, waitFor } from '@testing-library/vue'
import { renderWithProviders } from '../../../test-utils.js'
import ProfilePage from './ProfilePage.vue'
import * as api from '../api/userApi.js'
import { showSuccessDialog, showErrorDialog } from '../../../helpers/toolsHelper.js'

vi.mock('../api/userApi.js')
vi.mock('../../../helpers/toolsHelper.js', async (orig) => ({
  ...(await orig()), showSuccessDialog: vi.fn(), showErrorDialog: vi.fn(),
}))

const me = { success: true, data: { user: { name: 'Sari', email: 's@x.id' } } }

describe('ProfilePage', () => {
  beforeEach(() => { vi.clearAllMocks(); api.getMe.mockResolvedValue(me) })

  it('fills the form and saves profile', async () => {
    api.updateMe.mockResolvedValue({ success: true, message: 'Tersimpan' })
    renderWithProviders(ProfilePage)
    await waitFor(() => expect(screen.getByLabelText('Nama')).toHaveValue('Sari'))
    expect(screen.getByRole('heading', { name: 'Sari' })).toBeInTheDocument()
    await fireEvent.update(screen.getByLabelText('Nama'), 'Sari B')
    await fireEvent.update(screen.getByLabelText('Email'), 'b@x.id')
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan profil' }))
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith('Tersimpan'))
    expect(api.updateMe).toHaveBeenCalledWith({ name: 'Sari B', email: 'b@x.id' })
  })

  it('keeps empty form when profile fails to load', async () => {
    api.getMe.mockResolvedValue({ success: false })
    renderWithProviders(ProfilePage)
    await waitFor(() => expect(api.getMe).toHaveBeenCalled())
    expect(screen.getByLabelText('Nama')).toHaveValue('')
  })

  it('changes password and reports errors', async () => {
    api.changePassword.mockResolvedValue({ success: false, message: 'Salah' })
    renderWithProviders(ProfilePage)
    await fireEvent.update(screen.getByLabelText('Kata sandi saat ini'), 'old')
    await fireEvent.update(screen.getByLabelText('Kata sandi baru'), 'new')
    await fireEvent.update(screen.getByLabelText('Konfirmasi kata sandi baru'), 'new')
    await fireEvent.click(screen.getByRole('button', { name: 'Ubah kata sandi' }))
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Salah'))
    expect(api.changePassword).toHaveBeenCalledWith({ password: 'old', new_password: 'new', new_password_confirmation: 'new' })
  })

  it('uploads a photo', async () => {
    api.uploadPhoto.mockResolvedValue({ success: true, message: 'Foto' })
    renderWithProviders(ProfilePage)
    const file = new File(['x'], 'p.png', { type: 'image/png' })
    await fireEvent.change(screen.getByLabelText('Foto profil'), { target: { files: [file] } })
    await waitFor(() => expect(api.uploadPhoto).toHaveBeenCalledWith(file))
  })
})
