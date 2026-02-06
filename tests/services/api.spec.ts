import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { API_SESSION_HEADER, apiFetch, buildApiUrl, resolveApiUrl } from '@/services/api'

const API_BASE_URL = 'https://api.example.com/'
const API_PATH = 'profile'
const SESSION_ID = 'sid-demo'
const CUSTOM_SESSION_ID = 'sid-custom'
const HEADER_SESSION_ID = 'sid-header'
const EMPTY_VALUE = ''
const HTTP_STATUS_OK = 200

const createResponse = (options: { ok: boolean; status: number }): Response =>
  ({
    ok: options.ok,
    status: options.status,
    json: vi.fn().mockResolvedValue({}),
  }) as unknown as Response

const mockFetch = () => {
  const fetchMock = vi.fn().mockResolvedValue(createResponse({ ok: true, status: HTTP_STATUS_OK }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('формирует корректный URL API', () => {
    expect(buildApiUrl(EMPTY_VALUE, 'auth/login')).toBe('/auth/login')
    expect(buildApiUrl(API_BASE_URL, 'auth/login')).toBe('https://api.example.com/auth/login')
    expect(buildApiUrl('https://api.example.com', '/auth/login')).toBe(
      'https://api.example.com/auth/login',
    )
    expect(buildApiUrl(API_BASE_URL, '')).toBe('https://api.example.com/')
  })

  it('разрешает использовать base URL из окружения', () => {
    const expectedBaseUrl = import.meta.env.VITE_API_BASE_URL ?? EMPTY_VALUE

    expect(resolveApiUrl(API_PATH)).toBe(buildApiUrl(expectedBaseUrl, API_PATH))
  })

  it('добавляет SID в заголовок запроса', async () => {
    localStorage.setItem('session-id', SESSION_ID)
    const fetchMock = mockFetch()

    await apiFetch(`/${API_PATH}`, { baseUrl: API_BASE_URL, method: 'GET' })

    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined
    const headers = new Headers(requestInit?.headers)

    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://api.example.com/profile')
    expect(headers.get(API_SESSION_HEADER)).toBe(SESSION_ID)
  })

  it('не добавляет SID при отключенной подписи', async () => {
    localStorage.setItem('session-id', SESSION_ID)
    const fetchMock = mockFetch()

    await apiFetch(API_PATH, { baseUrl: API_BASE_URL, includeSessionId: false })

    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined
    const headers = new Headers(requestInit?.headers)

    expect(headers.has(API_SESSION_HEADER)).toBe(false)
  })

  it('сохраняет явный заголовок с SID', async () => {
    localStorage.setItem('session-id', SESSION_ID)
    const fetchMock = mockFetch()

    await apiFetch(API_PATH, {
      baseUrl: API_BASE_URL,
      headers: {
        [API_SESSION_HEADER]: HEADER_SESSION_ID,
      },
      sessionId: CUSTOM_SESSION_ID,
    })

    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined
    const headers = new Headers(requestInit?.headers)

    expect(headers.get(API_SESSION_HEADER)).toBe(HEADER_SESSION_ID)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
