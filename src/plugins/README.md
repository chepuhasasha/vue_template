# Плагины

[← Назад к корневому README](../../README.md)

Папка содержит локальные плагины Vue, подключаемые через `app.use(...)` в `src/main.ts`.

## Содержимое

- `testId` — директива `v-testid` и вспомогательная логика для `data-testid`.

## Правила

- Новый плагин должен быть описан в этом файле.
- Документируйте все опции, публичные директивы и утилиты.
- Подключайте плагины в `src/main.ts` через `app.use(...)`.

## testId

### Описание

Плагин добавляет директиву `v-testid` для установки `data-testid` и передает глобальный префикс через `provide`. Помогает унифицировать идентификаторы в UI-тестах.

### Регистрация

```ts
import { testIdPlugin } from '@/plugins'

app.use(testIdPlugin, { prefix: 'app' })
```

Если нужно отключить `data-testid` (например, в продакшене), передайте `enabled: false`. Обычно это связывают с `VITE_DISABLE_TEST_ID`.

### Опции плагина

| Опция     | Тип       | По умолчанию | Описание                                            |
| --------- | --------- | ------------ | --------------------------------------------------- |
| `enabled` | `boolean` | `true`       | Включает/выключает установку `data-testid`.         |
| `prefix`  | `string`  | `undefined`  | Глобальный префикс для `data-testid`.               |

### Директива `v-testid`

#### Значение

`string` или объект с настройками.

```ts
type TestIdValue = string | { id: string; prefix?: string; suffix?: string }
```

#### Поведение и особенности

- Пробелы в `id`, `prefix`, `suffix` обрезаются, пустые значения игнорируются.
- Если `id` пустой или значение не задано, атрибут `data-testid` удаляется.
- Итоговый id собирается как `prefix-id-suffix`.
- `prefix` из значения директивы имеет приоритет над глобальным префиксом плагина.
- `suffix` доступен только в объектной форме.

### Хелперы

- `buildTestId(value, prefix?)` — возвращает итоговый `data-testid` или `undefined`.
- `useTestId()` — composable из `src/composables/README.md`, который использует глобальный префикс плагина.
- `useHasExternalTestId()` — возвращает `ComputedRef<boolean>`, показывающий, передан ли на компонент внешний `v-testid`.

### Примеры

```pug
<template>
  <button v-testid="'save'">Сохранить</button>
  <button v-testid="{ id: 'save', suffix: 'button' }">Сохранить</button>
  <div v-testid="isReady ? { id: 'card', prefix: 'profile' } : undefined">
    ...
  </div>
</template>
```

```ts
import { useTestId } from '@/composables'

const { getTestId } = useTestId()

const submitTestId = getTestId({ id: 'submit', suffix: 'button' })
```

```ts
import { useHasExternalTestId } from '@/plugins'

const hasExternalTestId = useHasExternalTestId()
```
