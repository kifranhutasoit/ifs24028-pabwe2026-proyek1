import { screen } from '@testing-library/vue'
import { renderWithProviders } from '../../../test-utils.js'
import AdminDashboardPage from './AdminDashboardPage.vue'
import * as api from '../api/adminApi.js'

vi.mock('../api/adminApi.js')

const stats = {
  users: 12, admins: 2, banned: 1, products: 30, products_open: 20, products_closed: 10, bids: 45,
  by_category: [{ name: 'Elektronik', total: 10 }, { name: 'Buku', total: 5 }, { name: 'Lainnya', total: 0 }],
}

describe('AdminDashboardPage', () => {
  it('renders nothing until stats arrive, then shows the numbers', async () => {
    api.getStats.mockResolvedValue({ success: true, data: { stats } })
    renderWithProviders(AdminDashboardPage)
    expect(screen.queryByRole('list', { name: 'Statistik' })).not.toBeInTheDocument()
    const list = await screen.findByRole('list', { name: 'Statistik' })
    expect(list).toHaveTextContent('12')
    expect(list).toHaveTextContent('Pengguna')
    expect(list).toHaveTextContent('Total tawaran')
    expect(screen.getByRole('region', { name: 'Barang per kategori' })).toHaveTextContent('Elektronik')
  })

  it('copes with every category being empty', async () => {
    api.getStats.mockResolvedValue({ success: true, data: { stats: { ...stats, by_category: [{ name: 'Buku', total: 0 }] } } })
    renderWithProviders(AdminDashboardPage)
    expect(await screen.findByText('Buku')).toBeInTheDocument()
  })
})
