import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/Button.vue'

describe('Button.vue', () => {
  it('рендерит default slot в .button_text', () => {
    const w = mount(Button, {
      props: { testid: 'btn' },
      slots: { default: 'Click' },
    })

    expect(w.get('[data-testid="btn"]').exists()).toBe(true)
    expect(w.get('.button_text').text()).toBe('Click')
  })

  it('по умолчанию: m + rect, без accent и без has-end', () => {
    const w = mount(Button, { props: { testid: 'btn' } })
    const btn = w.get('button')

    expect(btn.classes()).toContain('button--m')
    expect(btn.classes()).toContain('button--rect')
    expect(btn.classes()).not.toContain('button--accent')
    expect(btn.classes()).not.toContain('button--has-end')
  })

  it('accent=true добавляет button--accent', () => {
    const w = mount(Button, { props: { testid: 'btn', accent: true } })
    expect(w.get('button').classes()).toContain('button--accent')
  })

  it('rounded=true убирает button--rect', () => {
    const w = mount(Button, { props: { testid: 'btn', rounded: true } })
    expect(w.get('button').classes()).not.toContain('button--rect')
  })

  it.each(['s', 'm', 'l'] as const)('size=%s ставит button--%s', (size) => {
    const w = mount(Button, { props: { testid: 'btn', size } })
    expect(w.get('button').classes()).toContain(`button--${size}`)
  })

  it('end-slot НЕ передан: button--has-end отсутствует', () => {
    const w = mount(Button, {
      props: { testid: 'btn' },
      slots: { default: 'Text' },
    })

    expect(w.get('button').classes()).not.toContain('button--has-end')
  })

  it('end-slot передан, но пустой: button--has-end отсутствует', () => {
    const w = mount(Button, {
      props: { testid: 'btn' },
      slots: {
        default: 'Text',
        end: () => [],
      },
    })

    expect(w.get('button').classes()).not.toContain('button--has-end')
  })

  it('end-slot с контентом: рендерится и добавляет button--has-end', () => {
    const w = mount(Button, {
      props: { testid: 'btn' },
      slots: {
        default: 'Text',
        end: '<span data-testid="end">→</span>',
      },
    })

    expect(w.get('button').classes()).toContain('button--has-end')
    expect(w.get('[data-testid="end"]').text()).toBe('→')
  })
})
