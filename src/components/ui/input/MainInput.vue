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

<style scoped lang="scss">
.input {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;

  label {
    font-size: 14px;
    font-weight: 500;
    color: $text-secondary;
    transition: color 0.2s ease;
  }

  &:focus-within label {
    color: $primary;
  }
}
</style>
