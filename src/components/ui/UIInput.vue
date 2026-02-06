<template lang="pug">
div.ui-input(
  v-if="!hasExternalTestId"
  v-testid="{ id: 'ui-input', suffix: 'root' }"
  :class="classes"
)
  label.ui-input__label(
    v-if="label"
    v-testid="{ id: 'ui-input', suffix: 'label' }"
    :for="resolvedId"
  ) {{ label }}
  div.ui-input__field(
    v-testid="{ id: 'ui-input', suffix: 'field' }"
    :class="fieldClasses"
  )
    div.ui-input__row(v-testid="{ id: 'ui-input', suffix: 'row' }")
      UIIcon.ui-input__icon(
        v-if="icon"
        v-testid="{ id: 'ui-input', suffix: 'icon' }"
        :name="icon"
        :size="iconSize"
      )
      input.ui-input__control(
        v-testid="{ id: 'ui-input', suffix: 'control' }"
        :class="controlClasses"
        :id="resolvedId"
        :name="name"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-invalid="Boolean(error) || undefined"
        :aria-describedby="describedBy"
        @input="onInput"
        @blur="onBlur"
      )
      slot(name="end")
  div.ui-input__meta(v-if="hint || error")
    p.ui-input__hint(
      v-if="hint"
      v-testid="{ id: 'ui-input', suffix: 'hint' }"
      :id="hintId"
    ) {{ hint }}
    p.ui-input__error(
      v-if="error"
      v-testid="{ id: 'ui-input', suffix: 'error' }"
      :id="errorId"
    ) {{ error }}
div.ui-input(
  v-else
  :class="classes"
)
  label.ui-input__label(
    v-if="label"
    v-testid="{ id: 'ui-input', suffix: 'label' }"
    :for="resolvedId"
  ) {{ label }}
  div.ui-input__field(
    v-testid="{ id: 'ui-input', suffix: 'field' }"
    :class="fieldClasses"
  )
    div.ui-input__row(v-testid="{ id: 'ui-input', suffix: 'row' }")
      UIIcon.ui-input__icon(
        v-if="icon"
        v-testid="{ id: 'ui-input', suffix: 'icon' }"
        :name="icon"
        :size="iconSize"
      )
      input.ui-input__control(
        v-testid="{ id: 'ui-input', suffix: 'control' }"
        :class="controlClasses"
        :id="resolvedId"
        :name="name"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-invalid="Boolean(error) || undefined"
        :aria-describedby="describedBy"
        @input="onInput"
        @blur="onBlur"
      )
      slot(name="end")
  div.ui-input__meta(v-if="hint || error")
    p.ui-input__hint(
      v-if="hint"
      v-testid="{ id: 'ui-input', suffix: 'hint' }"
      :id="hintId"
    ) {{ hint }}
    p.ui-input__error(
      v-if="error"
      v-testid="{ id: 'ui-input', suffix: 'error' }"
      :id="errorId"
    ) {{ error }}
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { useHasExternalTestId } from '@/plugins'

type UIInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number'
type UIInputSize = 's' | 'm' | 'l'
type UIInputLayout = 'vertical' | 'horizontal'

let inputIdCounter = 0

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    label?: string
    placeholder?: string
    name?: string
    type?: UIInputType
    size?: UIInputSize
    layout?: UIInputLayout
    icon?: string
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    error?: string
    hint?: string
    id?: string
  }>(),
  {
    modelValue: '',
    label: undefined,
    placeholder: undefined,
    name: undefined,
    type: 'text',
    size: 'm',
    layout: 'vertical',
    icon: undefined,
    disabled: false,
    readonly: false,
    required: false,
    error: undefined,
    hint: undefined,
    id: undefined,
  },
)

const slots = useSlots()
const hasExternalTestId = useHasExternalTestId()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur', value: string): void
}>()

/**
 * Возвращает новый уникальный идентификатор для инпута.
 * @returns Сгенерированный идентификатор.
 */
const getNextInputId = () => {
  inputIdCounter += 1
  return `ui-input-${inputIdCounter}`
}

const generatedId = getNextInputId()
const resolvedId = computed(() => props.id ?? generatedId)
const hintId = computed(() => (props.hint ? `${resolvedId.value}-hint` : undefined))
const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))

/**
 * Возвращает значение инпута из события.
 * @param event Событие input или blur.
 * @returns Текущее значение инпута.
 */
const getInputValue = (event: Event) => (event.target as HTMLInputElement).value

/**
 * Обрабатывает ввод текста и эмитит обновление значения.
 * @param event Событие ввода.
 */
const onInput = (event: Event) => {
  emit('update:modelValue', getInputValue(event))
}

/**
 * Обрабатывает уход фокуса и эмитит событие blur.
 * @param event Событие blur.
 */
const onBlur = (event: Event) => {
  emit('blur', getInputValue(event))
}

/**
 * Возвращает классы инпута на основе размера и статуса.
 * @returns Объект CSS-классов инпута.
 */
const getInputClasses = () => ({
  'ui-input--disabled': props.disabled,
  'ui-input--error': Boolean(props.error),
  [`ui-input--${props.size}`]: props.size,
  [`ui-input--${props.layout}`]: props.layout,
})

const classes = computed(() => getInputClasses())
const describedBy = computed(
  () => [hintId.value, errorId.value].filter(Boolean).join(' ') || undefined,
)
const hasEndSlot = computed(() => (slots.end?.() ?? []).length > 0)
const fieldClasses = computed(() => ({
  'ui-input__field--with-end': hasEndSlot.value,
}))
const controlClasses = computed(() => ({
  'ui-input__control--with-end': hasEndSlot.value,
}))
const iconSize = computed(() => (props.size === 'l' ? 'm' : 's'))
</script>

<style lang="scss">
.ui-input {
  --ui-input-height: var(--ui-size-m);
  --ui-input-padding-x: 12px;
  --ui-input-row-gap: 8px;

  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--txt-color-l1);

  &__label {
    line-height: 1;
    color: var(--txt-color-l1);
    font-size: 13px;
    font-weight: 600;
  }

  &__field {
    display: flex;
    align-items: center;
    transition: border-color 0.2s ease;
    border: 1px solid var(--bdr-color);
    background: var(--bg-color-l1);
    padding: 0 var(--ui-input-padding-x);
    min-width: 0;
    height: var(--ui-input-height);

    &:focus-within {
      border-color: var(--accent-color);
    }
  }

  &__field--with-end {
    padding-right: 0;
  }

  &__row {
    display: flex;
    gap: var(--ui-input-row-gap);
    align-items: center;
    width: 100%;
    height: 100%;
  }

  &__icon {
    flex: 0 0 auto;
    color: var(--txt-color-l2);
  }

  &__control {
    flex: 1 1 auto;
    outline: none;
    border: none;
    background: transparent;
    padding: 0;
    width: 100%;
    min-width: 0;
    height: 100%;
    line-height: var(--ui-input-height);
    color: inherit;
    font-size: 14px;
  }

  &__control--with-end {
    padding-right: calc(var(--ui-input-padding-x) - var(--ui-input-row-gap));
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__hint {
    color: var(--txt-color-l2);
    font-size: 12px;
  }

  &__error {
    color: var(--error);
    font-size: 12px;
  }

  &--error &__field {
    border-color: var(--error);
  }

  &--disabled {
    opacity: 0.6;
  }

  &--horizontal {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 0 12px;
    align-items: center;
  }

  &--horizontal &__meta {
    align-items: flex-end;
    justify-self: end;
    text-align: right;
  }

  &--s &__field {
    --ui-input-padding-x: 10px;
    --ui-input-height: var(--ui-size-s);
  }

  &--s &__control {
    font-size: 12px;
  }

  &--l &__field {
    --ui-input-padding-x: 14px;
    --ui-input-height: var(--ui-size-l);
  }

  &--l &__control {
    font-size: 16px;
  }
}
</style>
