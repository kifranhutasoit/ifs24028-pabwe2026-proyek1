import { screen } from '@testing-library/vue'
import { renderWithProviders } from '../../../test-utils.js'
import LandingPage from './LandingPage.vue'

describe('LandingPage', () => {
  it('introduces the platform and links to sign in, register and the marketplace', () => {
    renderWithProviders(LandingPage)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Barang bekas')
    expect(screen.getByRole('link', { name: 'Masuk' })).toHaveAttribute('href', '/auth/login')
    expect(screen.getByRole('link', { name: 'Mulai jual-beli' })).toHaveAttribute('href', '/')
    for (const link of screen.getAllByRole('link', { name: /Daftar/ })) expect(link).toHaveAttribute('href', '/auth/register')
  })

  it('lists categories, steps and benefits', () => {
    renderWithProviders(LandingPage)
    const categories = screen.getByRole('region', { name: 'Kategori' })
    for (const name of ['Elektronik', 'Buku', 'Pakaian', 'Perabot', 'Alat Tulis', 'Lainnya']) expect(categories).toHaveTextContent(name)
    expect(screen.getAllByRole('listitem').length).toBe(12)
    expect(screen.getByText(/Dimoderasi admin/)).toBeInTheDocument()
  })
})
