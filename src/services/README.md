# Сервисы

[← Назад к корневому README](../../README.md)

Папка `src/services/` содержит сервисы для работы с внешними источниками данных и состоянием сессии.

## Список сервисов

### Auth

Сервис авторизации:

- `login` — выполняет авторизацию по логину и паролю и возвращает `sid`.
- `saveSessionId` — сохраняет `sid` в хранилище браузера.
- `getSessionId` — читает сохранённый `sid`.
- `clearSessionId` — удаляет сохранённый `sid`.

### URL API

Авторизация отправляется на `VITE_API_BASE_URL`, если переменная задана.  
Если `VITE_API_BASE_URL` пустой, используется `POST /auth/login` (same-origin).

Пример:

- `VITE_API_BASE_URL=http://localhost:3001` → `POST http://localhost:3001/auth/login`;
- `VITE_API_BASE_URL=` → `POST /auth/login`.

### Мок-сервер

Для разработки можно использовать мок-бэкенд `serverMock.js` (Express).  
Запуск: `npm run mock`.

Эндпойнт мок-сервера: `POST /auth/login`.

Ожидаемый ответ успешной авторизации: `{ "sid": "..." }`.  
При ошибке неверных данных можно вернуть `{ "code": "invalid_credentials" }` с HTTP 400/401/403.

### Ошибки

`login` может выбрасывать `AuthError` с кодом `invalid_credentials`, если логин или пароль некорректны.
