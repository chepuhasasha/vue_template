# Композиции

[← Назад к корневому README](../../README.md)

Содержит переиспользуемую логику в виде composables.

## Содержимое

- `useTheme` — управление темой (localStorage и `prefers-color-scheme`).
- `useTestId` — генерация `data-testid` с учетом глобального префикса.

## Правила

- Новая композиция должна быть описана в этом файле.
- Документируйте параметры, возвращаемые значения и побочные эффекты.

## useTheme

### Описание

Управляет темной темой через класс на `document.body`, синхронизирует состояние с `localStorage` и учитывает системную тему браузера (`prefers-color-scheme`).

### Сигнатура

`useTheme(className?: string, storageKey?: string)`

### Параметры

| Параметр     | Тип    | По умолчанию | Описание                                                          |
| ------------ | ------ | ------------ | ----------------------------------------------------------------- |
| `className`  | string | `'theme--dark'` | CSS-класс темы (рекомендуется `block--modifier`); при модификаторе базовый `block` добавляется автоматически. |
| `storageKey` | string | `'theme'`    | Ключ в `localStorage` для хранения значения темы.                 |

### Возвращает

| Имя      | Тип                           | Описание                                        |
| -------- | ----------------------------- | ----------------------------------------------- |
| `isDark` | `Ref<boolean>`                | Текущее состояние темы.                         |
| `toggle` | `() => boolean`               | Переключает тему и возвращает новое значение.   |
| `set`    | `(value: boolean) => boolean` | Устанавливает тему и возвращает новое значение. |

### Поведение и особенности

- При монтировании читает тему из `localStorage`, иначе использует системную (`prefers-color-scheme`).
- Синхронизирует значение с `localStorage` при любом изменении `isDark`.
- Добавляет или убирает класс на `document.body`, поэтому предназначена для работы в браузере.
- Если базовый класс пустой после обрезки пробелов, он не добавляется в `document.body`.

### Примеры

```ts
import { useTheme } from '@/composables/useTheme'

const { isDark, toggle, set } = useTheme()

toggle()
set(true)
```

```ts
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme('theme--dark', 'app-theme')
```

---

## useTestId

### Описание

Возвращает хелпер для генерации `data-testid` с учетом глобального префикса, который предоставляет плагин `testId`.

### Сигнатура

`useTestId()`

### Возвращает

| Имя         | Тип                                           | Описание                                                   |
| ----------- | --------------------------------------------- | ---------------------------------------------------------- |
| `getTestId` | `(value: TestIdValue) => string \| undefined` | Собирает `data-testid` из значения и глобального префикса. |
| `prefix`    | `string \| undefined`                         | Глобальный префикс, если он зарегистрирован в плагине.     |

### Типы

```ts
type TestIdValue = string | { id: string; prefix?: string; suffix?: string }
```

### Поведение и особенности

- Глобальный префикс берется через `inject(TEST_ID_PREFIX_KEY)` из плагина `testId`.
- Возвращает `undefined`, если `id` пустой или состоит только из пробелов.
- Можно использовать в вычисляемых значениях, методах и тестах для унификации `data-testid`.

### Примеры

```ts
import { computed } from 'vue'
import { useTestId } from '@/composables/useTestId'

const { getTestId } = useTestId()

const submitTestId = computed(() => getTestId({ id: 'submit', suffix: 'button' }))
```

```ts
import { useTestId } from '@/composables/useTestId'

const { prefix, getTestId } = useTestId()

getTestId('save')
```
