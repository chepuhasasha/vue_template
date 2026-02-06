import en from './en.json'
import ru from './ru.json'

export const LOCALES = ['en', 'ru'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

type DefaultTranslations = typeof en

export const translations: Record<Locale, Partial<DefaultTranslations>> = {
  en,
  ru,
}

export type TranslationKey = keyof DefaultTranslations
