import './assets/styles/null.scss'
import './assets/styles/root.scss'
import './assets/styles/layout.scss'
import './assets/styles/animations.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import components from './components'
import testIdPlugin from './plugins/testId'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(components)
app.use(testIdPlugin, { prefix: 'app' })
app.use(router)

app.mount('#app')
