<template lang="pug">
section.not-found-view(v-testid="'not-found-root'")
  div.not-found-view__card(v-testid="'not-found-card'")
    header.not-found-view__header(v-testid="'not-found-header'")
      p.not-found-view__code(v-testid="'not-found-code'") {{ NOT_FOUND_CODE }}
      h1.not-found-view__title(v-testid="'not-found-title'") {{ t('notFound.title') }}
      p.not-found-view__subtitle(v-testid="'not-found-subtitle'")
        | {{ t('notFound.subtitle') }}
    div.not-found-view__actions(v-testid="'not-found-actions'")
      UIButton(
        variant="secondary"
        @click="onGoHome"
        v-testid="'not-found-home'"
      ) {{ t('notFound.homeAction') }}
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useI18n } from '@/composables'
import { ROUTE_NAME_HOME } from '@/router/constants'

const NOT_FOUND_CODE = '404'

const { t } = useI18n()
const router = useRouter()

/**
 * Перенаправляет пользователя на домашнюю страницу.
 * Не принимает параметры.
 * @returns Ничего не возвращает.
 */
const onGoHome = () => {
  void router.replace({ name: ROUTE_NAME_HOME })
}
</script>

<style scoped lang="scss">
.not-found-view {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  width: 100%;
  min-height: 100%;

  &__card {
    display: flex;
    flex-direction: column;
    gap: 20px;
    border: 1px solid var(--bdr-color);
    border-radius: 24px;
    box-shadow: 0 16px 40px rgb(0 0 0 / 8%);
    background: var(--bg-color-l1);
    padding: 24px;
    width: min(520px, 100%);
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__code {
    letter-spacing: 4px;
    color: var(--txt-color-l2);
    font-size: 48px;
    font-weight: 700;
  }

  &__title {
    font-size: 24px;
    font-weight: 700;
  }

  &__subtitle {
    color: var(--txt-color-l2);
    font-size: 14px;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
