import { describe, it, expect } from 'vitest'

import { normalizeBaseUrl } from '@/utils'

describe('normalizeBaseUrl', () => {
  it('возвращает / для пустых значений и "/"', () => {
    expect(normalizeBaseUrl('')).toBe('/')
    expect(normalizeBaseUrl('   ')).toBe('/')
    expect(normalizeBaseUrl('/')).toBe('/')
  })

  it('добавляет ведущий и завершающий слэш', () => {
    expect(normalizeBaseUrl('admin')).toBe('/admin/')
    expect(normalizeBaseUrl('/admin')).toBe('/admin/')
    expect(normalizeBaseUrl('/admin/')).toBe('/admin/')
  })
})
