import ru from './ru.json'
import en from './en.json'

export const LOCALES = ['ru', 'en'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'ru'

export const translations = {
  ru,
  en,
} as const

export type TranslationKey = keyof typeof ru
