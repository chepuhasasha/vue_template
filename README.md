# Vue Template

Шаблон приложения на Vue 3 + Vite.

- [Правила разработки](DEVELOPMENT_RULES.md)
- [Компоненты](src/components/README.md)
- [Композиции](src/composables/README.md)
- [Страницы](src/views/README.md)
- [Плагины](src/plugins/README.md)
- [Тесты](tests/README.md)
- [История изменений](CHANGELOG.md)

## Требования

- Для локальной разработки: Node.js `^20.19.0` или `>=22.12.0`.
- Для тестового окружения и продакшена: Docker.

## Скрипты проекта

Все команды запускаются из корня проекта.

| Скрипт                  | Описание                                                       |
| ----------------------- | -------------------------------------------------------------- |
| `npm run dev`           | Локальный dev-сервер Vite.                                     |
| `npm run build`         | Полная сборка: `type-check` + `build-only`.                    |
| `npm run preview`       | Предпросмотр production-сборки локально.                       |
| `npm run build-only`    | Сборка Vite без проверки типов.                                |
| `npm run type-check`    | Проверка типов через `vue-tsc`.                                |
| `npm run lint`          | Линтинг кода и стилей: `lint:code` + `lint:styles`.            |
| `npm run lint:code`     | ESLint с автопочинкой и кэшем.                                 |
| `npm run lint:styles`   | Stylelint для `src/**/*.{vue,css,sass,scss}` с автопочинкой.   |
| `npm run format`        | Форматирование кода и стилей: `format:code` + `format:styles`. |
| `npm run format:code`   | Prettier для `src` и `tests`.                                  |
| `npm run format:styles` | Stylelint для стилей (аналогично `lint:styles`).               |
| `npm run test`          | Запуск тестов Vitest с покрытием.                              |
| `npm run precommit`     | Последовательно: `format`, `lint`, `test`.                     |

## Переменные окружения

- Пользовательские переменные доступны только на этапе сборки и должны иметь префикс `VITE_`.
- Примеры лежат в `.env.dev.example`, `.env.test.example`, `.env.prod.example`.

| Переменная             | Значение                              | Где используется | Описание                                                 |
| ---------------------- | ------------------------------------- | ---------------- | -------------------------------------------------------- |
| `VITE_BASE_URL`        | `/` или `/admin/`                     | build            | Базовый путь приложения для деплоя в подпути.            |
| `VITE_DISABLE_TEST_ID` | `true` / `false`                      | build            | Отключает генерацию `data-testid` через `v-testid`.      |
| `VITE_TEST_ID_PREFIX`  | строка (например, `app`)              | build            | Глобальный префикс `data-testid` (для плагина `testId`). |
| `VITE_NODE_ENV`        | `development` / `test` / `production` | build            | Значение `process.env.NODE_ENV`, прокидываемое в сборку. |

Рекомендуемые значения:

- dev: `VITE_DISABLE_TEST_ID=false`, `VITE_BASE_URL=/`, `VITE_TEST_ID_PREFIX=app`, `VITE_NODE_ENV=development`.
- test: `VITE_DISABLE_TEST_ID=false`, `VITE_BASE_URL=/`, `VITE_TEST_ID_PREFIX=app`, `VITE_NODE_ENV=test`.
- prod: `VITE_DISABLE_TEST_ID=true`, `VITE_BASE_URL=/` (или `/<подпуть>/` при деплое в подпути), `VITE_TEST_ID_PREFIX=app`, `VITE_NODE_ENV=production`.

`VITE_BASE_URL` задаёт base в Vite (в том числе `import.meta.env.BASE_URL`) и влияет на URL ассетов и роутинг.

## Сценарии

### 1. Разработка (локально)

1. Подготовьте локальные переменные:

   ```bash
   cp .env.dev.example .env
   ```

2. Установите зависимости:

   ```bash
   npm install
   ```

3. Запустите dev-сервер:

   ```bash
   npm run dev
   ```

4. Откройте приложение: `http://localhost:5173`.

### 2. Тестовое окружение (Docker + Nginx)

1. Подготовьте переменные для сборки:

   ```bash
   cp .env.test.example .env.production
   ```

2. Создайте `nginx.conf` и `Dockerfile` (см. раздел [Файлы для Docker + Nginx](#файлы-для-docker--nginx)).

3. Соберите образ:

   ```bash
   docker build -t vue-template:test .
   ```

4. Запустите контейнер:

   ```bash
   docker run -d --name vue-template-test -p 8080:80 vue-template:test
   ```

5. Проверьте: `http://localhost:8080`.

### 3. Продакшен (Docker + Nginx)

1. Подготовьте переменные для сборки:

   ```bash
   cp .env.prod.example .env.production
   ```

2. Соберите образ:

   ```bash
   docker build -t vue-template:prod .
   ```

3. Запустите контейнер:

   ```bash
   docker run -d --name vue-template -p 80:80 --restart unless-stopped vue-template:prod
   ```

4. Откройте приложение на вашем домене/хосте.

## Файлы для Docker + Nginx

Создайте `nginx.conf` в корне проекта:

```nginx
events { # блок событий Nginx
  worker_connections 1024; # максимум соединений на один воркер
} # конец блока событий
http { # HTTP-настройки
  include /etc/nginx/mime.types; # подключить корректные MIME-типы для статики
  server { # сервер раздачи SPA
    listen 80; # порт внутри контейнера
    root /usr/share/nginx/html; # каталог со сборкой приложения
    index index.html; # основной файл SPA
    location / { # все входящие запросы приложения
      try_files $uri $uri/ /index.html; # SPA-фолбэк на index.html
    } # конец location
  } # конец server
} # конец http
```

Создайте `Dockerfile` в корне проекта:

```Dockerfile
FROM node:20-alpine AS build
WORKDIR /admin
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.25-alpine
COPY --from=build /admin/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Деплой в подпути (например, `/admin/`)

Как разместить приложение **не в корне домена**, а по адресу вида `https://example.com/admin/`.

### Шаг 1. Выберите подпуть и зафиксируйте формат

Подпуть **должен** начинаться и **заканчиваться** слэшем:

- корректно: `/admin/`
- некорректно: `/admin`, `admin/`, `admin`

Это критично для генерации URL ассетов и роутинга.

### Шаг 2. Установите `VITE_BASE_URL` **на этапе сборки**

`VITE_BASE_URL` читается **только при сборке**, поэтому при смене подпути нужно пересобирать приложение.

Пример для продакшена:

```bash
cp .env.prod.example .env.production
```

В `.env.production` укажите:

```
VITE_BASE_URL=/admin/
```

Далее собирайте как обычно (локально или в Docker).

### Шаг 3. Разместите сборку **в подпапке на сервере**

Если подпуть `/admin/`, то содержимое `dist` должно лежать в папке `admin` внутри web-root.

Пример структуры на сервере:

```
/usr/share/nginx/html/
  admin/
    index.html
    assets/
```

### Шаг 4. Настройте веб‑сервер (Nginx пример)

Конфигурация ниже обслуживает SPA **только по подпути** и делает корректный фолбэк на `index.html`.

```nginx
events { worker_connections 1024; }
http {
  include /etc/nginx/mime.types;
  server {
    listen 80;
    root /usr/share/nginx/html;

    # редирект с /admin на /admin/
    location = /admin {
      return 301 /admin/;
    }

    # основное приложение в подпути
    location /admin/ {
      try_files $uri $uri/ /admin/index.html;
    }
  }
}
```

### Шаг 5. Пример Dockerfile для подпути

Если в подпути `/admin/`, копируйте сборку **в подпапку**:

```Dockerfile
FROM node:20-alpine AS build
WORKDIR /admin
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.25-alpine
COPY --from=build /admin/dist /usr/share/nginx/html/admin
COPY ./nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Шаг 6. Проверка

1. Соберите проект с `VITE_BASE_URL=/admin/`.
2. Откройте `https://example.com/admin/`.
3. Проверьте, что:
   - страница открывается,
   - навигация через `router-link` работает,
   - ассеты не дают 404.

### Частые проблемы и как их избежать

- **404 на ассетах**: проверьте `VITE_BASE_URL` и что `dist` лежит **в подпапке** (`/admin/`).
- **Неправильные ссылки**: избегайте абсолютных путей вида `/images/logo.png`. Используйте `import.meta.env.BASE_URL` или стандартный импорт ассетов через Vite.
- **Нельзя открыть `/admin` без слэша**: добавьте редирект (см. Nginx пример).
