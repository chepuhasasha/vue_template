import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { useI18n } from '@/composables'
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

    expect(locale.value).toBe('ru')
    expect(t('login.title')).toBe('Вход')
  })

  it('игнорирует неподдерживаемую локаль из localStorage', () => {
    localStorage.setItem(STORED_LOCALE_KEY, 'es')

    const { locale } = useI18n()

    expect(locale.value).toBe('ru')
  })

  it('сохраняет локаль при установке', async () => {
    const { setLocale } = useI18n()

    setLocale('en')
    await nextTick()

    expect(localStorage.getItem(STORED_LOCALE_KEY)).toBe('en')
  })

  it('возвращает ключ при отсутствии перевода', () => {
    const { t } = useI18n()
    const missingKey = 'missing.key' as TranslationKey

    expect(t(missingKey)).toBe(missingKey)
  })

  it('работает без localStorage', async () => {
    vi.stubGlobal('localStorage', undefined)

    const { locale, setLocale } = useI18n()

    expect(locale.value).toBe('ru')

    setLocale('en')
    await nextTick()
  })
})
