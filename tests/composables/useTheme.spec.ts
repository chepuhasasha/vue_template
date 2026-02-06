import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useTheme } from '@/composables/useTheme'

function setMatchMediaDark(isDark: boolean) {
  const mql = {
    matches: isDark,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(), // legacy
    removeListener: vi.fn(), // legacy
    dispatchEvent: vi.fn(),
  }
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue(mql),
  })
}

async function mountWithTheme(opts?: { className?: string; storageKey?: string }) {
  let api!: ReturnType<typeof useTheme>

  const Comp = defineComponent({
    name: 'ThemeHost',
    setup() {
      api = useTheme(opts?.className, opts?.storageKey)
      return () => null
    },
  })

  mount(Comp)
  await nextTick()
  await nextTick()
  return api
}

beforeEach(() => {
  document.body.className = ''
  localStorage.clear()
  setMatchMediaDark(false)
})

describe('useTheme', () => {
  it('берёт тему из localStorage (dark) и применяет класс', async () => {
    localStorage.setItem('theme', 'dark')
    const { isDark } = await mountWithTheme()

    expect(isDark.value).toBe(true)
    expect(document.body.classList.contains('theme')).toBe(true)
    expect(document.body.classList.contains('theme--dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('если localStorage пуст — берёт prefers-color-scheme: dark', async () => {
    setMatchMediaDark(true)
    const { isDark } = await mountWithTheme()

    expect(isDark.value).toBe(true)
    expect(document.body.classList.contains('theme')).toBe(true)
    expect(document.body.classList.contains('theme--dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('если localStorage пуст и prefers-color-scheme не dark — остаётся light', async () => {
    setMatchMediaDark(false)
    const { isDark } = await mountWithTheme()

    expect(isDark.value).toBe(false)
    expect(document.body.classList.contains('theme')).toBe(true)
    expect(document.body.classList.contains('theme--dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('toggle() переключает тему, класс на body и localStorage', async () => {
    localStorage.setItem('theme', 'light')
    const { isDark, toggle } = await mountWithTheme()

    toggle()
    await nextTick()

    expect(isDark.value).toBe(true)
    expect(document.body.classList.contains('theme')).toBe(true)
    expect(document.body.classList.contains('theme--dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')

    toggle()
    await nextTick()

    expect(isDark.value).toBe(false)
    expect(document.body.classList.contains('theme')).toBe(true)
    expect(document.body.classList.contains('theme--dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('set(true/false) применяет тему и сохраняет в localStorage', async () => {
    const { set } = await mountWithTheme()

    set(true)
    await nextTick()
    expect(document.body.classList.contains('theme')).toBe(true)
    expect(document.body.classList.contains('theme--dark')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')

    set(false)
    await nextTick()
    expect(document.body.classList.contains('theme')).toBe(true)
    expect(document.body.classList.contains('theme--dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('уважает кастомные className и storageKey', async () => {
    localStorage.setItem('my_key', 'dark')
    const { isDark, toggle } = await mountWithTheme({
      className: 'theme--dark',
      storageKey: 'my_key',
    })

    expect(isDark.value).toBe(true)
    expect(document.body.classList.contains('theme')).toBe(true)
    expect(document.body.classList.contains('theme--dark')).toBe(true)
    expect(localStorage.getItem('my_key')).toBe('dark')

    toggle()
    await nextTick()
    expect(document.body.classList.contains('theme')).toBe(true)
    expect(document.body.classList.contains('theme--dark')).toBe(false)
    expect(localStorage.getItem('my_key')).toBe('light')
  })
})
