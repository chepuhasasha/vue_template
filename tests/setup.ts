import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/vue'
import { config } from '@vue/test-utils'
import { afterEach, expect, vi } from 'vitest'

import testIdPlugin from '@/plugins/testId'

expect.extend(matchers)

config.global.plugins = [...(config.global.plugins ?? []), testIdPlugin]

afterEach(() => {
  cleanup()
})

vi.mock('axios', () => {
  const mockInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
    create: vi.fn(() => mockInstance),
  }

  return {
    __esModule: true,
    default: mockInstance,
    ...mockInstance,
  }
})

vi.stubGlobal('alert', vi.fn())

const consoleError = console.error

console.error = (...args: unknown[]): void => {
  consoleError.apply(console, args)
}
