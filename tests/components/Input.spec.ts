import { describe, it, expect } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import UIInput from '@/components/ui/UIInput.vue'
import { buildTestId, type TestIdValue } from '@/plugins/testId'

const testIdPrefix = import.meta.env.VITE_TEST_ID_PREFIX
const getTestId = (value: TestIdValue) => buildTestId(value, testIdPrefix) ?? ''
const byTestId = (value: TestIdValue) => `[data-testid="${getTestId(value)}"]`

type InputMountOptions = {
  props?: InstanceType<typeof UIInput>['$props']
}

const mountInput = (options: InputMountOptions = {}) => {
  const { props = {} } = options

  return mount(
    defineComponent({
      components: { UIInput },
      setup() {
        return { props }
      },
      template: `
        <UIInput v-testid="'input'" v-bind="props" />
      `,
    }),
  )
}

describe('UIInput.vue', () => {
  it('рендерит label и связывает его с input', () => {
    const w = mountInput({
      props: { label: 'Email', id: 'email-input' },
    })

    const root = w.get(byTestId('input'))

    const label = root.get(byTestId({ id: 'ui-input', suffix: 'label' }))
    const input = root.get(byTestId({ id: 'ui-input', suffix: 'control' }))

    expect(label.text()).toBe('Email')
    expect(label.attributes('for')).toBe('email-input')
    expect(input.attributes('id')).toBe('email-input')
  })

  it('эмитит update:modelValue при вводе', async () => {
    const w = mountInput({
      props: { modelValue: '' },
    })

    await w
      .get(byTestId('input'))
      .get(byTestId({ id: 'ui-input', suffix: 'control' }))
      .setValue('hello')

    const inputWrapper = w.getComponent(UIInput)

    expect(inputWrapper.emitted('update:modelValue')).toBeTruthy()
    expect(inputWrapper.emitted('update:modelValue')?.[0]).toEqual(['hello'])
  })

  it('эмитит blur со значением', async () => {
    const w = mountInput({
      props: { modelValue: 'init' },
    })

    const input = w.get(byTestId('input')).get(byTestId({ id: 'ui-input', suffix: 'control' }))

    await input.setValue('done')
    await input.trigger('blur')

    const inputWrapper = w.getComponent(UIInput)

    expect(inputWrapper.emitted('blur')).toBeTruthy()
    expect(inputWrapper.emitted('blur')?.[0]).toEqual(['done'])
  })

  it('добавляет aria-describedby для hint и error', () => {
    const w = mountInput({
      props: {
        id: 'name',
        hint: 'Подсказка',
        error: 'Ошибка',
      },
    })

    const describedBy = w
      .get(byTestId('input'))
      .get(byTestId({ id: 'ui-input', suffix: 'control' }))
      .attributes('aria-describedby')

    expect(describedBy).toBe('name-hint name-error')
    expect(w.get(byTestId({ id: 'ui-input', suffix: 'hint' })).text()).toBe('Подсказка')
    expect(w.get(byTestId({ id: 'ui-input', suffix: 'error' })).text()).toBe('Ошибка')
    expect(w.get(byTestId('input')).classes()).toContain('ui-input--error')
  })

  it('применяет размер и disabled состояние', () => {
    const w = mountInput({
      props: { size: 'l', disabled: true },
    })

    const root = w.get(byTestId('input'))

    expect(root.classes()).toContain('ui-input--l')
    expect(root.classes()).toContain('ui-input--disabled')
    expect(
      root.get(byTestId({ id: 'ui-input', suffix: 'control' })).attributes('disabled'),
    ).toBeDefined()
  })
})
