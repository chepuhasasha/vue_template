<template lang="pug">
section.home-view(v-testid="'home-root'")
  div.home-view__card(v-testid="'home-card'")
    header.home-view__header(v-testid="'home-header'")
      h1.home-view__title(v-testid="'home-title'") {{ t('home.title') }}
      p.home-view__subtitle(v-testid="'home-subtitle'") {{ t('home.subtitle') }}
    dl.home-view__details(v-testid="'home-details'")
      div.home-view__detail(v-testid="'home-session'")
        dt.home-view__label(v-testid="'home-session-label'") {{ t('home.sessionLabel') }}
        dd.home-view__value(v-testid="'home-session-value'") {{ sessionValue }}
    div.home-view__actions(v-testid="'home-actions'")
      UIButton(
        variant="secondary"
        @click="onLogout"
        v-testid="'home-logout'"
      ) {{ t('home.logout') }}
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useI18n } from '@/composables'
import { clearSessionId, getSessionId } from '@/services'
import { ROUTE_NAME_LOGIN } from '@/router/constants'

const EMPTY_LENGTH = 0

const router = useRouter()
const { t } = useI18n()

const sessionId = ref(getSessionId())
const hasSessionId = computed(() => sessionId.value.length > EMPTY_LENGTH)
const sessionValue = computed(() =>
  hasSessionId.value ? sessionId.value : t('home.sessionMissing'),
)

/**
 * Завершает пользовательскую сессию и возвращает на страницу входа.
 * @returns Ничего не возвращает.
 */
const onLogout = () => {
  clearSessionId()
  sessionId.value = ''
  router.replace({ name: ROUTE_NAME_LOGIN })
}
</script>

<style scoped lang="scss">
.home-view {
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
    width: min(560px, 100%);
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__title {
    font-size: 28px;
    font-weight: 700;
  }

  &__subtitle {
    color: var(--txt-color-l2);
    font-size: 14px;
  }

  &__details {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__detail {
    display: grid;
    grid-template-columns: 160px 1fr;
    gap: 12px;
    align-items: center;
  }

  &__label {
    color: var(--txt-color-l2);
    font-size: 13px;
  }

  &__value {
    font-weight: 600;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
