import { getUsers, getMe, updateMe, uploadPhoto, changePassword } from './userApi.js'
import { requestJson } from '../../../helpers/apiHelper.js'

vi.mock('../../../helpers/apiHelper.js', () => ({ requestJson: vi.fn() }))

it('calls the user endpoints', () => {
  getUsers(); getMe(); updateMe({ name: 'a' }); changePassword({ password: 'x' }); uploadPhoto(new File(['x'], 'p.png'))
  expect(requestJson.mock.calls.map((c) => c[0])).toEqual(
    ['/users', '/users/me', '/users/me', '/users/password', '/users/me/photo'])
  expect(requestJson.mock.calls[2][1]).toEqual({ method: 'PUT', body: '{"name":"a"}' })
  expect(requestJson.mock.calls[4][1].body).toBeInstanceOf(FormData)
})
