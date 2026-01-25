<template>
  <n-button
    type="info"
    :size="size"
    :disabled="disabled"
    :attr-type="attrType"
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
}

withDefaults(defineProps<Props>(), {
  attrType: 'button',
})

const onClick = () => {
  emit('click')
}
</script>

<style scoped></style>
