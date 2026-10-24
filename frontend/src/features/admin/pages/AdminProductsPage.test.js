import { screen, fireEvent, waitFor } from '@testing-library/vue'
import { renderWithProviders } from '../../../test-utils.js'
import AdminProductsPage from './AdminProductsPage.vue'
import * as api from '../../products/api/productApi.js'
import { showSuccessDialog, showErrorDialog, showConfirmDialog } from '../../../helpers/toolsHelper.js'

vi.mock('../../products/api/productApi.js')
vi.mock('../../../helpers/toolsHelper.js', async (orig) => ({
  ...(await orig()), showSuccessDialog: vi.fn(), showErrorDialog: vi.fn(), showConfirmDialog: vi.fn(),
}))

const list = { success: true, data: { products: [{ id: 5, title: 'Jaket', category: 'Pakaian', start_bid: 75000, author: { name: 'Sari' } }] } }

describe('AdminProductsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); api.getProducts.mockResolvedValue(list) })

  it('shows an empty state', async () => {
    api.getProducts.mockResolvedValue({ success: true, data: { products: [] } })
    renderWithProviders(AdminProductsPage)
    expect(await screen.findByText('Belum ada barang.')).toBeInTheDocument()
  })

  it('lists every product with a link to its page', async () => {
    renderWithProviders(AdminProductsPage)
    expect(await screen.findByRole('link', { name: 'Jaket' })).toHaveAttribute('href', '/products/5')
    expect(screen.getByText(/Pakaian · Rp 75\.000 · oleh Sari/)).toBeInTheDocument()
  })

  it('deletes after confirmation, reports errors, and does nothing when cancelled', async () => {
    renderWithProviders(AdminProductsPage)
    await screen.findByText('Jaket')
    showConfirmDialog.mockResolvedValueOnce(false).mockResolvedValue(true)
    api.deleteProduct.mockResolvedValueOnce({ success: false, message: 'Gagal' }).mockResolvedValueOnce({ success: true, message: 'Terhapus' })
    const del = () => fireEvent.click(screen.getByRole('button', { name: 'Hapus barang Jaket' }))
    await del()
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalledWith('Hapus barang "Jaket"?'))
    expect(api.deleteProduct).not.toHaveBeenCalled()
    await del()
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Gagal'))
    await del()
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith('Terhapus'))
    expect(api.deleteProduct).toHaveBeenLastCalledWith(5)
    await waitFor(() => expect(api.getProducts).toHaveBeenCalledTimes(2))
  })
})
