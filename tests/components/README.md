# Тесты компонентов

[← Назад](../README.md)

Тесты UI- и page-компонентов с упором на поведение пользователя.

## Подход

- По умолчанию пишем поведенческие тесты через `@testing-library/vue`.
- `@vue/test-utils` допускается для проверок, которые нельзя выразить через публичное поведение.
- Избегайте проверки внутренней реализации, если это не влияет на UX.

## Что проверяем

- Рендер и состояния: `loading`, `disabled`, `error`, пустые состояния.
- Эмиссию событий и реакцию на действия пользователя.
- Доступность: `label`, `aria-*`, корректные роли и названия.

## Селекторы

- Основной селектор — `data-testid` (задаётся через `v-testid`).
- Другие селекторы (`getByRole`, `getByLabelText`, `getByText`) используйте только в крайних случаях, когда `data-testid` недоступен.

## Именование файлов

- Имя файла теста: `ComponentName.spec.ts`.

## Пример (Testing Library)

```ts
import { render, screen } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import UIButton from '@/components/ui/UIButton.vue'

describe('UIButton', () => {
  it('показывает текст и блокируется при loading', () => {
    render({
      components: { UIButton },
      template: `<UIButton v-testid="'save-button'" :loading="true">Save</UIButton>`,
    })

    expect(screen.getByTestId('save-button')).toBeDisabled()
  })
})
```

## Пример (Vue Test Utils)

```ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import UIInput from '@/components/ui/UIInput.vue'

describe('UIInput', () => {
  it('эмитит update:modelValue при вводе', async () => {
    const w = mount({
      components: { UIInput },
      template: `<UIInput v-testid="'input'" :modelValue="''" />`,
    })

    await w.get('[data-testid="input"]').get('input').setValue('hello')

    const input = w.getComponent(UIInput)

    expect(input.emitted('update:modelValue')?.[0]).toEqual(['hello'])
  })
})
```

## Описание тестов

### `tests/components/Button.spec.ts`

| Тест                                                | Описание                                                                                        |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `рендерит default slot в .ui-button__label`         | Проверяет, что default slot отображается внутри `.ui-button__label` и установлен `data-testid`. |
| `по умолчанию: primary + m + rounded`               | Проверяет дефолтные классы варианта, размера и округления.                                      |
| `variant=secondary добавляет ui-button--secondary`  | Проверяет применение класса `ui-button--secondary` при `variant="secondary"`.                   |
| `rounded=false убирает ui-button--rounded`          | Проверяет отсутствие класса `ui-button--rounded`, когда `rounded=false`.                        |
| `size=%s ставит ui-button--%s`                      | Проверяет, что классы размера корректно применяются для `s`, `m`, `l`.                          |
| `иконка без текста добавляет ui-button--icon-only`  | Проверяет `icon-only`-состояние при наличии только слота `start`.                               |
| `loading=true блокирует кнопку и показывает loader` | Проверяет `disabled` и наличие лоадера при `loading=true`.                                      |

### `tests/components/Input.spec.ts`

| Тест                                          | Описание                                                        |
| --------------------------------------------- | --------------------------------------------------------------- |
| `рендерит label и связывает его с input`      | Проверяет текст `label` и связку `for`/`id` с `input`.          |
| `эмитит update:modelValue при вводе`          | Проверяет эмит `update:modelValue` с введенным значением.       |
| `эмитит blur со значением`                    | Проверяет эмит `blur` со значением после `blur`.                |
| `добавляет aria-describedby для hint и error` | Проверяет `aria-describedby`, тексты hint/error и класс ошибки. |
| `применяет размер и disabled состояние`       | Проверяет классы размера/disabled и атрибут `disabled`.         |

### `tests/components/Icon.spec.ts`

| Тест                                       | Описание                                                        |
| ------------------------------------------ | --------------------------------------------------------------- |
| `рендерит пути из txt по имени иконки`      | Проверяет загрузку `.txt` и отрисовку `<path>` по данным `d`.    |
| `не рендерит svg при отсутствии файла`     | Проверяет отсутствие `<svg>` при `response.ok = false`.         |
| `использует Cache Storage при наличии записи` | Проверяет чтение иконки из долговременного кэша.                |
| `сохраняет иконку в Cache Storage после загрузки` | Проверяет запись иконки в долговременный кэш.                |
| `применяет размер и цвет`                  | Проверяет класс размера и inline-цвет на корневом элементе.      |
| `использует Cache Storage при повторном запросе` | Проверяет, что повторная загрузка не вызывает новый `fetch`. |
