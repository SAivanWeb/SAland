<template>
  <div class="input">
    <label v-if="label" :for="name">{{ label }}</label>
    <n-input v-model:value="localValue" :name="name" :placeholder="placeholder" :type="fieldType" :size="size"/>
  </div>
</template>

<script setup lang="ts">
import { NInput } from 'naive-ui'
import { ref, watch } from 'vue'

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
interface Props {
  name: string
  placeholder: string
  label?: string
  modelValue: string
  size?: 'small' | 'medium' | 'large'
  fieldType?: 'text' | 'password'
}
const props = withDefaults(defineProps<Props>(), {
  size: 'large',
  fieldType: 'text',
})

const localValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== localValue.value) {
      localValue.value = newVal
    }
  },
)

watch(localValue, (val) => {
  emit('update:modelValue', val)
})
</script>

<style scoped>
.input {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}
</style>
