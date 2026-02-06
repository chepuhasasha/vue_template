# Утилиты

[← Назад к корневому README](../../README.md)

Содержит небольшие утилитарные функции без зависимости от Vue.

## Содержимое

- `normalizeBaseUrl` — нормализует base URL с ведущим и завершающим слэшем.

## normalizeBaseUrl

### Описание

Нормализует base URL, добавляя ведущий и завершающий слэш, чтобы корректно формировать пути.

### Сигнатура

`normalizeBaseUrl(baseUrl: string): string`

### Параметры

| Параметр  | Тип     | Описание                                       |
| --------- | ------- | ---------------------------------------------- |
| `baseUrl` | string  | Исходный base URL (например, `/admin/` или `admin`). |

### Возвращает

| Значение | Тип     | Описание                                      |
| -------- | ------- | --------------------------------------------- |
| `string` | string  | Base URL с ведущим и завершающим слэшем. |

### Пример

```ts
import { normalizeBaseUrl } from '@/utils'

normalizeBaseUrl('/admin')
// => '/admin/'

normalizeBaseUrl('admin')
// => '/admin/'

normalizeBaseUrl('/')
// => '/'
```
