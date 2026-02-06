import { describe, it, expect } from 'vitest'

import { byTestId, getTestId } from './helpers'

describe('testId utils', () => {
  it('собирает data-testid с учетом префикса', () => {
    const prefix = import.meta.env.VITE_TEST_ID_PREFIX
    const expected = [prefix, 'save'].filter(Boolean).join('-')

    expect(getTestId('save')).toBe(expected)
    expect(byTestId('save')).toBe(`[data-testid="${expected}"]`)
  })

  it('возвращает пустую строку, если id пустой', () => {
    expect(getTestId('   ')).toBe('')
  })
})
