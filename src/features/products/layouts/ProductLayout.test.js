import { screen, fireEvent, waitFor } from '@testing-library/vue'
import { renderWithProviders } from '../../../test-utils.js'
import ProductLayout from './ProductLayout.vue'
import * as authApi from '../../auth/api/authApi.js'
import * as userApi from '../../users/api/userApi.js'

vi.mock('../../auth/api/authApi.js')
vi.mock('../../users/api/userApi.js')

it('shows the profile in the navbar and logs out', async () => {
  localStorage.setItem('accessToken', 't')
  authApi.logout.mockResolvedValue({ success: true })
  userApi.getMe.mockResolvedValue({ success: true, data: { user: { name: 'Sari', email: 's@x.id', photo: '' } } })
  const { router } = renderWithProviders(ProductLayout)
  const push = vi.spyOn(router, 'push')
  expect(await screen.findByRole('link', { name: 'Sari' })).toHaveAttribute('href', '/profile')
  await fireEvent.click(screen.getByRole('button', { name: 'Keluar' }))
  await waitFor(() => expect(push).toHaveBeenCalledWith('/auth/login'))
  expect(localStorage.getItem('accessToken')).toBeNull()
  expect(screen.getByRole('link', { name: 'Profil' })).toBeInTheDocument()
})

it('shows the admin link only to admins', async () => {
  localStorage.setItem('accessToken', 't')
  userApi.getMe.mockResolvedValue({ success: true, data: { user: { id: 1, name: 'Ani', email: 'a@x.id', photo: '', role: 'admin' } } })
  renderWithProviders(ProductLayout)
  expect(await screen.findByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin')
})
