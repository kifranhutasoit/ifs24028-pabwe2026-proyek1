import Swal from 'sweetalert2'
import { showSuccessDialog, showErrorDialog, showConfirmDialog, formatRupiah, formatDate, toApiTimestamp, toInputTimestamp, photoUrl, isClosedAt } from './toolsHelper.js'

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))

describe('toolsHelper', () => {
  it('shows success and error dialogs', () => {
    showSuccessDialog('ok')
    showErrorDialog('bad')
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success', text: 'ok' }))
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'bad' }))
  })

  it('returns confirm result', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true })
    expect(await showConfirmDialog('sure?')).toBe(true)
  })

  it('formats rupiah and date', () => {
    expect(formatRupiah(150000)).toBe('Rp 150.000')
    expect(formatDate('2026-01-05T00:00:00Z')).toContain('2026')
  })

  it('converts timestamps between the input and API formats', () => {
    expect(toApiTimestamp('2026-12-01T10:00')).toBe('2026-12-01 10:00:00')
    expect(toInputTimestamp('2024-10-05 22:00:00')).toBe('2024-10-05T22:00')
    expect(formatDate('2024-10-05 22:00:00')).toContain('2024')
  })

  it('resolves photo urls', () => {
    expect(photoUrl('')).toBe('')
    expect(photoUrl('https://x.id/a.png')).toBe('https://x.id/a.png')
    expect(photoUrl('img/profile/1.png')).toBe('https://open-api.delcom.org/img/profile/1.png')
  })

  it('tells whether a closing time has passed', () => {
    expect(isClosedAt('2000-01-01 00:00:00')).toBe(true)
    expect(isClosedAt('2099-01-01 00:00:00')).toBe(false)
  })
})
