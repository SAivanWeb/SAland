<template>
  <n-modal v-model:show="innerShow" :style="{ width: modalWidth ? modalWidth : '' }" block-scroll>
    <div class="modal">
      <div class="modal__header">
        <slot name="header" />
        <n-icon size="24" class="modal__close" @click="innerShow = false">
          <Close />
        </n-icon>
      </div>
      <div class="modal__body">
        <slot name="body" />
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NModal, NIcon } from 'naive-ui'
import Close from '@/assets/icons/close.vue'

interface ModalContainerProps {
  show: boolean
  modalWidth?: string
}

const props = defineProps<ModalContainerProps>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()

const innerShow = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})
</script>

<style lang="scss">
.modal {
  background-color: #fff;
  border-radius: 8px;
  border: 2px solid $border;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid $border;
  }

  &__close {
    cursor: pointer;
    color: $text-dark;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__search {
    display: flex;
    gap: 12px;
  }

  &__users {
    display: flex;
    gap: 12px;
  }

  &__not-found {
    text-align: center;
    font-style: italic;
  }

  &__stat {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    &-item {
      width: 100%;
      padding: 8px;
      border: 2px solid $border;
      border-radius: $border-radius;
      background-color: $primary-yellow;
      display: flex;
      flex-direction: column;
      gap: 8px;
      @include body-2;
      -webkit-box-shadow: 2px 4px 0px $border;
      -moz-box-shadow: 2px 4px 0px $border;
      box-shadow: 1px 2px 0px $border;

      & span {
        @include body-1-bold;
        text-align: center;
      }
    }
  }
}
</style>
