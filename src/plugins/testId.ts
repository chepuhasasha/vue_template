import type { DirectiveBinding, App } from 'vue'

export type TestIdValue = string | TestIdConfig
export interface TestIdConfig {
  id: string
  prefix?: string
  suffix?: string
}
export interface TestIdPluginOptions {
  prefix?: string
}

export type TestIdDirectiveValue = TestIdValue | null | undefined

export const TEST_ID_PREFIX_KEY = Symbol('test-id-prefix')

/**
 * Нормализует часть идентификатора, убирая лишние пробелы.
 */
const sanitizeTestIdPart = (value?: string) => {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()

  return trimmed ? trimmed : undefined
}

/**
 * Приводит входные данные к единому формату конфигурации data-testid.
 */
const normalizeTestIdConfig = (value: TestIdValue, globalPrefix?: string) => {
  const resolvedPrefix = sanitizeTestIdPart(globalPrefix)

  if (typeof value === 'string') {
    const id = sanitizeTestIdPart(value)
    return id ? { id, prefix: resolvedPrefix } : undefined
  }

  const id = sanitizeTestIdPart(value.id)

  if (!id) {
    return undefined
  }

  return {
    id,
    prefix: sanitizeTestIdPart(value.prefix) ?? resolvedPrefix,
    suffix: sanitizeTestIdPart(value.suffix),
  }
}

/**
 * Формирует итоговый data-testid с учетом общего префикса и суффикса.
 */
export const buildTestId = (value: TestIdValue, globalPrefix?: string) => {
  const normalized = normalizeTestIdConfig(value, globalPrefix)

  if (!normalized) {
    return undefined
  }

  return [normalized.prefix, normalized.id, normalized.suffix].filter(Boolean).join('-')
}

/**
 * Применяет data-testid к элементу, удаляя атрибут при пустом значении.
 */
const applyTestId = (el: HTMLElement, value: TestIdDirectiveValue, prefix?: string) => {
  if (!value) {
    el.removeAttribute('data-testid')
    return
  }

  const resolved = buildTestId(value, prefix)

  if (!resolved) {
    el.removeAttribute('data-testid')
    return
  }

  el.setAttribute('data-testid', resolved)
}

/**
 * Обрабатывает установку data-testid при монтировании директивы.
 */
const onDirectiveMounted = (
  el: HTMLElement,
  binding: DirectiveBinding<TestIdDirectiveValue>,
  prefix?: string,
) => {
  applyTestId(el, binding.value, prefix)
}

/**
 * Обрабатывает установку data-testid при обновлении директивы.
 */
const onDirectiveUpdated = (
  el: HTMLElement,
  binding: DirectiveBinding<TestIdDirectiveValue>,
  prefix?: string,
) => {
  applyTestId(el, binding.value, prefix)
}

/**
 * Создает директиву для установки data-testid.
 */
const createTestIdDirective = (prefix?: string) => ({
  mounted(el: HTMLElement, binding: DirectiveBinding<TestIdDirectiveValue>) {
    onDirectiveMounted(el, binding, prefix)
  },
  updated(el: HTMLElement, binding: DirectiveBinding<TestIdDirectiveValue>) {
    onDirectiveUpdated(el, binding, prefix)
  },
})

const testIdPlugin = {
  /**
   * Регистрирует директиву v-testid и передает глобальный префикс.
   */
  install(app: App, options?: TestIdPluginOptions) {
    const prefix = options?.prefix

    app.provide(TEST_ID_PREFIX_KEY, prefix)
    app.directive('testid', createTestIdDirective(prefix))
  },
}

export default testIdPlugin
