import { describe, it, expect } from 'vitest'
import { createApp, nextTick, ref, type Ref } from 'vue'
import testIdPlugin, { type TestIdDirectiveValue, type TestIdPluginOptions } from '@/plugins/testId'

type MountResult = {
  app: ReturnType<typeof createApp>
  host: HTMLDivElement
  target: HTMLSpanElement
  testId: Ref<TestIdDirectiveValue>
}

/**
 * Монтирует компонент с v-testid и подключенным плагином testId.
 * @param initialTestId Начальное значение, которое попадет в v-testid.
 * @param options Опции плагина testId.
 * @returns Данные для управления инстансом, его DOM и очисткой.
 */
const mountWithPlugin = (
  initialTestId: TestIdDirectiveValue = 'sample',
  options?: TestIdPluginOptions,
): MountResult => {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const testId = ref<TestIdDirectiveValue>(initialTestId)

  const app = createApp({
    setup() {
      return { testId }
    },
    template: `
      <div v-testid="'host'">
        <span v-testid="testId"></span>
      </div>
    `,
  })
  app.use(testIdPlugin, options)

  app.mount(host)
  const target = host.querySelector('span')

  if (!target) {
    throw new Error('Target element not found')
  }

  return {
    app,
    host,
    target: target as HTMLSpanElement,
    testId,
  }
}

const cleanup = ({ app, host }: Pick<MountResult, 'app' | 'host'>) => {
  app.unmount()
  host.remove()
}

describe('testIdPlugin', () => {
  it('устанавливает data-testid когда включен', () => {
    const context = mountWithPlugin()

    expect(context.target.getAttribute('data-testid')).toBe('sample')

    cleanup(context)
  })

  it('не устанавливает data-testid когда отключен', () => {
    const context = mountWithPlugin('sample', { enabled: false })

    expect(context.target.hasAttribute('data-testid')).toBe(false)

    cleanup(context)
  })

  it('снимает data-testid при сбросе значения', async () => {
    const context = mountWithPlugin('sample')

    expect(context.target.getAttribute('data-testid')).toBe('sample')

    context.testId.value = null
    await nextTick()

    expect(context.target.hasAttribute('data-testid')).toBe(false)

    cleanup(context)
  })

  it('не устанавливает data-testid при пустом id', () => {
    const context = mountWithPlugin('   ')

    expect(context.target.hasAttribute('data-testid')).toBe(false)

    cleanup(context)
  })
})
