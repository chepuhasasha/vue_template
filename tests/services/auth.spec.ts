import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AUTH_ERROR_INVALID_CREDENTIALS,
  AuthError,
  buildAuthLoginUrl,
  clearSessionId,
  getSessionId,
  login,
  saveSessionId,
} from '@/services/auth'

const LOGIN_VALUE = 'demo'
const PASSWORD_VALUE = 'secret'
const SESSION_ID = 'sid-demo'
const STORED_SESSION_ID = 'sid-demo'
const INVALID_LOGIN = 'invalid'
const INVALID_PASSWORD = 'invalid'
const API_BASE_URL = 'https://api.example.com/'
const LOGIN_PATH = 'auth/login'
const EMPTY_VALUE = ''
const HTTP_STATUS_OK = 200
const HTTP_STATUS_UNAUTHORIZED = 401
const HTTP_STATUS_INTERNAL_ERROR = 500

const createResponse = (options: {
  ok: boolean
  status: number
  payload?: unknown
  json?: () => Promise<unknown>
}): Response =>
  ({
    ok: options.ok,
    status: options.status,
    json: options.json ?? vi.fn().mockResolvedValue(options.payload),
  }) as unknown as Response

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('auth service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('формирует корректный URL авторизации', () => {
    expect(buildAuthLoginUrl(EMPTY_VALUE, LOGIN_PATH)).toBe('/auth/login')
    expect(buildAuthLoginUrl(API_BASE_URL, LOGIN_PATH)).toBe('https://api.example.com/auth/login')
  })

  it('возвращает sid для валидных данных и нормализует логин', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createResponse({ ok: true, status: HTTP_STATUS_OK, payload: { sid: SESSION_ID } }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const session = await login({ login: `  ${LOGIN_VALUE}  `, password: PASSWORD_VALUE })

    expect(session.sid).toBe(SESSION_ID)

    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined
    const body = requestInit?.body ? JSON.parse(String(requestInit.body)) : {}

    expect(body).toEqual({ login: LOGIN_VALUE, password: PASSWORD_VALUE })
  })

  it('сохраняет, читает и очищает sid в хранилище', () => {
    saveSessionId(STORED_SESSION_ID)

    expect(getSessionId()).toBe(STORED_SESSION_ID)

    clearSessionId()

    expect(getSessionId()).toBe(EMPTY_VALUE)
  })

  it('отклоняет авторизацию при пустом логине', async () => {
    await expect(login({ login: '', password: PASSWORD_VALUE })).rejects.toBeInstanceOf(AuthError)
  })

  it('отклоняет авторизацию при пустом пароле', async () => {
    await expect(login({ login: LOGIN_VALUE, password: '' })).rejects.toBeInstanceOf(AuthError)
  })

  it('отклоняет авторизацию при неверном логине', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createResponse({
        ok: false,
        status: HTTP_STATUS_UNAUTHORIZED,
        payload: { code: AUTH_ERROR_INVALID_CREDENTIALS },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(login({ login: INVALID_LOGIN, password: PASSWORD_VALUE })).rejects.toBeInstanceOf(
      AuthError,
    )
  })

  it('отклоняет авторизацию при неверном пароле', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createResponse({
        ok: false,
        status: HTTP_STATUS_UNAUTHORIZED,
        payload: { message: 'Invalid credentials.' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(login({ login: LOGIN_VALUE, password: INVALID_PASSWORD })).rejects.toBeInstanceOf(
      AuthError,
    )
  })

  it('выбрасывает ошибку для непредвиденных статусов', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createResponse({
        ok: false,
        status: HTTP_STATUS_INTERNAL_ERROR,
        payload: { message: 'Server failed.' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(login({ login: LOGIN_VALUE, password: PASSWORD_VALUE })).rejects.toThrow(
      'Server failed.',
    )
  })

  it('выбрасывает ошибку, если sid отсутствует в ответе', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createResponse({
        ok: true,
        status: HTTP_STATUS_OK,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(login({ login: LOGIN_VALUE, password: PASSWORD_VALUE })).rejects.toThrow(
      'Auth response is missing session id.',
    )
  })
})
