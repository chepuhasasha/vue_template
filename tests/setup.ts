import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/vue'
import { afterEach, expect, vi } from 'vitest'

expect.extend(matchers)

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
