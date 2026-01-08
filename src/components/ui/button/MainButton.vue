<template>
  <n-button type="info" :size="size" @click="onClick">{{ title }}</n-button>
</template>

<script setup lang="ts">
import { NButton } from 'naive-ui'

const emit = defineEmits<{
  (e: 'click'): void
}>()

interface Props {
  title: string
  size: 'small' | 'medium' | 'large'
}
const props = defineProps<Props>()

const onClick = () => {
  emit('click')
}
</script>

<style scoped></style>
