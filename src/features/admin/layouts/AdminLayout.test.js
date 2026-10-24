import { screen } from '@testing-library/vue'
import { renderWithProviders } from '../../../test-utils.js'
import AdminLayout from './AdminLayout.vue'
import { useUsersStore } from '../../users/states/usersStore.js'

const mountAs = (profile) => {
  const utils = renderWithProviders(AdminLayout)
  useUsersStore(utils.pinia).profile = profile
  return utils
}

describe('AdminLayout', () => {
  it('shows a checking message until the profile is loaded', () => {
    mountAs(null)
    expect(screen.getByRole('status')).toHaveTextContent('Memeriksa akses')
  })

  it('denies regular users', async () => {
    mountAs({ id: 2, role: 'user' })
    expect(await screen.findByRole('alert')).toHaveTextContent('Halaman ini hanya untuk admin')
    expect(screen.queryByRole('heading', { name: 'Panel admin' })).not.toBeInTheDocument()
  })

  it('shows the admin menu to admins', async () => {
    mountAs({ id: 1, role: 'admin' })
    expect(await screen.findByRole('heading', { name: 'Panel admin' })).toBeInTheDocument()
    for (const [name, href] of [['Ringkasan', '/admin'], ['Pengguna', '/admin/users'], ['Barang', '/admin/products']]) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
    }
  })
})
