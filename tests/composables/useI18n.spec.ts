import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { useI18n } from '@/composables'
import { translations } from '@/locales'
import type { TranslationKey } from '@/locales'

const STORED_LOCALE_KEY = 'locale'

describe('useI18n', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('берет локаль из localStorage', () => {
    localStorage.setItem(STORED_LOCALE_KEY, 'en')

    const { locale, t } = useI18n()

    expect(locale.value).toBe('en')
    expect(t('login.title')).toBe('Sign in')
  })

  it('возвращает базовую локаль при пустом localStorage', () => {
    const { locale, t } = useI18n()

    expect(locale.value).toBe('en')
    expect(t('login.title')).toBe('Sign in')
  })

  it('игнорирует неподдерживаемую локаль из localStorage', () => {
    localStorage.setItem(STORED_LOCALE_KEY, 'es')

    const { locale } = useI18n()

    expect(locale.value).toBe('en')
  })

  it('сохраняет локаль при установке', async () => {
    const { setLocale } = useI18n()

    setLocale('ru')
    await nextTick()

    expect(localStorage.getItem(STORED_LOCALE_KEY)).toBe('ru')
  })

  it('возвращает перевод из en, если ключ отсутствует в текущей локали', async () => {
    const { setLocale, t } = useI18n()
    const missingKey = 'login.title' as TranslationKey
    const mutableTranslations = translations as Record<string, Record<string, string | undefined>>
    const originalValue = mutableTranslations.ru[missingKey]

    delete mutableTranslations.ru[missingKey]

    try {
      setLocale('ru')
      await nextTick()

      expect(t(missingKey)).toBe('Sign in')
    } finally {
      if (typeof originalValue === 'string') {
        mutableTranslations.ru[missingKey] = originalValue
      }
    }
  })

  it('возвращает ключ при отсутствии перевода', () => {
    const { t } = useI18n()
    const missingKey = 'missing.key' as TranslationKey

    expect(t(missingKey)).toBe(missingKey)
  })

  it('работает без localStorage', async () => {
    vi.stubGlobal('localStorage', undefined)

    const { locale, setLocale } = useI18n()

    expect(locale.value).toBe('en')

    setLocale('en')
    await nextTick()
  })
})
