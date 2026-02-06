<template lang="pug">
section.home-view(v-testid="'home-root'")
  h1.home-view__title(v-testid="'home-title'") Главная страница
  p.home-view__description(v-testid="'home-description'") Это тестовая страница для проверки роутера.
</template>

<style scoped lang="scss">
.home-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
