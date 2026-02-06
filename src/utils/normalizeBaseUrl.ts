/**
 * Нормализует base URL, чтобы корректно формировать пути к ассетам и роутам.
 * @param baseUrl Исходный base URL. Может быть пустым, равным `/`, без ведущего слэша или без завершающего слэша.
 * @returns Нормализованный base URL с ведущим и завершающим слэшем.
 * Примеры: пустое значение или `/` -> `/`, `admin` -> `/admin/`, `/admin` -> `/admin/`.
 */
export const normalizeBaseUrl = (baseUrl: string) => {
  const trimmed = baseUrl.trim()

  if (!trimmed || trimmed === '/') {
    return '/'
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`

  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
}
