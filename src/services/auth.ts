export type AuthCredentials = {
  login: string
  password: string
}

export type AuthSession = {
  sid: string
}

export const AUTH_ERROR_INVALID_CREDENTIALS = 'invalid_credentials' as const

export type AuthErrorCode = typeof AUTH_ERROR_INVALID_CREDENTIALS

/**
 * Описывает ошибку авторизации с кодом, пригодным для UI-обработки.
 */
export class AuthError extends Error {
  code: AuthErrorCode

  /**
   * Создает ошибку авторизации с указанным кодом.
   * @param code Код ошибки авторизации, используемый для пользовательских сообщений.
   */
  constructor(code: AuthErrorCode) {
    super(code)
    this.name = 'AuthError'
    this.code = code
  }
}

const SESSION_ID_STORAGE_KEY = 'session-id'
const EMPTY_VALUE = ''
const DEFAULT_LOGIN_PATH = '/auth/login'
const PATH_SEPARATOR = '/'
const TRIM_LAST_CHAR_COUNT = 1
const HTTP_STATUS_BAD_REQUEST = 400
const HTTP_STATUS_UNAUTHORIZED = 401
const HTTP_STATUS_FORBIDDEN = 403

const INVALID_STATUS_CODES = new Set([
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_UNAUTHORIZED,
  HTTP_STATUS_FORBIDDEN,
])

type AuthPayload = {
  sid?: string
  code?: string
  message?: string
}

/**
 * Проверяет, является ли ошибка авторизационной.
 * @param error Ошибка для проверки.
 * @returns true, если ошибка создана как AuthError.
 */
export const isAuthError = (error: unknown): error is AuthError => error instanceof AuthError

/**
 * Нормализует данные авторизации пользователя.
 * @param credentials Объект с полями логина и пароля.
 * @returns Объект с логином и паролем без лишних пробелов по краям.
 */
const normalizeCredentials = (credentials: AuthCredentials): AuthCredentials => ({
  login: credentials.login.trim(),
  password: credentials.password.trim(),
})

/**
 * Формирует полный URL авторизации по базовому URL API.
 * @param baseUrl Базовый URL API (может быть пустым для same-origin запросов).
 * @param loginPath Путь эндпойнта авторизации.
 * @returns Полный URL, по которому выполняется запрос авторизации.
 */
export const buildAuthLoginUrl = (baseUrl: string, loginPath = DEFAULT_LOGIN_PATH): string => {
  const trimmedBaseUrl = baseUrl.trim()
  const normalizedPath = loginPath.startsWith(PATH_SEPARATOR)
    ? loginPath
    : `${PATH_SEPARATOR}${loginPath}`

  if (!trimmedBaseUrl) {
    return normalizedPath
  }

  const sanitizedBaseUrl = trimmedBaseUrl.endsWith(PATH_SEPARATOR)
    ? trimmedBaseUrl.slice(0, -TRIM_LAST_CHAR_COUNT)
    : trimmedBaseUrl

  return `${sanitizedBaseUrl}${normalizedPath}`
}

/**
 * Возвращает URL авторизации на основе переменных окружения.
 * @returns Полный URL для запроса авторизации.
 */
const resolveAuthLoginUrl = (): string =>
  buildAuthLoginUrl(import.meta.env.VITE_API_BASE_URL ?? EMPTY_VALUE)

/**
 * Безопасно читает JSON из ответа, возвращая null при ошибке парсинга.
 * @param response Ответ fetch-запроса.
 * @returns Распарсенный JSON или null, если тело не является валидным JSON.
 */
const parseJsonSafely = async (response: Response): Promise<AuthPayload | null> => {
  try {
    return (await response.json()) as AuthPayload
  } catch {
    return null
  }
}

/**
 * Проверяет, является ли ответ авторизации ошибкой неверных учетных данных.
 * @param response Ответ fetch-запроса.
 * @param payload Тело ответа, если оно было успешно распарсено.
 * @returns true, если ошибка соответствует неверным учетным данным.
 */
const isInvalidCredentialsResponse = (response: Response, payload: AuthPayload | null): boolean => {
  if (payload?.code === AUTH_ERROR_INVALID_CREDENTIALS) {
    return true
  }

  return INVALID_STATUS_CODES.has(response.status)
}

/**
 * Выполняет авторизацию пользователя и возвращает SID.
 * @param credentials Объект с логином и паролем.
 * @returns Промис с объектом сессии, содержащим SID.
 */
export const login = async (credentials: AuthCredentials): Promise<AuthSession> => {
  const normalized = normalizeCredentials(credentials)

  if (!normalized.login || !normalized.password) {
    throw new AuthError(AUTH_ERROR_INVALID_CREDENTIALS)
  }

  const response = await fetch(resolveAuthLoginUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(normalized),
  })

  const payload = await parseJsonSafely(response)

  if (!response.ok) {
    if (isInvalidCredentialsResponse(response, payload)) {
      throw new AuthError(AUTH_ERROR_INVALID_CREDENTIALS)
    }

    throw new Error(payload?.message ?? `Auth request failed with status ${response.status}.`)
  }

  const sid = payload?.sid

  if (!sid) {
    throw new Error('Auth response is missing session id.')
  }

  return { sid }
}

/**
 * Сохраняет SID в постоянном хранилище браузера.
 * @param sid Строка идентификатора сессии.
 * @returns Ничего не возвращает.
 */
export const saveSessionId = (sid: string): void => {
  localStorage.setItem(SESSION_ID_STORAGE_KEY, sid)
}

/**
 * Читает SID из постоянного хранилища браузера.
 * @returns Строка SID или пустая строка, если значение отсутствует.
 */
export const getSessionId = (): string =>
  localStorage.getItem(SESSION_ID_STORAGE_KEY) ?? EMPTY_VALUE

/**
 * Удаляет SID из постоянного хранилища браузера.
 * @returns Ничего не возвращает.
 */
export const clearSessionId = (): void => {
  localStorage.removeItem(SESSION_ID_STORAGE_KEY)
}
