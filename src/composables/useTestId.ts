import { inject } from 'vue'
import { TEST_ID_PREFIX_KEY } from '@/plugins/testId'
import { buildTestId, type TestIdValue } from '@/plugins/testId'

/**
 * Возвращает хелперы для генерации data-testid с учетом глобального префикса.
 */
export function useTestId() {
  const prefix = inject<string | undefined>(TEST_ID_PREFIX_KEY, undefined)

  /**
   * Формирует data-testid для элемента по заданной конфигурации.
   */
  const getTestId = (value: TestIdValue) => buildTestId(value, prefix)

  return {
    getTestId,
    prefix,
  }
}
