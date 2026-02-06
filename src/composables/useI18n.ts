import { ref, watch } from 'vue'
import { DEFAULT_LOCALE, LOCALES, translations, type Locale, type TranslationKey } from '@/locales'

const LOCALE_STORAGE_KEY = 'locale'

const locale = ref<Locale>(DEFAULT_LOCALE)

/**
 * Проверяет, является ли значение поддерживаемой локалью.
 * @param value Значение для проверки.
 * @returns true, если значение совпадает с поддерживаемой локалью.
 */
const isLocale = (value?: string | null): value is Locale =>
  typeof value === 'string' && LOCALES.includes(value as Locale)

/**
 * Читает локаль из localStorage.
 * @returns Локаль из хранилища или null, если значение отсутствует или некорректно.
 */
const getStoredLocale = (): Locale | null => {
  if (typeof localStorage === 'undefined') {
    return null
  }

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)

  return isLocale(stored) ? stored : null
}

/**
 * Определяет локаль приложения с учетом сохраненного значения.
 * @returns Локаль для использования в приложении.
 */
const resolveLocale = (): Locale => getStoredLocale() ?? DEFAULT_LOCALE

/**
 * Сохраняет локаль в localStorage.
 * @param value Локаль для сохранения.
 * @returns Ничего не возвращает.
 */
const saveLocale = (value: Locale): void => {
  if (typeof localStorage === 'undefined') {
    return
  }

  localStorage.setItem(LOCALE_STORAGE_KEY, value)
}

watch(locale, (value) => {
  saveLocale(value)
})

/**
 * Возвращает перевод по ключу для текущей локали.
 * @param key Ключ перевода.
 * @returns Локализованная строка.
 */
const getTranslation = (key: TranslationKey): string => {
  const message = translations[locale.value][key]

  if (typeof message === 'string') {
    return message
  }

  const fallbackMessage = translations[DEFAULT_LOCALE][key]

  return typeof fallbackMessage === 'string' ? fallbackMessage : key
}

/**
 * Переключает локаль на указанную.
 * @param value Локаль для установки.
 * @returns Ничего не возвращает.
 */
const setLocale = (value: Locale): void => {
  locale.value = value
}

/**
 * Возвращает API для работы с локализацией.
 * @returns Объект с текущей локалью, переводчиком, списком локалей и сеттером.
 */
export const useI18n = () => {
  const resolvedLocale = resolveLocale()

  if (resolvedLocale !== locale.value) {
    locale.value = resolvedLocale
  }

  return {
    locale,
    t: getTranslation,
    setLocale,
    availableLocales: LOCALES,
  }
}
