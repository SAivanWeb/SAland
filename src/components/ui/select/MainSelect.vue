<template>
  <div class="select">
    <label v-if="label" :for="name">{{ label }}</label>
    <div
      class="select__field"
      :class="{ 'select__field--open': isOpen }"
      @click="toggleDropdown"
      ref="selectRef"
    >
      <span v-if="selectedLabel" class="select__value">{{ selectedLabel }}</span>
      <span v-else class="select__placeholder">{{ placeholder }}</span>
      <div class="select__arrow" :class="{ 'select__arrow--open': isOpen }">
        <n-icon size="28">
          <Arrow />
        </n-icon>
      </div>
    </div>
    <Transition name="dropdown">
      <div v-if="isOpen" class="select__dropdown">
        <div
          v-for="option in options"
          :key="option.value ?? 'null'"
          class="select__option"
          :class="{ 'select__option--selected': option.value === modelValue }"
          @click="selectOption(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { NIcon } from 'naive-ui'
import Arrow from '@/assets/icons/arrow.vue'

type OptionValue = string | number | null

interface Option {
  label: string
  value: OptionValue
}

interface Props {
  name: string
  placeholder: string
  label?: string
  modelValue: OptionValue | undefined
  options: Option[]
  size?: 'small' | 'medium' | 'large'
}

const emit = defineEmits<{
  (e: 'update:modelValue', value: OptionValue): void
}>()

const props = withDefaults(defineProps<Props>(), {
  size: 'large',
})

const isOpen = ref(false)
const selectRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
  const selected = props.options.find((opt) => opt.value === props.modelValue)
  return selected?.label || ''
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (option: Option) => {
  emit('update:modelValue', option.value)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.select {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  position: relative;

  & label {
    @include body-1;
    color: $text-dark;
  }

  &__field {
    padding: 7px 20px;
    border: 2px solid $border;
    border-radius: $border-radius;
    box-shadow: $box-shadow;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    position: relative;
    user-select: none;

    &--open {
      border-color: $text-dark;
    }
  }

  &__value {
    @include body-1;
    color: $text-dark;
  }

  &__placeholder {
    @include body-1;
    color: #999;
  }

  &__arrow {
    color: $text-dark;
    transition: transform 0.2s ease;
    display: flex;
    align-items: center;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__dropdown {
    position: absolute;
    top: 105%;
    left: 0;
    width: 100%;
    z-index: 1000;
    background: #fff;
    border: 2px solid $border;
    border-radius: $border-radius;
    box-shadow: $box-shadow;
    margin-top: 4px;
    max-height: 200px;
    overflow-y: auto;
  }

  &__option {
    padding: 12px 20px;
    cursor: pointer;
    @include body-1;
    color: $text-dark;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: $primary-yellow;
    }

    &--selected {
      background-color: $primary-green;
      font-weight: 600;
    }
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
