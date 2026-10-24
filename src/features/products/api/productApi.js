import { requestJson } from '../../../helpers/apiHelper.js'

const send = (method, body) => ({ method, body: JSON.stringify(body) })
const cover = (file) => {
  const form = new FormData()
  form.append('cover', file)
  return { method: 'POST', body: form }
}

export const getProducts = (filters = {}) => {
  const qs = new URLSearchParams(Object.entries(filters).map(([k, v]) => [k, Number(v)])).toString()
  const query = qs ? `?${qs}` : ''
  return requestJson(`/products${query}`)
}
export const getProduct = (id) => requestJson(`/products/${id}`)
export const addProduct = (body) => requestJson('/products', send('POST', body))
export const changeProduct = (id, body) => requestJson(`/products/${id}`, send('PUT', body))
export const changeCover = (id, file) => requestJson(`/products/${id}/cover`, cover(file))
export const deleteProduct = (id) => requestJson(`/products/${id}`, { method: 'DELETE' })
export const deleteProducts = () => requestJson('/products', { method: 'DELETE' })
export const addBid = (id, body) => requestJson(`/products/${id}/bids`, send('POST', body))
export const deleteBid = (id) => requestJson(`/products/${id}/bids`, { method: 'DELETE' })
