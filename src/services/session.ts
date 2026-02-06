const SESSION_ID_STORAGE_KEY = 'session-id'
const EMPTY_VALUE = ''

/**
 * Сохраняет SID в localStorage по стабильному ключу.
 * @param sid Строка идентификатора сессии, которую нужно сохранить.
 * @returns Ничего не возвращает.
 */
export const saveSessionId = (sid: string): void => {
  localStorage.setItem(SESSION_ID_STORAGE_KEY, sid)
}

/**
 * Читает SID из localStorage и гарантирует строковый результат.
 * @returns Строка SID или пустая строка, если значение отсутствует.
 */
export const getSessionId = (): string =>
  localStorage.getItem(SESSION_ID_STORAGE_KEY) ?? EMPTY_VALUE

/**
 * Удаляет SID из localStorage, завершая сохраненную сессию.
 * @returns Ничего не возвращает.
 */
export const clearSessionId = (): void => {
  localStorage.removeItem(SESSION_ID_STORAGE_KEY)
}
