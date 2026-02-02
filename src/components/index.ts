import type { App } from 'vue'
import Button from './Button.vue'

export default {
  install(vue: App) {
    vue.component('UIButton', Button)
  },
}
