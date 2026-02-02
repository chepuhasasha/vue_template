import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UIInput from '@/components/ui/UIInput.vue'

describe('UIInput.vue', () => {
  it('рендерит label и связывает его с input', () => {
    const w = mount(UIInput, {
      props: { label: 'Email', id: 'email-input', testid: 'input' },
    })

    expect(w.get('label').text()).toBe('Email')
    expect(w.get('label').attributes('for')).toBe('email-input')
    expect(w.get('input').attributes('id')).toBe('email-input')
  })

  it('эмитит update:modelValue при вводе', async () => {
    const w = mount(UIInput, {
      props: { modelValue: '', testid: 'input' },
    })

    await w.get('input').setValue('hello')

    expect(w.emitted('update:modelValue')).toBeTruthy()
    expect(w.emitted('update:modelValue')?.[0]).toEqual(['hello'])
  })

  it('эмитит blur со значением', async () => {
    const w = mount(UIInput, {
      props: { modelValue: 'init', testid: 'input' },
    })

    await w.get('input').setValue('done')
    await w.get('input').trigger('blur')

    expect(w.emitted('blur')).toBeTruthy()
    expect(w.emitted('blur')?.[0]).toEqual(['done'])
  })

  it('добавляет aria-describedby для hint и error', () => {
    const w = mount(UIInput, {
      props: {
        id: 'name',
        hint: 'Подсказка',
        error: 'Ошибка',
        testid: 'input',
      },
    })

    const describedBy = w.get('input').attributes('aria-describedby')

    expect(describedBy).toBe('name-hint name-error')
    expect(w.get('#name-hint').text()).toBe('Подсказка')
    expect(w.get('#name-error').text()).toBe('Ошибка')
    expect(w.get('.ui-input').classes()).toContain('ui-input--error')
  })

  it('применяет размер и disabled состояние', () => {
    const w = mount(UIInput, {
      props: { size: 'l', disabled: true, testid: 'input' },
    })

    expect(w.get('.ui-input').classes()).toContain('ui-input--l')
    expect(w.get('.ui-input').classes()).toContain('ui-input--disabled')
    expect(w.get('input').attributes('disabled')).toBeDefined()
  })
})
