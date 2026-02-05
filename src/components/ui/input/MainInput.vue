<template>
  <div class="input">
    <label v-if="label" :for="name">{{ label }}</label>
    <input
      class="input__field"
      v-model="localValue"
      :name="name"
      :placeholder="placeholder"
      :type="fieldType"
    />
  </div>
</template>

<script setup lang="ts">
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
  gap: 4px;
  width: 100%;

  & label {
    @include body-1;
    color: $text-dark;
  }

  &__field {
    @include body-1;
    padding: 12px 20px;
    border: 2px solid $border;
    border-radius: $border-radius;
    box-shadow: $box-shadow;
    transition: 0.2s;

    &:hover{
      border-color: $text-dark;
    }

    &:focus-visible {
      border-color: $text-dark;
    }
  }

  &:focus-within label {
    color: $text-dark;
  }
}
</style>
