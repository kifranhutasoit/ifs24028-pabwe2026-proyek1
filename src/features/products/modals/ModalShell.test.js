import { render, screen, fireEvent } from '@testing-library/vue'
import ModalShell from './ModalShell.vue'

it('focuses the dialog on open and closes by Escape, backdrop and close button', async () => {
  const focus = vi.spyOn(HTMLElement.prototype, 'focus')
  const { emitted } = render(ModalShell, { props: { title: 'Nama barang' }, slots: { default: '<p>isi</p>' } })
  const dialog = screen.getByRole('dialog', { name: 'Nama barang' })
  expect(focus.mock.contexts).toContain(dialog)
  focus.mockRestore()
  await fireEvent.click(dialog)
  expect(emitted().close).toBeUndefined()
  await fireEvent.keyDown(dialog, { key: 'Escape' })
  await fireEvent.click(dialog.parentElement)
  await fireEvent.click(screen.getByRole('button', { name: 'Tutup' }))
  expect(emitted().close).toHaveLength(3)
})
