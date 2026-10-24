import * as api from './adminApi.js'
import { requestJson } from '../../../helpers/apiHelper.js'

vi.mock('../../../helpers/apiHelper.js', () => ({ requestJson: vi.fn() }))

describe('adminApi', () => {
  beforeEach(() => requestJson.mockClear())

  it('calls every admin endpoint', () => {
    api.getStats(); api.getUsers(); api.updateUser(3, { role: 'admin' }); api.deleteUser(3)
    expect(requestJson.mock.calls.map((c) => [c[0], c[1]?.method])).toEqual([
      ['/admin/stats', undefined], ['/admin/users', undefined], ['/admin/users/3', 'PUT'], ['/admin/users/3', 'DELETE'],
    ])
    expect(JSON.parse(requestJson.mock.calls[2][1].body)).toEqual({ role: 'admin' })
  })
})
