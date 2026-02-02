import type { App } from 'vue'
import UIButton from './ui/UIButton.vue'
import UIInput from './ui/UIInput.vue'

const components = {
  UIButton,
  UIInput,
}

/**
 * Регистрирует UI-компоненты как глобальные.
 */
const install = (app: App) => {
  Object.entries(components).forEach(([name, component]) => {
    app.component(name, component)
  })
}

export { UIButton, UIInput, install }

export default {
  install,
}
