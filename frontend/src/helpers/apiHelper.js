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

export const SERVER_UNREACHABLE = 'Server tidak dapat dihubungi. Pastikan backend sedang berjalan.'

export async function readJson(request) {
  try {
    return normalizeResponse(await (await request).json())
  } catch {
    return normalizeResponse({ status: 'error', message: SERVER_UNREACHABLE })
  }
}

export const requestJson = (path, options) => readJson(fetchWithAuth(`${DELCOM_BASEURL}${path}`, options))
