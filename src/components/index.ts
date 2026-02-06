import type { App } from 'vue'
import UIButton from './ui/UIButton.vue'
import UIIcon from './ui/UIIcon.vue'
import UIInput from './ui/UIInput.vue'

const components = {
  UIButton,
  UIIcon,
  UIInput,
}

export default {
  install(app: App) {
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component)
    })
  },
}
