import { inject } from 'vue'
import { TEST_ID_PREFIX_KEY, buildTestId, type TestIdValue } from '@/plugins'

/**
 * Возвращает хелперы для генерации data-testid с учетом глобального префикса.
 * @returns Объект с getTestId и глобальным префиксом.
 */
export function useTestId() {
  const prefix = inject<string | undefined>(TEST_ID_PREFIX_KEY, undefined)

  /**
   * Формирует data-testid для элемента по заданной конфигурации.
   * @param value Значение для сборки data-testid.
   * @returns Итоговый data-testid или undefined, если id пустой.
   */
  const getTestId = (value: TestIdValue) => buildTestId(value, prefix)

  return {
    getTestId,
    prefix,
  }
}
