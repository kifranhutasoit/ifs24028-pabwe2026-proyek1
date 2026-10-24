import { getAccessToken, putAccessToken, removeAccessToken, fetchWithAuth, requestJson, normalizeResponse, SERVER_UNREACHABLE } from './apiHelper.js'

describe('apiHelper', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ status: 'success' }) })))
  afterEach(() => vi.unstubAllGlobals())

  it('stores, reads and removes token', () => {
    putAccessToken('abc')
    expect(getAccessToken()).toBe('abc')
    removeAccessToken()
    expect(getAccessToken()).toBeNull()
  })

  it('sends no Authorization header without token', async () => {
    await fetchWithAuth('/x')
    expect(fetch.mock.calls[0][1].headers).toEqual({ Accept: 'application/json', 'Content-Type': 'application/json' })
  })

  it('adds bearer token and merges custom headers', async () => {
    putAccessToken('abc')
    await fetchWithAuth('/x', { method: 'POST', headers: { 'X-A': '1' } })
    expect(fetch.mock.calls[0][1].headers).toEqual({
      Accept: 'application/json', 'Content-Type': 'application/json', Authorization: 'Bearer abc', 'X-A': '1',
    })
  })

  it('drops content type for FormData', async () => {
    await fetchWithAuth('/x', { body: new FormData() })
    expect(fetch.mock.calls[0][1].headers).toEqual({ Accept: 'application/json' })
  })

  it('requestJson prefixes base url and parses json', async () => {
    expect(await requestJson('/users')).toEqual({ status: 'success', success: true })
    expect(fetch.mock.calls[0][0]).toBe('/api/v1/users')
  })

  it('marks only status "success" as success', () => {
    expect(normalizeResponse({ status: 'fail' }).success).toBe(false)
    expect(normalizeResponse({ status: 'success' }).success).toBe(true)
  })

  it('returns a friendly failure when the server cannot be reached', async () => {
    fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    expect(await requestJson('/users')).toEqual({ status: 'error', message: SERVER_UNREACHABLE, success: false })
  })

  it('returns a friendly failure when the response is not json', async () => {
    fetch.mockResolvedValueOnce({ json: async () => { throw new SyntaxError('Unexpected end of JSON input') } })
    expect((await requestJson('/users')).message).toBe(SERVER_UNREACHABLE)
  })
})
