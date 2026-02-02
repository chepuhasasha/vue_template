import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/ui/UIButton.vue'

describe('UIButton.vue', () => {
  it('рендерит default slot в .ui-button__label', () => {
    const w = mount(Button, {
      props: { testid: 'btn' },
      slots: { default: 'Click' },
    })

    expect(w.get('[data-testid="btn"]').exists()).toBe(true)
    expect(w.get('.ui-button__label').text()).toBe('Click')
  })

  it('по умолчанию: primary + m + rounded', () => {
    const w = mount(Button, { props: { testid: 'btn' } })
    const btn = w.get('button')

    expect(btn.classes()).toContain('ui-button--primary')
    expect(btn.classes()).toContain('ui-button--m')
    expect(btn.classes()).toContain('ui-button--rounded')
  })

  it('variant=secondary добавляет ui-button--secondary', () => {
    const w = mount(Button, { props: { testid: 'btn', variant: 'secondary' } })
    expect(w.get('button').classes()).toContain('ui-button--secondary')
  })

  it('rounded=false убирает ui-button--rounded', () => {
    const w = mount(Button, { props: { testid: 'btn', rounded: false } })
    expect(w.get('button').classes()).not.toContain('ui-button--rounded')
  })

  it.each(['s', 'm', 'l'] as const)('size=%s ставит ui-button--%s', (size) => {
    const w = mount(Button, { props: { testid: 'btn', size } })
    expect(w.get('button').classes()).toContain(`ui-button--${size}`)
  })

  it('иконка без текста добавляет ui-button--icon-only', () => {
    const w = mount(Button, {
      props: { testid: 'btn' },
      slots: {
        start: '<span data-testid="icon">★</span>',
      },
    })

    expect(w.get('button').classes()).toContain('ui-button--icon-only')
    expect(w.get('[data-testid="icon"]').text()).toBe('★')
  })

  it('loading=true блокирует кнопку и показывает loader', () => {
    const w = mount(Button, {
      props: { testid: 'btn', loading: true },
    })

    expect(w.get('button').attributes('disabled')).toBeDefined()
    expect(w.get('.ui-button__loader').exists()).toBe(true)
  })
})
