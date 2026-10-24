import { render, screen, fireEvent } from '@testing-library/vue'
import { createPinia } from 'pinia'
import ChangeModal from './ChangeModal.vue'

const product = {
  title: 'Laptop',
  category: 'Elektronik',
  description: 'Bekas',
  start_bid: 1000,
  closed_at: '2026-12-31 10:00:00',
}

function setup() {
  return render(ChangeModal, {
    props: { id: '1', product },
    global: { plugins: [createPinia()] },
  })
}

describe('ChangeModal', () => {
  it('emits close when the modal close button is clicked', async () => {
    const { emitted } = setup()
    await fireEvent.click(screen.getByRole('button', { name: /tutup|batal|close/i }))
    expect(emitted()).toHaveProperty('close')
  })

  it('updates every form field', async () => {
    setup()
    await fireEvent.update(screen.getByLabelText('Nama barang'), 'Laptop baru')
    await fireEvent.update(screen.getByLabelText('Kategori'), 'Buku')
    await fireEvent.update(screen.getByLabelText('Deskripsi'), 'Deskripsi baru')
    await fireEvent.update(screen.getByLabelText('Harga'), '2000')
    await fireEvent.update(screen.getByLabelText('Dijual hingga'), '2027-01-01T10:00')
    expect(screen.getByLabelText('Nama barang').value).toBe('Laptop baru')
  })
})