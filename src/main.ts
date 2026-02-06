import './assets/styles/null.scss'
import './assets/styles/root.scss'
import './assets/styles/layout.scss'
import './assets/styles/animations.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import components from './components'
import { testIdPlugin } from './plugins'
import router from './router'

const app = createApp(App)
const isTestIdDisabled = import.meta.env.VITE_DISABLE_TEST_ID === 'true'
const testIdPrefix = import.meta.env.VITE_TEST_ID_PREFIX

app.use(createPinia())
app.use(components)
app.use(testIdPlugin, { prefix: testIdPrefix, enabled: !isTestIdDisabled })
app.use(router)

app.mount('#app')
