<template lang="pug">
section.login-view(v-testid="'login-root'")
  div.login-view__card(v-testid="'login-card'")
    header.login-view__header(v-testid="'login-header'")
      h1.login-view__title(v-testid="'login-title'") {{ t('login.title') }}
      p.login-view__subtitle(v-testid="'login-subtitle'")
        | {{ t('login.subtitle') }}
    form.login-view__form(@submit.prevent="onSubmit" v-testid="'login-form'")
      div.login-view__field(v-testid="'login-login-field'")
        UIInput(
          v-model="login"
          name="login"
          :label="t('login.loginLabel')"
          :placeholder="t('login.loginPlaceholder')"
          icon="user-01"
          v-testid="{ id: 'login', suffix: 'login-input' }"
        )
      div.login-view__field(v-testid="'login-password-field'")
        UIInput(
          v-model="password"
          name="password"
          :type="passwordInputType"
          :label="t('login.passwordLabel')"
          :placeholder="t('login.passwordPlaceholder')"
          icon="key-01"
          v-testid="{ id: 'login', suffix: 'password-input' }"
        )
          template(#end)
            UIButton.login-view__password-toggle(
              type="button"
              variant="ghost"
              :aria-label="passwordToggleLabel"
              :aria-pressed="isPasswordVisible"
              @click="togglePasswordVisibility"
              v-testid="{ id: 'login', suffix: 'password-toggle' }"
            )
              template(#start)
                UIIcon(:name="passwordToggleIcon" size='s')
      div.login-view__actions(v-testid="'login-actions'")
        UIButton(
          type="submit"
          block
          size='l'
          :disabled="isSubmitDisabled"
          :loading="isLoading"
          v-testid="{ id: 'login', suffix: 'submit' }"
        ) {{ t('login.submit') }}
    p.login-view__hint(v-testid="'login-hint'")
      | {{ t('login.hint') }}
    p.login-view__error(v-if="errorMessage" v-testid="'login-error'" role="alert") {{ errorMessage }}
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useI18n } from '@/composables'
import type { TranslationKey } from '@/locales'
import {
  AUTH_ERROR_INVALID_CREDENTIALS,
  getSessionId,
  isAuthError,
  login as loginRequest,
  saveSessionId,
} from '@/services'
import { ROUTE_NAME_HOME } from '@/router/constants'

const MIN_LOGIN_LENGTH = 1
const MIN_PASSWORD_LENGTH = 1
const EMPTY_LENGTH = 0
const EMPTY_VALUE = ''
const REDIRECT_QUERY_KEY = 'redirect'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const login = ref('')
const password = ref('')
const isPasswordVisible = ref(false)
const isLoading = ref(false)
const errorKey = ref<TranslationKey | null>(null)

const normalizedLogin = computed(() => login.value.trim())
const normalizedPassword = computed(() => password.value.trim())
const errorMessage = computed(() => (errorKey.value ? t(errorKey.value) : ''))
const passwordInputType = computed(() => (isPasswordVisible.value ? 'text' : 'password'))
const passwordToggleIcon = computed(() => (isPasswordVisible.value ? 'eye-off' : 'eye'))
const passwordToggleLabel = computed(() =>
  t(isPasswordVisible.value ? 'login.hidePassword' : 'login.showPassword'),
)
const isSubmitDisabled = computed(
  () =>
    normalizedLogin.value.length < MIN_LOGIN_LENGTH ||
    normalizedPassword.value.length < MIN_PASSWORD_LENGTH,
)

/**
 * Возвращает ключ перевода для ошибки авторизации.
 * @param error Ошибка, полученная при попытке авторизации.
 * @returns Ключ перевода для отображения пользователю.
 */
const getErrorKey = (error: unknown): TranslationKey => {
  if (isAuthError(error)) {
    if (error.code === AUTH_ERROR_INVALID_CREDENTIALS) {
      return 'auth.invalidCredentials'
    }
  }

  return 'auth.unknownError'
}

/**
 * Переключает видимость значения пароля в поле ввода.
 * @returns Ничего не возвращает.
 */
const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}

/**
 * Определяет путь редиректа после успешной авторизации.
 * @returns Строка пути для редиректа или пустую строку, если путь не задан.
 */
const resolveRedirectTarget = (): string => {
  const redirectTarget = route.query[REDIRECT_QUERY_KEY]

  if (typeof redirectTarget !== 'string') {
    return EMPTY_VALUE
  }

  const normalizedTarget = redirectTarget.trim()

  return normalizedTarget.length > EMPTY_LENGTH ? normalizedTarget : EMPTY_VALUE
}

/**
 * Перенаправляет пользователя на домашнюю страницу.
 * @returns Промис, завершающийся после завершения навигации.
 */
const redirectToHome = () => router.replace({ name: ROUTE_NAME_HOME })

/**
 * Выполняет редирект на целевую страницу после авторизации.
 * @returns Промис, завершающийся после завершения навигации.
 */
const redirectAfterLogin = async (): Promise<void> => {
  const redirectTarget = resolveRedirectTarget()

  if (redirectTarget) {
    await router.replace(redirectTarget)
    return
  }

  await redirectToHome()
}

/**
 * Проверяет наличие активной сессии и выполняет редирект при необходимости.
 * @returns Промис, завершающийся после выполнения навигации.
 */
const redirectIfAuthenticated = async (): Promise<void> => {
  if (!getSessionId()) {
    return
  }

  await redirectAfterLogin()
}

/**
 * Обрабатывает отправку формы входа.
 * Не принимает параметры.
 * @returns Промис, завершающийся после обработки авторизации.
 */
const onSubmit = async () => {
  if (isSubmitDisabled.value || isLoading.value) {
    return
  }

  isLoading.value = true
  errorKey.value = null

  try {
    const session = await loginRequest({
      login: normalizedLogin.value,
      password: normalizedPassword.value,
    })

    saveSessionId(session.sid)
    await redirectAfterLogin()
  } catch (error) {
    errorKey.value = getErrorKey(error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void redirectIfAuthenticated()
})
</script>

<style scoped lang="scss">
.login-view {
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
    width: min(420px, 100%);
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

  &__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__actions {
    display: flex;
  }

  &__hint {
    color: var(--txt-color-l2);
    font-size: 13px;
  }

  &__error {
    color: var(--error);
    font-size: 13px;
  }
}
</style>
