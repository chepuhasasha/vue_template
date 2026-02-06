# Сервисы

[← Назад к корневому README](../../README.md)

Папка `src/services/` содержит сервисы для работы с внешними источниками данных и состоянием сессии.

## Правила

- Каждый сервис отвечает за один домен (auth, профили, каталог и т.д.).
- Публичный API сервиса описывается в этом README и экспортируется через `src/services/index.ts`.
- Ошибки внешних запросов приводите к предсказуемым типам (например, `AuthError`).
- Побочные эффекты (localStorage, cookies) держите внутри сервиса и явно документируйте.

## Список сервисов

### Auth

Сервис авторизации и управления SID.

#### Публичный API

| Экспорт                          | Тип                                                      | Описание                                          |
| -------------------------------- | -------------------------------------------------------- | ------------------------------------------------- |
| `login`                          | `(credentials: AuthCredentials) => Promise<AuthSession>` | Выполняет авторизацию и возвращает SID.           |
| `saveSessionId`                  | `(sid: string) => void`                                  | Сохраняет SID в `localStorage`.                   |
| `getSessionId`                   | `() => string`                                           | Читает SID из `localStorage` (или пустую строку). |
| `clearSessionId`                 | `() => void`                                             | Удаляет SID из `localStorage`.                    |
| `buildAuthLoginUrl`              | `(baseUrl: string, loginPath?: string) => string`        | Собирает полный URL эндпойнта авторизации.        |
| `isAuthError`                    | `(error: unknown) => error is AuthError`                 | Проверяет, что ошибка имеет тип `AuthError`.      |
| `AUTH_ERROR_INVALID_CREDENTIALS` | `string`                                                 | Код ошибки неверных учетных данных.               |
| `AuthError`                      | `class`                                                  | Ошибка авторизации, пригодная для UI-обработки.   |
| `AuthCredentials`                | `{ login: string; password: string }`                    | Тип входных данных авторизации.                   |
| `AuthSession`                    | `{ sid: string }`                                        | Тип успешного ответа авторизации.                 |

#### Поведение

- `login` нормализует логин и пароль (обрезает пробелы).
- Если логин или пароль пустые, выбрасывается `AuthError`.
- Для статусов 400/401/403 или `code=invalid_credentials` выбрасывается `AuthError`.
- Для прочих неуспешных ответов выбрасывается обычная `Error`.
- SID хранится в `localStorage` по ключу `session-id`.
- Для подписи API-запросов используйте `apiFetch`, который добавляет SID в заголовок запроса.

#### Пример

```ts
import { login, saveSessionId, isAuthError } from '@/services'

try {
  const session = await login({ login: 'demo', password: 'secret' })
  saveSessionId(session.sid)
} catch (error) {
  if (isAuthError(error)) {
    console.log('Неверные учетные данные')
  }
}
```

### API

Сервис для унифицированных API-запросов с подписью SID.

#### Публичный API

| Экспорт | Тип | Описание |
| --- | --- | --- |
| `apiFetch` | `(path: string, options?: ApiFetchOptions) => Promise<Response>` | Выполняет запрос к API и добавляет SID в заголовок. |
| `buildApiUrl` | `(baseUrl: string, path: string) => string` | Собирает полный URL API на основе base URL и пути запроса. |
| `resolveApiUrl` | `(path: string, baseUrl?: string) => string` | Собирает URL API, используя `VITE_API_BASE_URL` по умолчанию. |
| `API_SESSION_HEADER` | `string` | Имя заголовка для подписи запросов SID. |
| `ApiFetchOptions` | `type` | Параметры `fetch` с опциями `baseUrl`, `includeSessionId`, `sessionId`. |

#### Поведение

- `apiFetch` добавляет заголовок `X-Session-Id` со значением SID, если он сохранен.
- Если SID отсутствует, запрос отправляется без подписи.
- Если `API_SESSION_HEADER` уже задан вручную, он не перезаписывается.

### URL API

Запросы отправляются на `VITE_API_BASE_URL`, если переменная задана.  
Если `VITE_API_BASE_URL` пустой, используются same-origin пути (например, `POST /auth/login`).

Пример:

- `VITE_API_BASE_URL=http://localhost:3001` → `POST http://localhost:3001/auth/login`;
- `VITE_API_BASE_URL=` → `POST /auth/login`.

### Мок-сервер API

Для разработки используйте мок‑бэкенд `api_mock.js` (Express).  
Запуск: `npm run mock`.

- По умолчанию сервер слушает `http://localhost:3001`.
- Порт можно переопределить через `PORT`.
- Включен CORS и JSON-body parser.

Текущие эндпойнты:

- `POST /auth/login` → `{ "sid": "..." }` при успехе.
- При неверных данных сервер возвращает `{ "code": "invalid_credentials" }` и статус 400/401/403.

Новые эндпойнты добавляйте в `api_mock.js` и отражайте изменения в документации сервисов.

### Ошибки

`login` может выбрасывать `AuthError` с кодом `invalid_credentials`, если логин или пароль некорректны.
