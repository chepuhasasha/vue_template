# Vue Template

## Обзор проекта

Этот репозиторий — стартовый шаблон приложения на **Vue 3** с готовой базовой инфраструктурой: типизация, линтеры, форматирование, тесты, PWA и набор базовых UI-компонентов. Проект собран на **Vite**, поддерживает **Pinia** для состояния и включает **Axios** для запросов. 【F:package.json†L1-L54】

## Стек и подключенные инструменты

- **Vue 3** — основной UI-фреймворк. 【F:package.json†L20-L24】
- **Vite** — сборка и dev-сервер. 【F:package.json†L44-L45】
- **TypeScript** — типизация. 【F:package.json†L43-L43】
- **Pinia** — управление состоянием. 【F:package.json†L20-L24】
- **Axios** — HTTP-клиент для запросов. 【F:package.json†L20-L24】
- **PWA** — регистрация service worker через `vite-plugin-pwa`. 【F:package.json†L44-L45】
- **ESLint** + **Stylelint** + **Prettier** — линтинг и форматирование. 【F:package.json†L26-L42】
- **Vitest** + Testing Library — тестирование. 【F:package.json†L26-L42】

## Архитектура и структура проекта

```
src/
  assets/          # шрифты, изображения, общие стили
  assets/styles/   # базовые SCSS: reset, layout, темы, анимации
  components/      # UI-компоненты (например, UIButton)
  composables/     # композиции (например, useTheme)
  App.vue          # корневой компонент
  main.ts          # точка входа приложения
```

### Точка входа

В `src/main.ts` инициализируется приложение, подключаются глобальные стили, Pinia, глобальные компоненты и регистрация PWA. 【F:src/main.ts†L1-L26】

### Глобальные компоненты

Глобальная регистрация компонент организована через `src/components/index.ts` (пример — `UIButton`). 【F:src/components/index.ts†L1-L8】

### Темизация

Композиция `useTheme` управляет тёмной/светлой темой, используя `localStorage` и `matchMedia`. 【F:src/composables/useTheme.ts†L1-L34】

### Стили

Базовые стили и переменные расположены в `src/assets/styles/`, подключаются в `main.ts`. 【F:src/main.ts†L1-L4】

## Как запустить проект локально

1. Установите зависимости:

   ```bash
   npm install
   ```

2. Запуск dev-сервера:

   ```bash
   npm run dev
   ```

3. Сборка проекта:

   ```bash
   npm run build
   ```

4. Предпросмотр production-сборки:

   ```bash
   npm run preview
   ```

## Проверки качества

- Форматирование кода:
  ```bash
  npm run format
  ```
- Линтинг (ESLint + Stylelint):
  ```bash
  npm run lint
  ```
- Тесты:
  ```bash
  npm run test
  ```

## Продакшн-развёртывание

### 1. Подготовка build

На CI или локально:

```bash
npm ci
npm run build
```

Результат сборки появится в папке `dist/`.

### 2. Размещение на сервере

Раздавайте содержимое `dist/` через любой HTTP-сервер (Nginx, Caddy, Vercel, Netlify и т.д.).

Пример минимальной конфигурации Nginx:

```
server {
  listen 80;
  server_name example.com;

  root /var/www/vue_template/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### 3. PWA

Проект уже подключает регистрацию service worker (через `vite-plugin-pwa`), поэтому при продакшн-сборке и раздаче `dist/` приложение автоматически может работать офлайн и кешировать статику. 【F:src/main.ts†L7-L26】

## Примечания

- В проекте нет жёстко заданных `.env` переменных — при необходимости добавьте `VITE_`-переменные по стандартам Vite.
- Версии Node.js указаны в `package.json` — убедитесь, что окружение соответствует требованиям. 【F:package.json†L6-L9】
