import type { App } from 'vue'
import UIButton from './ui/UIButton.vue'
import UIInput from './ui/UIInput.vue'

const components = {
  UIButton,
  UIInput,
}

export default {
  install(app: App) {
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component)
    })
  },
}
