import { screen } from '@testing-library/vue'
import { renderWithProviders } from '../../../test-utils.js'
import AuthLayout from './AuthLayout.vue'

it('renders brand heading', () => {
  renderWithProviders(AuthLayout)
  expect(screen.getByRole('heading', { name: 'Oper.in' })).toBeInTheDocument()
})
