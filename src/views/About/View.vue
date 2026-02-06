<template lang="pug">
section.about-view(v-testid="'about-root'")
  h1.about-view__title(v-testid="'about-title'") Тест
  p.about-view__description(v-testid="'about-description'") Это тестовая страница для проверки роутера.
</template>

<style scoped lang="scss">
.about-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
