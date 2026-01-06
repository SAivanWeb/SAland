<template>
  <div class="input">
    <label :for="name">{{label}}</label>
    <n-input
      :name="name"
      :placeholder="placeholder"
    />
  </div>
</template>

<script setup lang="ts">
import { NInput } from 'naive-ui'

interface Props {
  name: string
  placeholder: string
  label: string
}
const props = defineProps<Props>()
</script>

<style scoped>
.input{
  display: flex;
  flex-direction: column;
}
</style>
