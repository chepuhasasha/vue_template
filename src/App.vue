<template lang="pug">
main.app(v-testid="'root'")
  header.app__header(v-testid="'header'")
    h1.app__title Vue template
    UIButton(@click="toggle" v-testid="'header-theme-toggle'" rounded)
      | {{ isDark ? 'Dark' : 'Light' }}
  nav.app__nav(v-testid="'navigation'")
    RouterLink.app__link(to="/") Главная
    RouterLink.app__link(to="/about") О проекте
  section.app__content(v-testid="'content'")
    RouterView
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { isDark, toggle, set } = useTheme('dark', 'theme')
</script>
<style lang="scss">
.app {
  display: grid;
  grid-template-rows: max-content max-content 1fr;
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

  &__nav {
    display: flex;
    gap: 16px;
  }

  &__link {
    text-decoration: none;
    color: var(--txt-color-l2);

    &.router-link-active {
      color: var(--txt-color);
      font-weight: 600;
    }
  }

  &__content {
    border-radius: 16px;
    background: var(--bg-color-l2);
    padding: 24px;
  }
}
</style>
