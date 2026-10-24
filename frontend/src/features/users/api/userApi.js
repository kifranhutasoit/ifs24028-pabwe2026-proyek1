import { requestJson } from '../../../helpers/apiHelper.js'

export const getUsers = () => requestJson('/users')
export const getMe = () => requestJson('/users/me')
export const updateMe = (body) => requestJson('/users/me', { method: 'PUT', body: JSON.stringify(body) })
export const uploadPhoto = (file) => {
  const form = new FormData()
  form.append('photo', file)
  return requestJson('/users/me/photo', { method: 'POST', body: form })
}
export const changePassword = (body) =>
  requestJson('/users/password', { method: 'PUT', body: JSON.stringify(body) })
