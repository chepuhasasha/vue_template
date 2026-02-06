import { describe, it, expect } from 'vitest'
import { defineComponent } from 'vue'
import { config, mount } from '@vue/test-utils'
import { useTestId } from '@/composables/useTestId'

const mountWithComposable = (options?: { withGlobalPlugin?: boolean }) => {
  let api!: ReturnType<typeof useTestId>

  const Host = defineComponent({
    setup() {
      api = useTestId()
      return () => null
    },
  })

  const originalPlugins = config.global.plugins

  if (options?.withGlobalPlugin === false) {
    config.global.plugins = []
  }

  const wrapper = mount(Host)

  config.global.plugins = originalPlugins

  return { api, wrapper }
}

describe('useTestId', () => {
  it('возвращает префикс из плагина и собирает data-testid', () => {
    const envPrefix = import.meta.env.VITE_TEST_ID_PREFIX
    const { api, wrapper } = mountWithComposable()

    const expected = [envPrefix, 'save'].filter(Boolean).join('-')

    expect(api.prefix).toBe(envPrefix)
    expect(api.getTestId('save')).toBe(expected)

    wrapper.unmount()
  })

  it('без плагина работает с локальным prefix из значения', () => {
    const { api, wrapper } = mountWithComposable({ withGlobalPlugin: false })

    expect(api.prefix).toBeUndefined()
    expect(api.getTestId({ id: 'save', prefix: 'local' })).toBe('local-save')

    wrapper.unmount()
  })
})
