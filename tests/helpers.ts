import { buildTestId, type TestIdValue } from '@/plugins'

const testIdPrefix = import.meta.env.VITE_TEST_ID_PREFIX

export type { TestIdValue }

export const getTestId = (value: TestIdValue) => buildTestId(value, testIdPrefix) ?? ''

export const byTestId = (value: TestIdValue) => `[data-testid="${getTestId(value)}"]`
