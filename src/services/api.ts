import { getSessionId } from './session'

const EMPTY_VALUE = ''
const PATH_SEPARATOR = '/'
const TRIM_LAST_CHAR_COUNT = 1

export const API_SESSION_HEADER = 'X-Session-Id' as const

export type ApiFetchOptions = RequestInit & {
  baseUrl?: string
  includeSessionId?: boolean
  sessionId?: string
}

type SessionHeaderOptions = {
  includeSessionId?: boolean
  sessionId?: string
}

/**
 * Возвращает текущий base URL API из переменных окружения.
 * @returns Строка base URL или пустая строка для same-origin запросов.
 */
const resolveApiBaseUrl = (): string => import.meta.env.VITE_API_BASE_URL ?? EMPTY_VALUE

/**
 * Нормализует путь API, гарантируя ведущий слэш.
 * @param path Исходный путь API, который может начинаться или не начинаться со слэша.
 * @returns Нормализованный путь с ведущим слэшем.
 */
const normalizeApiPath = (path: string): string => {
  const trimmedPath = path.trim()

  if (!trimmedPath) {
    return PATH_SEPARATOR
  }

  return trimmedPath.startsWith(PATH_SEPARATOR) ? trimmedPath : `${PATH_SEPARATOR}${trimmedPath}`
}

/**
 * Собирает полный URL API на основе base URL и пути запроса.
 * @param baseUrl Базовый URL API, может быть пустым для same-origin запросов.
 * @param path Путь запроса API, допускает отсутствие ведущего слэша.
 * @returns Полный URL API с корректно нормализованным путем.
 */
export const buildApiUrl = (baseUrl: string, path: string): string => {
  const trimmedBaseUrl = baseUrl.trim()
  const normalizedPath = normalizeApiPath(path)

  if (!trimmedBaseUrl) {
    return normalizedPath
  }

  const sanitizedBaseUrl = trimmedBaseUrl.endsWith(PATH_SEPARATOR)
    ? trimmedBaseUrl.slice(0, -TRIM_LAST_CHAR_COUNT)
    : trimmedBaseUrl

  return `${sanitizedBaseUrl}${normalizedPath}`
}

/**
 * Возвращает полный URL API, используя base URL из окружения по умолчанию.
 * @param path Путь запроса API.
 * @param baseUrl Явно заданный base URL, если нужно переопределить значение окружения.
 * @returns Полный URL API для выполнения запроса.
 */
export const resolveApiUrl = (path: string, baseUrl?: string): string =>
  buildApiUrl(baseUrl ?? resolveApiBaseUrl(), path)

/**
 * Определяет, какой SID использовать для подписи запроса.
 * @param options Опции, управляющие использованием SID и его переопределением.
 * @returns Строка SID или пустая строка, если подпись не нужна.
 */
const resolveSessionId = (options?: SessionHeaderOptions): string => {
  if (options?.includeSessionId === false) {
    return EMPTY_VALUE
  }

  return options?.sessionId ?? getSessionId()
}

/**
 * Формирует заголовки запроса с учетом SID пользователя.
 * @param headers Исходные заголовки запроса.
 * @param options Опции, управляющие добавлением SID.
 * @returns Объект Headers с добавленным SID, если он доступен.
 */
const buildSessionHeaders = (
  headers: HeadersInit | undefined,
  options?: SessionHeaderOptions,
): Headers => {
  const resolvedHeaders = new Headers(headers)
  const sessionId = resolveSessionId(options)

  if (sessionId && !resolvedHeaders.has(API_SESSION_HEADER)) {
    resolvedHeaders.set(API_SESSION_HEADER, sessionId)
  }

  return resolvedHeaders
}

/**
 * Выполняет fetch-запрос к API и автоматически подписывает его SID.
 * @param path Путь API, относительно base URL.
 * @param options Параметры запроса, включая base URL и управление подписью.
 * @returns Промис с Response от fetch.
 */
export const apiFetch = (path: string, options: ApiFetchOptions = {}): Promise<Response> => {
  const { baseUrl, includeSessionId, sessionId, headers, ...requestInit } = options
  const url = resolveApiUrl(path, baseUrl)
  const signedHeaders = buildSessionHeaders(headers, { includeSessionId, sessionId })

  return fetch(url, { ...requestInit, headers: signedHeaders })
}
