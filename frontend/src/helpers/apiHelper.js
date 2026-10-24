const TOKEN_KEY = 'accessToken'

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY)
export const putAccessToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const removeAccessToken = () => localStorage.removeItem(TOKEN_KEY)

export function fetchWithAuth(url, options = {}) {
  const token = getAccessToken()
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }
  if (options.body instanceof FormData) delete headers['Content-Type']
  return fetch(url, { ...options, headers })
}

export const normalizeResponse = (json) => ({ ...json, success: json.status === 'success' })

export const requestJson = async (path, options) =>
  normalizeResponse(await (await fetchWithAuth(`${DELCOM_BASEURL}${path}`, options)).json())
