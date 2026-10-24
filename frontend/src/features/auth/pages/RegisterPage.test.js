import { fireEvent, waitFor } from '@testing-library/vue'
import { renderWithProviders } from '../../../test-utils.js'
import RegisterPage from './RegisterPage.vue'
import * as api from '../api/authApi.js'
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper.js'

vi.mock('../api/authApi.js')
vi.mock('../../../helpers/toolsHelper.js', () => ({
  showErrorDialog: vi.fn(), showSuccessDialog: vi.fn().mockResolvedValue(),
}))

async function fillAndSubmit() {
  await fireEvent.update(document.querySelector('#register-name-input'), 'Nama')
  await fireEvent.update(document.querySelector('#register-email-input'), 'a@b.c')
  await fireEvent.update(document.querySelector('#register-password-input'), 'secret')
  await fireEvent.click(document.querySelector('#register-submit-button'))
}

describe('RegisterPage', () => {
  it('goes to login after success', async () => {
    api.register.mockResolvedValue({ success: true, message: 'Dibuat' })
    const { router } = renderWithProviders(RegisterPage)
    const push = vi.spyOn(router, 'push')
    await fillAndSubmit()
    await waitFor(() => expect(push).toHaveBeenCalledWith('/auth/login'))
    expect(showSuccessDialog).toHaveBeenCalledWith('Dibuat')
  })

  it('shows error on failure', async () => {
    api.register.mockResolvedValue({ success: false, message: 'Gagal' })
    renderWithProviders(RegisterPage)
    await fillAndSubmit()
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Gagal'))
  })
})
