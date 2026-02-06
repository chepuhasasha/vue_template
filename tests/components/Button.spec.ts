import { describe, it, expect } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import UIButton from '@/components/ui/UIButton.vue'
import { byTestId } from '../helpers'

type ButtonMountOptions = {
  props?: InstanceType<typeof UIButton>['$props']
  label?: string
  startIcon?: boolean
}

const mountButton = (options: ButtonMountOptions = {}) => {
  const { props = {}, label, startIcon = false } = options
  const hasLabel = typeof label !== 'undefined'

  return mount(
    defineComponent({
      components: { UIButton },
      setup() {
        return { props, label, hasLabel, startIcon }
      },
      template: `
        <UIButton v-testid="'btn'" v-bind="props">
          <template v-slot:start v-if="startIcon">
            <span v-testid="'icon'">★</span>
          </template>
          <template v-slot:default v-if="hasLabel">{{ label }}</template>
        </UIButton>
      `,
    }),
  )
}

describe('UIButton.vue', () => {
  it('рендерит default slot в .ui-button__label', () => {
    const w = mountButton({ label: 'Click' })

    const button = w.get(byTestId('btn'))

    expect(button.exists()).toBe(true)
    expect(w.get(byTestId({ id: 'ui-button', suffix: 'label' })).text()).toBe('Click')
  })

  it('по умолчанию: primary + m + rounded', () => {
    const w = mountButton()
    const btn = w.get(byTestId('btn'))

    expect(btn.classes()).toContain('ui-button--primary')
    expect(btn.classes()).toContain('ui-button--m')
    expect(btn.classes()).toContain('ui-button--rounded')
  })

  it('variant=secondary добавляет ui-button--secondary', () => {
    const w = mountButton({ props: { variant: 'secondary' } })
    expect(w.get(byTestId('btn')).classes()).toContain('ui-button--secondary')
  })

  it('rounded=false убирает ui-button--rounded', () => {
    const w = mountButton({ props: { rounded: false } })
    expect(w.get(byTestId('btn')).classes()).not.toContain('ui-button--rounded')
  })

  it.each(['s', 'm', 'l'] as const)('size=%s ставит ui-button--%s', (size) => {
    const w = mountButton({ props: { size } })
    expect(w.get(byTestId('btn')).classes()).toContain(`ui-button--${size}`)
  })

  it('иконка без текста добавляет ui-button--icon-only', () => {
    const w = mountButton({ startIcon: true })

    expect(w.get(byTestId('btn')).classes()).toContain('ui-button--icon-only')
    expect(w.get(byTestId('icon')).text()).toBe('★')
  })

  it('loading=true блокирует кнопку и показывает loader', () => {
    const w = mountButton({ props: { loading: true } })

    expect(w.get(byTestId('btn')).attributes('disabled')).toBeDefined()
    expect(w.get(byTestId({ id: 'ui-button', suffix: 'loader' })).exists()).toBe(true)
  })
})
