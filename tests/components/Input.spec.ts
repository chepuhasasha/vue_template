import { describe, it, expect } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import UIInput from '@/components/ui/UIInput.vue'
import { byTestId } from '../helpers'

type InputMountOptions = {
  props?: InstanceType<typeof UIInput>['$props']
  slots?: {
    end?: string
  }
}

const mountInput = (options: InputMountOptions = {}) => {
  const { props = {}, slots = {} } = options
  const endSlot = slots.end ? `<template #end>${slots.end}</template>` : ''

  return mount(
    defineComponent({
      components: { UIInput },
      setup() {
        return { props }
      },
      template: `
        <UIInput v-testid="'input'" v-bind="props">
          ${endSlot}
        </UIInput>
      `,
    }),
    {
      global: {
        stubs: {
          UIIcon: true,
        },
      },
    },
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

  it('рендерит иконку перед input', () => {
    const w = mountInput({
      props: {
        icon: 'user-01',
      },
    })

    const field = w.get(byTestId('input')).get(byTestId({ id: 'ui-input', suffix: 'field' }))
    const row = field.get(byTestId({ id: 'ui-input', suffix: 'row' }))
    const start = row.get(byTestId({ id: 'ui-input', suffix: 'icon' }))
    const control = row.get(byTestId({ id: 'ui-input', suffix: 'control' }))

    const children = Array.from(row.element.children)

    expect(children[0]).toBe(start.element)
    expect(children[1]).toBe(control.element)
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

  it('layout=horizontal добавляет ui-input--horizontal', () => {
    const w = mountInput({
      props: { layout: 'horizontal' },
    })

    expect(w.get(byTestId('input')).classes()).toContain('ui-input--horizontal')
  })
})
