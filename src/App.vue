<template lang="pug">
main
  .test
    h1 Vue template
    p body text
    UIButton(@click="toggle" testid='theme-toggle' rounded) {{ isDark ? 'Dark' : 'Light' }}
  .test_2
    UIButton(size='s' testid='btn-1') Button
    UIButton(size='m' testid='btn-1') Button
    UIButton(size='l' testid='btn-1' accent)
      | Download #[b PDF]
      template(v-slot:end)
        span 123

</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { isDark, toggle, set } = useTheme('dark', 'theme')
</script>
<style lang="scss">
main {
  grid-template-rows: max-content 1fr;
  grid-template-columns: max-content 1fr;
  padding: 40px;
}

.test {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--bg-color-l2);
  padding: 40px;
  width: max-content;
  height: max-content;

  &_2 {
    display: flex;
    flex-direction: column;
    gap: 20px;
    border: 1px solid var(--bdr-color);
    padding: 40px;
  }

  p {
    color: var(--txt-color-l2);
  }
}
</style>
