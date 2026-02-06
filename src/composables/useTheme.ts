import { onMounted, ref, watch } from 'vue'

type Theme = 'light' | 'dark'

/**
 * Управляет темной темой и синхронизирует ее с localStorage.
 * @param className CSS-класс темы. Рекомендуемый формат `block--modifier`; если указан модификатор, базовый `block` будет добавлен автоматически.
 * @param storageKey Ключ localStorage для хранения значения темы.
 * @returns Объект с состоянием темы и методами управления.
 */
export function useTheme(className = 'theme--dark', storageKey = 'theme') {
  const isDark = ref(false)

  /**
   * Применяет CSS-класс темы к document.body.
   * @param v Флаг темной темы.
   */
  const apply = (v: boolean) => {
    if (className.includes('--')) {
      const baseClass = className.split('--')[0]
      document.body.classList.add(baseClass)
    }
    document.body.classList.toggle(className, v)
  }

  /**
   * Определяет тему браузера через prefers-color-scheme.
   * @returns Текущая тема браузера.
   */
  const getBrowserTheme = (): Theme => {
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)')
    return mql?.matches ? 'dark' : 'light'
  }

  onMounted(() => {
    const saved = localStorage.getItem(storageKey) as Theme | null
    const initial = saved ?? getBrowserTheme()
    isDark.value = initial === 'dark'
    apply(isDark.value)
    localStorage.setItem(storageKey, initial)
  })

  watch(isDark, (v) => {
    apply(v)
    localStorage.setItem(storageKey, v ? 'dark' : 'light')
  })

  /**
   * Переключает тему и возвращает новое значение.
   * @returns Новое значение isDark.
   */
  const toggle = () => (isDark.value = !isDark.value)

  /**
   * Устанавливает тему и возвращает новое значение.
   * @param v Флаг темной темы.
   * @returns Новое значение isDark.
   */
  const set = (v: boolean) => (isDark.value = v)

  return { isDark, toggle, set }
}
