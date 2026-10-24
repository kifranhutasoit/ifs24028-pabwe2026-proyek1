import { screen, fireEvent, waitFor } from '@testing-library/vue'
import { renderWithProviders } from '../../../test-utils.js'
import DetailPage from './DetailPage.vue'
import * as api from '../api/productApi.js'
import { useUsersStore } from '../../users/states/usersStore.js'
import { showSuccessDialog, showErrorDialog, showConfirmDialog } from '../../../helpers/toolsHelper.js'

vi.mock('../api/productApi.js')
vi.mock('../../../helpers/toolsHelper.js', async (orig) => ({
  ...(await orig()), showSuccessDialog: vi.fn(), showErrorDialog: vi.fn(), showConfirmDialog: vi.fn(),
}))

const detail = (extra = {}) => ({
  success: true,
  data: { product: { id: 7, user_id: 1, category: 'Buku', title: 'Lukisan', description: '**Cat** minyak', start_bid: 150000, closed_at: '2099-12-01 00:00:00', bids: [{ id: 1, bid: 200000, created_at: '2026-10-05T08:44:12.000000Z', user: { name: 'Budi' } }, { id: 2, bid: 100000, created_at: '2026-10-04T08:00:00.000000Z' }], author: { name: 'Sari', photo: '' }, ...extra } },
})
const click = (name) => fireEvent.click(screen.getByRole('button', { name }))
const noDialog = () => expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

async function mount({ me = 99 } = {}) {
  const utils = renderWithProviders(DetailPage, { route: '/products/7' })
  if (me) useUsersStore(utils.pinia).profile = { id: me }
  await screen.findByText('Lukisan')
  await waitFor(() => expect(api.getProduct).toHaveBeenCalledWith('7'))
  return utils
}

describe('DetailPage', () => {
  beforeEach(() => { vi.clearAllMocks(); api.getProduct.mockResolvedValue(detail()) })

  it('renders details, markdown and bids without a cover', async () => {
    await mount()
    expect(screen.getByText('Rp 200.000')).toBeInTheDocument()
    expect(screen.getByText('Cat').tagName).toBe('STRONG')
    expect(screen.getByText('Sari')).toBeInTheDocument()
    expect(screen.getByText('oleh Budi')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Rp 200.000')
    expect(screen.getByRole('button', { name: 'Tawar' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ubah barang' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hapus barang' })).not.toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Foto Lukisan' })).not.toBeInTheDocument()
  })

  it('shows only management actions to the owner', async () => {
    await mount({ me: 1 })
    for (const name of ['Ubah barang', 'Ubah foto', 'Hapus barang']) expect(screen.getByRole('button', { name })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tawar' })).not.toBeInTheDocument()
  })

  it('hides all actions until the profile is loaded', async () => {
    await mount({ me: null })
    expect(screen.queryByRole('button', { name: 'Tawar' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Hapus barang' })).not.toBeInTheDocument()
  })

  it('shows the highest bid in the bid modal', async () => {
    await mount()
    await click('Tawar')
    expect(screen.getByRole('dialog')).toHaveTextContent('Tawaran tertinggi saat ini Rp 200.000')
  })

  it('blocks a bid that is not higher than the current highest bid', async () => {
    await mount()
    await click('Tawar')
    await fireEvent.update(screen.getByLabelText('Nominal tawaran'), '100000')
    await click('Kirim tawaran')
    expect(showErrorDialog).toHaveBeenCalledWith('Tawaran harus lebih tinggi dari Rp 200.000')
    expect(api.addBid).not.toHaveBeenCalled()
  })

  it('hides bidding once the product is closed', async () => {
    api.getProduct.mockResolvedValue(detail({ closed_at: '2000-01-01 00:00:00' }))
    await mount()
    expect(screen.getByRole('status')).toHaveTextContent('Penjualan sudah ditutup')
    expect(screen.queryByRole('button', { name: 'Tawar' })).not.toBeInTheDocument()
  })

  it('lets a bidder cancel an existing bid instead of bidding again', async () => {
    api.getProduct.mockResolvedValue(detail({ my_bid: { id: 2, bid: 250000 } }))
    await mount()
    expect(screen.getByText('Rp 250.000')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tawar' })).not.toBeInTheDocument()
    showConfirmDialog.mockResolvedValueOnce(false).mockResolvedValue(true)
    api.deleteBid.mockResolvedValueOnce({ success: false, message: 'Gagal batal' }).mockResolvedValueOnce({ success: true, message: 'Dibatalkan' })
    await click('Batalkan tawaran')
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled())
    expect(api.deleteBid).not.toHaveBeenCalled()
    await click('Batalkan tawaran')
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Gagal batal'))
    await click('Batalkan tawaran')
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith('Dibatalkan'))
    expect(api.deleteBid).toHaveBeenLastCalledWith('7')
  })

  it('shows an empty state when there are no bids', async () => {
    api.getProduct.mockResolvedValue(detail({ bids: [] }))
    await mount()
    expect(screen.getByText('Belum ada tawaran')).toBeInTheDocument()
  })

  it('shows the cover when present', async () => {
    api.getProduct.mockResolvedValue(detail({ cover: 'http://x/c.png' }))
    await mount()
    expect(screen.getByRole('img', { name: 'Foto Lukisan' })).toBeInTheDocument()
  })

  it('places a bid: error keeps the modal, success closes it and reloads', async () => {
    await mount()
    const before = api.getProduct.mock.calls.length
    api.addBid.mockResolvedValueOnce({ success: false, message: 'Rendah' }).mockResolvedValueOnce({ success: true, message: 'Ok' })
    await click('Tawar')
    await fireEvent.update(screen.getByLabelText('Nominal tawaran'), '300000')
    await click('Kirim tawaran')
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Rendah'))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await click('Kirim tawaran')
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith('Ok'))
    expect(api.addBid).toHaveBeenLastCalledWith('7', { bid: 300000 })
    await waitFor(noDialog)
    expect(api.getProduct.mock.calls.length).toBeGreaterThan(before)
  })

  it('edits the product', async () => {
    await mount({ me: 1 })
    api.changeProduct.mockResolvedValueOnce({ success: false, message: 'Gagal ubah' }).mockResolvedValueOnce({ success: true, message: 'Diubah' })
    await click('Ubah barang')
    await fireEvent.update(screen.getByLabelText('Nama barang'), 'Baru')
    await fireEvent.update(screen.getByLabelText('Deskripsi'), 'Desc baru')
    await fireEvent.update(screen.getByLabelText('Harga'), '200000')
    await fireEvent.update(screen.getByLabelText('Dijual hingga'), '2027-01-01T08:00')
    await click('Simpan perubahan')
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Gagal ubah'))
    await click('Simpan perubahan')
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith('Diubah'))
    expect(api.changeProduct).toHaveBeenLastCalledWith('7', { title: 'Baru', category: 'Buku', description: 'Desc baru', start_bid: 200000, closed_at: '2027-01-01 08:00:00' })
    await waitFor(noDialog)
  })

  it('changes the cover', async () => {
    await mount({ me: 1 })
    api.changeCover.mockResolvedValueOnce({ success: false, message: 'Besar' }).mockResolvedValueOnce({ success: true, message: 'Foto' })
    const file = new File(['x'], 'c.png', { type: 'image/png' })
    await click('Ubah foto')
    await fireEvent.change(screen.getByLabelText('File foto'), { target: { files: [file] } })
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Besar'))
    await fireEvent.change(screen.getByLabelText('File foto'), { target: { files: [file] } })
    await waitFor(() => expect(showSuccessDialog).toHaveBeenCalledWith('Foto'))
    expect(api.changeCover).toHaveBeenLastCalledWith('7', file)
    await waitFor(noDialog)
  })

  it('closes the bid modal with Escape', async () => {
    await mount()
    await click('Tawar')
    await fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    noDialog()
  })

  it('closes the owner modals with Escape', async () => {
    await mount({ me: 1 })
    for (const name of ['Ubah barang', 'Ubah foto']) {
      await click(name)
      await fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
      noDialog()
    }
  })

  it('does nothing when deletion is cancelled', async () => {
    await mount({ me: 1 })
    showConfirmDialog.mockResolvedValue(false)
    await click('Hapus barang')
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled())
    expect(api.deleteProduct).not.toHaveBeenCalled()
  })

  it('deletes and goes home, or shows an error', async () => {
    const { router } = await mount({ me: 1 })
    const push = vi.spyOn(router, 'push')
    showConfirmDialog.mockResolvedValue(true)
    api.deleteProduct.mockResolvedValueOnce({ success: false, message: 'Tidak bisa' }).mockResolvedValueOnce({ success: true, message: 'Dihapus' })
    await click('Hapus barang')
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Tidak bisa'))
    await click('Hapus barang')
    await waitFor(() => expect(push).toHaveBeenCalledWith('/'))
  })
})
