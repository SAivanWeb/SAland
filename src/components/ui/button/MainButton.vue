<template>
  <n-button
    :type="variant"
    :size="size"
    :disabled="disabled"
    :attr-type="attrType"
    :class="['main-button', { 'main-button--glow': glow }]"
    @click="onClick"
  >
    {{ title }}
  </n-button>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'

const emit = defineEmits<{
  (e: 'click'): void
}>()

interface Props {
  title: string
  size: 'small' | 'medium' | 'large'
  disabled?: boolean
  attrType?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'info' | 'success' | 'warning' | 'error' | 'default'
  glow?: boolean
}

withDefaults(defineProps<Props>(), {
  attrType: 'button',
  variant: 'warning',
  glow: true,
})

const onClick = () => {
  emit('click')
}
</script>

<style scoped lang="scss">
.main-button {
  font-weight: 600;
  transition: all 0.2s ease;

  &--glow {
    box-shadow: 0 4px 15px $primary-glow;

    &:hover {
      box-shadow: 0 6px 25px $primary-glow;
    }
  }
}
</style>
