<template lang="pug">
button.button(
  :class="classes"
  :data-testid="testid"
)
  .button_text(:data-testid="`${testid}_text`")
    slot
  template(v-if="hasEnd")
    slot(name="end")
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const slots = useSlots()

const {
  accent = false,
  rounded = false,
  size = 'm',
} = defineProps<{
  accent?: boolean
  rounded?: boolean
  size?: 's' | 'm' | 'l'
  testid: string
}>()

const hasEnd = computed(() => (slots.end?.() ?? []).length > 0)

const classes = computed(() => ({
  'button--accent': accent,
  'button--rect': !rounded,
  'button--has-end': hasEnd.value,
  [`button--${size}`]: size,
}))
</script>

<style lang="scss">
@mixin size($size, $padding, $gap, $radius: 0) {
  gap: $gap;
  border-radius: $radius;
  padding: $padding;
  font-size: $size;
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: var(--bg-color-l3);
  cursor: pointer;
  color: var(--txt-color-l1);

  &:hover,
  &--accent {
    background: var(--accent-color);
    color: var(--accent-foreground-color);
  }

  &--accent:hover {
    // TODO
  }

  &--has-end {
    justify-content: space-between;
  }

  &--rect {
    border-radius: 0 !important;
  }

  &--s {
    @include size(10px, 4px, 4px, 2px);
  }

  &--m {
    @include size(12px, 10px, 10px, 10px);
  }

  &--l {
    @include size(14px, 20px 40px, 20px, 20px);
  }
}
</style>
