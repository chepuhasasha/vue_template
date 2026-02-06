import { describe, it, expect, vi, afterEach } from 'vitest'
import { defineComponent } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import UIIcon from '@/components/ui/UIIcon.vue'
import { buildTestId, type TestIdValue } from '@/plugins/testId'

const testIdPrefix = import.meta.env.VITE_TEST_ID_PREFIX
const getTestId = (value: TestIdValue) => buildTestId(value, testIdPrefix) ?? ''
const byTestId = (value: TestIdValue) => `[data-testid="${getTestId(value)}"]`

const IconWrapper = defineComponent({
  components: { UIIcon },
  props: {
    name: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      default: undefined,
    },
    color: {
      type: String,
      default: undefined,
    },
  },
  template: `<UIIcon v-testid="'icon'" :name="name" :size="size" :color="color" />`,
})

const mountIcon = (props: InstanceType<typeof IconWrapper>['$props']) =>
  mount(IconWrapper, {
    props,
  })

const createFetchMock = (text: string, ok = true) => {
  const mock = vi.fn().mockResolvedValue({
    ok,
    text: () => Promise.resolve(text),
  })

  vi.stubGlobal('fetch', mock)

  return mock
}

const createCacheStorageMock = (entries: Record<string, string> = {}) => {
  const store = new Map(Object.entries(entries))
  const cache = {
    match: vi.fn(async (url: string) => {
      const cached = store.get(url)
      if (!cached) {
        return undefined
      }

      return new Response(cached, {
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    }),
    put: vi.fn(async (url: string, response: Response) => {
      const text = await response.text()
      store.set(url, text)
    }),
  }

  const open = vi.fn(async () => cache)

  vi.stubGlobal('caches', { open })

  return { store, cache, open }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetAllMocks()
})

describe('UIIcon.vue', () => {
  it('рендерит пути из txt по имени иконки', async () => {
    const mockFetch = createFetchMock('M0 0L1 1\nM1 1L2 2')
    const w = mountIcon({ name: 'activity' })

    await flushPromises()

    const baseUrl = import.meta.env.BASE_URL as string
    const expectedUrl = `${baseUrl.replace(/\/?$/, '/')}icons/activity.txt`

    expect(mockFetch).toHaveBeenCalledWith(expectedUrl)

    const root = w.get(byTestId('icon'))
    const paths = root.findAll('path')

    expect(paths).toHaveLength(2)
    expect(paths[0].attributes('d')).toBe('M0 0L1 1')
  })

  it('не рендерит svg при отсутствии файла', async () => {
    createFetchMock('', false)
    const w = mountIcon({ name: 'missing' })

    await flushPromises()

    expect(w.get(byTestId('icon')).find('svg').exists()).toBe(false)
  })

  it('использует Cache Storage при наличии записи', async () => {
    const baseUrl = import.meta.env.BASE_URL as string
    const expectedUrl = `${baseUrl.replace(/\/?$/, '/')}icons/cache-storage-hit.txt`

    createCacheStorageMock({
      [expectedUrl]: 'M0 0L1 1',
    })

    const mockFetch = createFetchMock('M9 9L10 10')
    const w = mountIcon({ name: 'cache-storage-hit' })

    await flushPromises()

    expect(mockFetch).not.toHaveBeenCalled()
    expect(w.get(byTestId('icon')).findAll('path')).toHaveLength(1)
  })

  it('сохраняет иконку в Cache Storage после загрузки', async () => {
    const baseUrl = import.meta.env.BASE_URL as string
    const expectedUrl = `${baseUrl.replace(/\/?$/, '/')}icons/cache-storage-miss.txt`
    const { cache } = createCacheStorageMock()
    const mockFetch = createFetchMock('M0 0L1 1')
    const w = mountIcon({ name: 'cache-storage-miss' })

    await flushPromises()

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(cache.put).toHaveBeenCalledTimes(1)
    expect(cache.put).toHaveBeenCalledWith(expectedUrl, expect.any(Response))
    expect(w.get(byTestId('icon')).findAll('path')).toHaveLength(1)
  })

  it('применяет размер и цвет', async () => {
    createFetchMock('M0 0L1 1')
    const w = mountIcon({ name: 'alert-circle', size: 'l', color: '#ff5a5f' })

    await flushPromises()

    const root = w.get(byTestId('icon'))

    expect(root.classes()).toContain('ui-icon--l')
    expect(root.attributes('style')).toContain('color:')
  })

  it('использует Cache Storage при повторном запросе', async () => {
    createCacheStorageMock()
    const mockFetch = createFetchMock('M0 0L1 1')

    const w = mountIcon({ name: 'cache-a' })
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledTimes(1)

    await w.setProps({ name: 'cache-b' })
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledTimes(2)

    await w.setProps({ name: 'cache-a' })
    await flushPromises()

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})
