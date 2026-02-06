# Тесты композиций

[← Назад](../README.md)

Юнит-тесты composables с фокусом на публичный API и побочные эффекты.

## Подход

- Тестируйте только публичные функции и возвращаемые значения.
- Для composables, зависящих от Vue-жизненного цикла, используйте хост-компонент.
- Изолируйте побочные эффекты: `localStorage`, `document`, `matchMedia`, таймеры.

## Именование файлов

- Имя файла теста: `useXxx.spec.ts`.

## Что проверяем

- Возвращаемые значения и их изменения.
- Побочные эффекты, которые видит пользователь или приложение.
- Граничные случаи: пустые значения, ошибки, значения по умолчанию.

## Рекомендации

- Для асинхронной логики используйте `nextTick` и явно дожидайтесь обновлений.
- Сбрасывайте `localStorage` и глобальные моки в `beforeEach`.

## Описание тестов

### `tests/composables/useTheme.spec.ts`

| Тест                                                                     | Описание                                                                            |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `берёт тему из localStorage (dark) и применяет класс`                    | Проверяет приоритет `localStorage`, установку класса на `body` и сохранение `dark`. |
| `если localStorage пуст — берёт prefers-color-scheme: dark`              | Проверяет выбор темы по `prefers-color-scheme: dark` при отсутствии `localStorage`. |
| `если localStorage пуст и prefers-color-scheme не dark — остаётся light` | Проверяет дефолт на `light`, когда системная тема не `dark`.                        |
| `toggle() переключает тему, класс на body и localStorage`                | Проверяет переключение темы и синхронизацию `body` и `localStorage`.                |
| `set(true/false) применяет тему и сохраняет в localStorage`              | Проверяет установку темы через `set` и запись значения.                             |
| `уважает кастомные className и storageKey`                               | Проверяет работу с кастомным CSS-классом и ключом хранения.                         |

## Пример хост-компонента

```ts
import { describe, it, expect } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useTheme } from '@/composables/useTheme'

describe('useTheme', () => {
  it('применяет класс к body', async () => {
    let api!: ReturnType<typeof useTheme>

    const Host = defineComponent({
      setup() {
        api = useTheme()
        return () => null
      },
    })

    mount(Host)
    await nextTick()

    api.set(true)
    await nextTick()

    expect(document.body.classList.contains('dark')).toBe(true)
  })
})
```
