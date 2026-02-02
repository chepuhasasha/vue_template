<template lang="pug">
button.ui-button(
  :class="classes"
  :type="type"
  :disabled="isDisabled"
  :data-testid="testid"
  :aria-busy="loading || undefined"
  :aria-disabled="isDisabled || undefined"
)
  span.ui-button__content
    slot(name="start")
    span.ui-button__label(v-if="hasDefaultSlot")
      slot
    slot(name="end")
  span.ui-button__loader(v-if="loading" aria-hidden="true")
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

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
    testid?: string
  }>(),
  {
    variant: 'primary',
    size: 'm',
    type: 'button',
    rounded: true,
    block: false,
    disabled: false,
    loading: false,
    testid: undefined,
  },
)

/**
 * Возвращает количество узлов указанного слота.
 */
const getSlotCount = (name: string) => (slots[name]?.() ?? []).length

/**
 * Проверяет наличие слота по имени.
 */
const hasSlot = (name: string) => getSlotCount(name) > 0

const hasDefaultSlot = computed(() => (slots.default?.() ?? []).length > 0)
const isDisabled = computed(() => props.disabled || props.loading)

/**
 * Возвращает список классов для кнопки по состояниям и пропсам.
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
    padding: 6px 12px;
    font-size: 12px;
  }

  &--m {
    padding: 10px 16px;
    font-size: 14px;
  }

  &--l {
    padding: 14px 22px;
    font-size: 16px;
  }

  &--icon-only {
    padding: 8px;
  }
}

@keyframes ui-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
