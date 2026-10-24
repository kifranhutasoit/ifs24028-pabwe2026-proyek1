import { screen, fireEvent, waitFor } from '@testing-library/vue'
import { renderWithProviders } from '../../../test-utils.js'
import LoginPage from './LoginPage.vue'
import * as api from '../api/authApi.js'
import { showErrorDialog } from '../../../helpers/toolsHelper.js'

vi.mock('../api/authApi.js')
vi.mock('../../../helpers/toolsHelper.js', () => ({ showErrorDialog: vi.fn() }))

async function fillAndSubmit() {
  await fireEvent.update(document.querySelector('#login-email-input'), 'a@b.c')
  await fireEvent.update(document.querySelector('#login-password-input'), 'secret')
  await fireEvent.click(document.querySelector('#login-submit-button'))
}

describe('LoginPage', () => {
  it('redirects home on success', async () => {
    api.login.mockResolvedValue({ success: true, data: { token: 't' } })
    const { router } = renderWithProviders(LoginPage)
    const push = vi.spyOn(router, 'push')
    await fillAndSubmit()
    await waitFor(() => expect(push).toHaveBeenCalledWith('/'))
    expect(api.login).toHaveBeenCalledWith({ email: 'a@b.c', password: 'secret' })
  })

  it('shows error dialog on failure', async () => {
    api.login.mockResolvedValue({ success: false, message: 'Salah' })
    renderWithProviders(LoginPage)
    await fillAndSubmit()
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith('Salah'))
    expect(screen.getByRole('link', { name: 'Daftar' })).toBeInTheDocument()
  })
})
