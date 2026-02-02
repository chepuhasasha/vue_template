import './assets/styles/null.scss'
import './assets/styles/root.scss'
import './assets/styles/layout.scss'
import './assets/styles/animations.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { registerSW } from 'virtual:pwa-register'

import App from './App.vue'
import components from './components'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(components)
app.use(router)

app.mount('#app')

/**
 * Регистрирует сервис-воркер приложения для поддержки PWA.
 * @returns {void} Возвращает `undefined` после инициализации регистрации.
 */
function registerServiceWorker(): void {
  registerSW()
}

registerServiceWorker()
