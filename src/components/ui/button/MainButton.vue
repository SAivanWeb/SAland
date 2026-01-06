<template>
  <n-button>{{ title }}</n-button>
</template>

<script setup lang="ts">
import { NButton} from 'naive-ui'

interface Props {
  title: string
}
const props = defineProps<Props>()

</script>

<style scoped></style>
