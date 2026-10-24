import { screen } from '@testing-library/vue'
import { renderWithProviders } from '../../../test-utils.js'
import NotFoundPage from './NotFoundPage.vue'

it('shows 404 and home link', () => {
  renderWithProviders(NotFoundPage)
  expect(screen.getByText('404')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Kembali ke beranda' })).toBeInTheDocument()
})
