import { computed, getCurrentInstance, resolveDirective, type ComputedRef } from 'vue'
import type { DirectiveBinding, App } from 'vue'

export type TestIdValue = string | TestIdConfig
export interface TestIdConfig {
  id: string
  prefix?: string
  suffix?: string
}
export interface TestIdPluginOptions {
  enabled?: boolean
  prefix?: string
}

export type TestIdDirectiveValue = TestIdValue | null | undefined

export const TEST_ID_PREFIX_KEY = Symbol('test-id-prefix')

/**
 * Определяет, передан ли на текущий компонент внешний `v-testid` от родителя.
 * @returns Вычисляемое значение `true`, если на корневой vnode есть директива `v-testid`,
 * или `false`, если директива отсутствует, плагин не зарегистрирован либо функция вызвана
 * вне `setup()` (когда нет активного экземпляра компонента).
 */
export const useHasExternalTestId = (): ComputedRef<boolean> => {
  const instance = getCurrentInstance()
  const testIdDirective = resolveDirective('testid')

  return computed(() => {
    if (!instance || !testIdDirective) {
      return false
    }

    return (instance.vnode.dirs ?? []).some((dir) => dir.dir === testIdDirective)
  })
}

/**
 * Нормализует часть идентификатора, убирая лишние пробелы.
 * @param value Значение части идентификатора.
 * @returns Очищенное значение или undefined.
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
 * @param value Значение директивы.
 * @param globalPrefix Глобальный префикс плагина.
 * @returns Нормализованная конфигурация или undefined.
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
 * @param value Значение директивы.
 * @param globalPrefix Глобальный префикс для data-testid.
 * @returns Итоговый data-testid или undefined.
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
 * @param el HTML-элемент для установки data-testid.
 * @param value Значение директивы.
 * @param prefix Префикс data-testid.
 * @param enabled Включено ли использование data-testid.
 */
const applyTestId = (
  el: HTMLElement,
  value: TestIdDirectiveValue,
  prefix?: string,
  enabled = true,
) => {
  if (!enabled) {
    el.removeAttribute('data-testid')
    return
  }

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
 * @param el HTML-элемент.
 * @param binding Привязка директивы.
 * @param prefix Префикс data-testid.
 * @param enabled Включено ли использование data-testid.
 */
const onDirectiveMounted = (
  el: HTMLElement,
  binding: DirectiveBinding<TestIdDirectiveValue>,
  prefix?: string,
  enabled?: boolean,
) => {
  applyTestId(el, binding.value, prefix, enabled)
}

/**
 * Обрабатывает установку data-testid при обновлении директивы.
 * @param el HTML-элемент.
 * @param binding Привязка директивы.
 * @param prefix Префикс data-testid.
 * @param enabled Включено ли использование data-testid.
 */
const onDirectiveUpdated = (
  el: HTMLElement,
  binding: DirectiveBinding<TestIdDirectiveValue>,
  prefix?: string,
  enabled?: boolean,
) => {
  applyTestId(el, binding.value, prefix, enabled)
}

/**
 * Создает директиву для установки data-testid.
 * @param prefix Префикс data-testid.
 * @param enabled Включено ли использование data-testid.
 * @returns Объект директивы.
 */
const createTestIdDirective = (prefix?: string, enabled?: boolean) => ({
  mounted(el: HTMLElement, binding: DirectiveBinding<TestIdDirectiveValue>) {
    onDirectiveMounted(el, binding, prefix, enabled)
  },
  updated(el: HTMLElement, binding: DirectiveBinding<TestIdDirectiveValue>) {
    onDirectiveUpdated(el, binding, prefix, enabled)
  },
})

const testIdPlugin = {
  /**
   * Регистрирует директиву v-testid и передает глобальный префикс.
   * @param app Экземпляр приложения Vue.
   * @param options Опции плагина.
   */
  install(app: App, options?: TestIdPluginOptions) {
    const prefix = options?.prefix
    const enabled = options?.enabled ?? true

    app.provide(TEST_ID_PREFIX_KEY, prefix)
    app.directive('testid', createTestIdDirective(prefix, enabled))
  },
}

export default testIdPlugin
