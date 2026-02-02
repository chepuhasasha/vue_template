import { onMounted, ref, watch } from 'vue'

type Theme = 'light' | 'dark'

export function useTheme(className = 'dark', storageKey = 'theme') {
  const isDark = ref(false)

  const apply = (v: boolean) => {
    document.body.classList.toggle(className, v)
  }

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

  const toggle = () => (isDark.value = !isDark.value)
  const set = (v: boolean) => (isDark.value = v)

  return { isDark, toggle, set }
}
