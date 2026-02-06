<template lang="pug">
main.app(v-testid="'root'")
  header.app__header(v-testid="'header'")
    h1.app__title(v-testid="'header-title'") {{ t('app.title') }}
    div.app__controls(v-testid="'header-controls'")
      UIButton(
        @click="toggleLanguage"
        v-testid="'header-language-toggle'"
        :aria-label="t('language.toggle')"
        rounded
      )
        | {{ t('language.current') }}
      UIButton(@click="toggle" v-testid="'header-theme-toggle'" rounded)
        template(#start)
          UIIcon(:name="isDark ? 'moon-01' : 'sun'" size="m")
  section.app__content(v-testid="'content'")
    RouterView
</template>

<script setup lang="ts">
import { useI18n, useTheme } from '@/composables'

const { isDark, toggle } = useTheme('theme--dark', 'theme')
const { locale, setLocale, t } = useI18n()

/**
 * Переключает локаль приложения на альтернативную.
 * @returns Ничего не возвращает.
 */
const toggleLanguage = () => {
  const nextLocale = locale.value === 'ru' ? 'en' : 'ru'
  setLocale(nextLocale)
}
</script>
<style lang="scss">
.app {
  display: grid;
  grid-template-rows: max-content 1fr;
  gap: 24px;
  padding: 32px;

  &__header {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-size: 28px;
  }

  &__controls {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  &__content {
    border-radius: 16px;
    background: var(--bg-color-l2);
    padding: 24px;
  }
}
</style>
