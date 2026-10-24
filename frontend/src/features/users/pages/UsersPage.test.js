import { screen } from '@testing-library/vue'
import { renderWithProviders } from '../../../test-utils.js'
import UsersPage from './UsersPage.vue'
import * as api from '../api/userApi.js'

vi.mock('../api/userApi.js')

it('lists users', async () => {
  api.getUsers.mockResolvedValue({ success: true, data: { users: [{ id: 1, name: 'Sari', email: 's@x.id' }] } })
  renderWithProviders(UsersPage)
  expect(await screen.findByText('Sari')).toBeInTheDocument()
  expect(screen.getByText('s@x.id')).toBeInTheDocument()
})
