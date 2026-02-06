<template lang="pug">
button.ui-button(
  v-if="!hasExternalTestId"
  v-testid="{ id: 'ui-button', suffix: 'root' }"
  :class="classes"
  :type="type"
  :disabled="isDisabled"
  :aria-busy="loading || undefined"
  :aria-disabled="isDisabled || undefined"
)
  span.ui-button__content(v-if="!loading" v-testid="{ id: 'ui-button', suffix: 'content' }")
    slot(name="start")
    span.ui-button__label(v-if="hasDefaultSlot" v-testid="{ id: 'ui-button', suffix: 'label' }")
      slot
    slot(name="end")
  span.ui-button__loader(
    v-else
    v-testid="{ id: 'ui-button', suffix: 'loader' }"
    aria-hidden="true"
  )
button.ui-button(
  v-else
  :class="classes"
  :type="type"
  :disabled="isDisabled"
  :aria-busy="loading || undefined"
  :aria-disabled="isDisabled || undefined"
)
  span.ui-button__content(v-if="!loading" v-testid="{ id: 'ui-button', suffix: 'content' }")
    slot(name="start")
    span.ui-button__label(v-if="hasDefaultSlot" v-testid="{ id: 'ui-button', suffix: 'label' }")
      slot
    slot(name="end")
  span.ui-button__loader(
    v-else
    v-testid="{ id: 'ui-button', suffix: 'loader' }"
    aria-hidden="true"
  )
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { useHasExternalTestId } from '@/plugins'

type UIButtonVariant = 'primary' | 'secondary' | 'ghost'
type UIButtonSize = 's' | 'm' | 'l'
type UIButtonType = 'button' | 'submit' | 'reset'

const slots = useSlots()

const props = withDefaults(
  defineProps<{
    variant?: UIButtonVariant
    size?: UIButtonSize
    type?: UIButtonType
    rounded?: boolean
    block?: boolean
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'm',
    type: 'button',
    rounded: false,
    block: false,
    disabled: false,
    loading: false,
  },
)

const hasExternalTestId = useHasExternalTestId()

/**
 * Возвращает количество узлов указанного слота.
 * @param name Имя слота.
 * @returns Количество узлов в слоте.
 */
const getSlotCount = (name: string) => (slots[name]?.() ?? []).length

/**
 * Проверяет наличие слота по имени.
 * @param name Имя слота.
 * @returns Есть ли узлы в слоте.
 */
const hasSlot = (name: string) => getSlotCount(name) > 0

const hasDefaultSlot = computed(() => (slots.default?.() ?? []).length > 0)
const isDisabled = computed(() => props.disabled || props.loading)

/**
 * Возвращает список классов для кнопки по состояниям и пропсам.
 * @returns Объект CSS-классов кнопки.
 */
const getButtonClasses = () => ({
  'ui-button--rounded': props.rounded,
  'ui-button--block': props.block,
  'ui-button--loading': props.loading,
  [`ui-button--${props.variant}`]: props.variant,
  [`ui-button--${props.size}`]: props.size,
  'ui-button--icon-only': hasSlot('start') && !hasDefaultSlot.value && !hasSlot('end'),
})

const classes = computed(() => getButtonClasses())
</script>

<style lang="scss">
.ui-button {
  --ui-button-height: var(--ui-size-m);
  --ui-button-padding-x: 16px;

  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    opacity 0.2s ease,
    transform 0.2s ease;
  border: 1px solid transparent;
  cursor: pointer;
  padding: 0 var(--ui-button-padding-x);
  height: var(--ui-button-height);
  line-height: 1;
  font-weight: 600;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &__content {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }

  &__label {
    line-height: 1;
  }

  &__loader {
    border: 2px solid currentcolor;
    border-radius: 50%;
    border-right-color: transparent;
    width: 16px;
    height: 16px;
    animation: ui-button-spin 0.8s linear infinite;
  }

  &--primary {
    background: var(--accent-color);
    color: var(--accent-foreground-color);
  }

  &--secondary {
    background: var(--bg-color-l3);
    color: var(--txt-color-l1);
  }

  &--ghost {
    border-color: var(--bdr-color);
    background: transparent;
    color: var(--txt-color-l1);
  }

  &--rounded {
    border-radius: 999px;
  }

  &--block {
    width: 100%;
  }

  &--s {
    --ui-button-height: var(--ui-size-s);
    --ui-button-padding-x: 12px;

    font-size: 12px;
  }

  &--m {
    --ui-button-height: var(--ui-size-m);
    --ui-button-padding-x: 16px;

    font-size: 14px;
  }

  &--l {
    --ui-button-height: var(--ui-size-l);
    --ui-button-padding-x: 22px;

    font-size: 16px;
  }

  &--icon-only {
    padding: 0;
    width: var(--ui-button-height);
  }
}

@keyframes ui-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
