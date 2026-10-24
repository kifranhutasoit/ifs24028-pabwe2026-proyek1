import { requestJson } from '../../../helpers/apiHelper.js'

export const getStats = () => requestJson('/admin/stats')
export const getUsers = () => requestJson('/admin/users')
export const updateUser = (id, body) => requestJson(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body) })
export const deleteUser = (id) => requestJson(`/admin/users/${id}`, { method: 'DELETE' })
