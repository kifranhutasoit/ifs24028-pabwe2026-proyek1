import { screen, fireEvent, waitFor } from '@testing-library/vue'
import { renderWithProviders } from '../../../test-utils.js'
import HomePage from './HomePage.vue'
import * as api from '../api/productApi.js'
import { showSuccessDialog, showErrorDialog } from '../../../helpers/toolsHelper.js'

vi.mock('../api/productApi.js')
vi.mock('../../../helpers/toolsHelper.js', async (orig) => ({
  ...(await orig()), showSuccessDialog: vi.fn(), showErrorDialog: vi.fn(),
}))

const list = { success: true, data: { products: [{ id: 1, title: 'Lukisan', category: 'Elektronik', start_bid: 150000, closed_at: '2099-12-01 00:00:00', cover: 'http://x/c.png', author: { name: 'Sari', photo: 'http://x/p.png' } }, { id: 2, title: 'Jam', category: 'Buku', start_bid: 5000, closed_at: '2000-01-01 00:00:00', author: { name: 'Budi', photo: '' } }] } }

async function openAndFill() {
  await fireEvent.click(screen.getByRole('button', { name: 'Jual barang' }))
  await fireEvent.update(screen.getByLabelText('Nama barang'), 'Baru')
  await fireEvent.update(screen.getByLabelText('Deskripsi'), 'Desc')
  await fireEvent.update(screen.getByLabelText('Harga'), '1000')
  await fireEvent.update(screen.getByLabelText('Dijual hingga'), '2026-12-01T10:00')
  await fireEvent.click(screen.getByRole('button', { name: 'Simpan barang' }))
}

describe('HomePage', () => {
  beforeEach(() => { vi.clearAllMocks(); api.getProducts.mockResolvedValue(list) })

  it('shows cards, searches and switches tabs', async () => {
    renderWithProviders(HomePage)
    expect(await screen.findByText('Rp 150.000')).toBeInTheDocument()
    expect(screen.getByText('Budi')).toBeInTheDocument()
    expect(screen.getByText('Penjualan ditutup')).toBeInTheDocument()
    expect(screen.getByText('Masih tersedia')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Foto Lukisan' })).toBeInTheDocument()
    await fireEvent.update(screen.getByLabelText('Cari barang'), 'jam')
    expect(screen.queryByText('Lukisan')).not.toBeInTheDocument()
    await fireEvent.click(screen.getByRole('tab', { name: 'Barang saya' }))
    expect(api.getProducts).toHaveBeenLastCalledWith({ is_me: true })
    await fireEvent.click(screen.getByRole('tab', { name: 'Tersedia' }))
    expect(api.getProducts).toHaveBeenLastCalledWith({ is_closed: false })
    await fireEvent.click(screen.getByRole('tab', { name: 'Ditutup' }))
    expect(api.getProducts).toHaveBeenLastCalledWith({ is_closed: true })
  })

  it('creates an product, closes the modal and reloads', async () => {
    api.addProduct.mockResolvedValue({ success: true, message: 'Dibuat' })
    renderWithProviders(HomePage)
    await openAndFill()
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith('Dibuat'))
    expect(api.addProduct).toHaveBeenCalledWith({ title: 'Baru', category: 'Lainnya', description: 'Desc', start_bid: 1000, closed_at: '2026-12-01 10:00:00' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(api.getProducts).toHaveBeenCalledTimes(2)
  })

  it('keeps the modal open and shows an error when creation fails', async () => {
    api.addProduct.mockResolvedValue({ success: false, message: 'Gagal' })
    renderWithProviders(HomePage)
    await openAndFill()
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Gagal'))
    expect(screen.getByRole('dialog', { name: 'Jual barang' })).toBeInTheDocument()
  })

  it('closes the add modal with Escape', async () => {
    renderWithProviders(HomePage)
    await fireEvent.click(screen.getByRole('button', { name: 'Jual barang' }))
    await fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  async function fillWithPhoto() {
    URL.createObjectURL = vi.fn(() => 'blob:foto')
    await fireEvent.click(screen.getByRole('button', { name: 'Jual barang' }))
    await fireEvent.update(screen.getByLabelText('Nama barang'), 'Baru')
    await fireEvent.update(screen.getByLabelText('Deskripsi'), 'Desc')
    await fireEvent.update(screen.getByLabelText('Harga'), '1000')
    await fireEvent.update(screen.getByLabelText('Dijual hingga'), '2026-12-01T10:00')
    await fireEvent.change(screen.getByLabelText('Foto barang'), { target: { files: [new File(['x'], 'f.png', { type: 'image/png' })] } })
    expect(screen.getByRole('img', { name: 'Pratinjau foto barang' })).toHaveAttribute('src', 'blob:foto')
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan barang' }))
  }

  it('uploads the chosen photo after the product is created', async () => {
    api.addProduct.mockResolvedValue({ success: true, message: 'Dibuat', data: { product_id: 9 } })
    api.changeCover.mockResolvedValue({ success: true })
    renderWithProviders(HomePage)
    await fillWithPhoto()
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith('Dibuat'))
    expect(api.changeCover).toHaveBeenCalledWith(9, expect.any(File))
  })

  it('reports a failed photo upload while keeping the product', async () => {
    api.addProduct.mockResolvedValue({ success: true, message: 'Dibuat', data: { product_id: 9 } })
    api.changeCover.mockResolvedValue({ success: false, message: 'Terlalu besar' })
    renderWithProviders(HomePage)
    await fillWithPhoto()
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith('Dibuat, tetapi foto gagal diunggah: Terlalu besar'))
  })

  it('suggests a closing date one week ahead by default', async () => {
    renderWithProviders(HomePage)
    await fireEvent.click(screen.getByRole('button', { name: 'Jual barang' }))
    const value = screen.getByLabelText('Dijual hingga').value
    const days = (new Date(value) - Date.now()) / 864e5
    expect(days).toBeGreaterThan(6.9)
    expect(days).toBeLessThan(7.1)
  })

  it('filters by category and can pick a category when selling', async () => {
    api.addProduct.mockResolvedValue({ success: true, message: 'Dibuat' })
    renderWithProviders(HomePage)
    await screen.findByText('Rp 150.000')
    await fireEvent.click(screen.getByRole('button', { name: 'Kategori Elektronik' }))
    expect(screen.getByRole('button', { name: 'Kategori Elektronik' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Lukisan')).toBeInTheDocument()
    expect(screen.queryByText('Jam')).not.toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Kategori Semua' }))
    expect(screen.getByText('Jam')).toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: 'Jual barang' }))
    await fireEvent.update(screen.getByLabelText('Kategori', { selector: 'select' }), 'Buku')
    await fireEvent.update(screen.getByLabelText('Nama barang'), 'Novel')
    await fireEvent.update(screen.getByLabelText('Deskripsi'), 'Bagus')
    await fireEvent.update(screen.getByLabelText('Harga'), '2000')
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan barang' }))
    await waitFor(() => expect(api.addProduct).toHaveBeenCalledWith(expect.objectContaining({ title: 'Novel', category: 'Buku' })))
  })
})
