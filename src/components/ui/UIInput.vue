<template lang="pug">
div.ui-input(:class="classes" :data-testid="testid")
  label.ui-input__label(v-if="label" :for="resolvedId") {{ label }}
  div.ui-input__field
    input.ui-input__control(
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
  p.ui-input__hint(v-if="hint" :id="hintId") {{ hint }}
  p.ui-input__error(v-if="error" :id="errorId") {{ error }}
</template>

<script setup lang="ts">
import { computed } from 'vue'

type UIInputType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number'
type UIInputSize = 's' | 'm' | 'l'

let inputIdCounter = 0

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    label?: string
    placeholder?: string
    name?: string
    type?: UIInputType
    size?: UIInputSize
    disabled?: boolean
    readonly?: boolean
    required?: boolean
    error?: string
    hint?: string
    id?: string
    testid?: string
  }>(),
  {
    modelValue: '',
    label: undefined,
    placeholder: undefined,
    name: undefined,
    type: 'text',
    size: 'm',
    disabled: false,
    readonly: false,
    required: false,
    error: undefined,
    hint: undefined,
    id: undefined,
    testid: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur', value: string): void
}>()

/**
 * Возвращает новый уникальный идентификатор для инпута.
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
 */
const getInputValue = (event: Event) => (event.target as HTMLInputElement).value

/**
 * Обрабатывает ввод текста и эмитит обновление значения.
 */
const onInput = (event: Event) => {
  emit('update:modelValue', getInputValue(event))
}

/**
 * Обрабатывает уход фокуса и эмитит событие blur.
 */
const onBlur = (event: Event) => {
  emit('blur', getInputValue(event))
}

/**
 * Возвращает классы инпута на основе размера и статуса.
 */
const getInputClasses = () => ({
  'ui-input--disabled': props.disabled,
  'ui-input--error': Boolean(props.error),
  [`ui-input--${props.size}`]: props.size,
})

const classes = computed(() => getInputClasses())
const describedBy = computed(
  () => [hintId.value, errorId.value].filter(Boolean).join(' ') || undefined,
)
</script>

<style lang="scss">
.ui-input {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--txt-color-l1);

  &__label {
    font-size: 13px;
    font-weight: 600;
  }

  &__field {
    display: flex;
    gap: 8px;
    align-items: center;
    transition: border-color 0.2s ease;
    border: 1px solid var(--bdr-color);
    border-radius: 12px;
    background: var(--bg-color-l1);
    padding: 0 12px;

    &:focus-within {
      border-color: var(--accent-color);
    }
  }

  &__control {
    outline: none;
    border: none;
    background: transparent;
    padding: 10px 0;
    width: 100%;
    color: inherit;
    font-size: 14px;
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

  &--s &__control {
    padding: 6px 0;
    font-size: 12px;
  }

  &--l &__control {
    padding: 14px 0;
    font-size: 16px;
  }
}
</style>
