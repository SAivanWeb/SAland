<template>
  <n-button type="info" :size="size">{{ title }}</n-button>
</template>

<script setup lang="ts">
import { NButton} from 'naive-ui'

interface Props {
  title: string
  size: string
}
const props = defineProps<Props>()

</script>

<style scoped></style>
