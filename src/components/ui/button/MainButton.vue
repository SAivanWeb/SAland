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
  color?: 'yellow' | 'red' | 'green' | 'purple' | 'orange'
  size?: 'small' | 'large'
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
  @include body-1-bold;
  color: $text-dark;
  border: 2px solid $border;
  border-radius: $border-radius;
  -webkit-box-shadow: 2px 4px 0px $border;
  -moz-box-shadow: 2px 4px 0px $border;
  box-shadow: 1px 2px 0px $border;
  white-space: nowrap;

  &:not(.button_disabled):active {
    -webkit-box-shadow: 0px 0px 0px $border;
    -moz-box-shadow: 0px 0px 0px $border;
    box-shadow: 0px 0px 0px $border;
    transform: translate(1px, 2px);
  }

  &_large{
    padding: 12px 20px;
  }

  &_medium{
    padding: 10px 16px;
  }

  &_small{
    padding: 6px 12px;
  }

  &_yellow {
    background-color: $primary-yellow;
  }
  &_green {
    background-color: $primary-green;
  }

  &_disabled{
    cursor: not-allowed;
  }
}
</style>
