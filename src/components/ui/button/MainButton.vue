<template>
  <button :type="attrType" :disabled="disabled" class="button" :class="classes" @click="onClick">
    {{ title }}
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const emit = defineEmits<{
  (e: 'click'): void
}>()

interface Props {
  title: string
  disabled?: boolean
  attrType?: 'button' | 'submit' | 'reset'
  color?: 'yellow' | 'red' | 'green' | 'purple' | 'orange' | 'blue'
  size?: 'small' | 'large' | 'medium'
}

const props = withDefaults(defineProps<Props>(), {
  attrType: 'button',
  color: 'yellow',
  size: 'large',
})

const onClick = () => {
  emit('click')
}

const classes = computed(() => {
  const classes = []
  if (props.color) {
    classes.push(`button_${props.color}`)
  }
  if (props.size) {
    classes.push(`button_${props.size}`)
  }
  if (props.disabled) {
    classes.push(`button_disabled`)
  }
  return classes
})
</script>

<style scoped lang="scss">
.button {
  color: $text-dark;
  border: 2px solid $border;
  border-radius: $border-radius;
  box-shadow: $box-shadow;
  white-space: nowrap;
  height: fit-content;

  &:not(.button_disabled):active {
    -webkit-box-shadow: 0px 0px 0px $border;
    -moz-box-shadow: 0px 0px 0px $border;
    box-shadow: 0px 0px 0px $border;
    transform: translate(1px, 2px);
  }

  &_large {
    padding: 12px 20px;
    @include body-1-bold;
  }

  &_medium {
    padding: 10px 16px;
    @include body-1-bold;
  }

  &_small {
    padding: 6px 12px;
    @include body-2-bold;
  }

  &_yellow {
    background-color: $primary-yellow;
  }
  &_green {
    background-color: $primary-green;
  }
  &_red {
    background-color: $primary-red;
  }
  &_purple {
    background-color: $primary-purple;
  }
  &_blue {
    background-color: $primary-blue;
  }

  &_disabled {
    cursor: not-allowed;
  }
}
</style>
