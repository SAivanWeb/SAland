<template></template>

<script setup lang="ts">
import { watch } from 'vue'
import { useNotification } from 'naive-ui'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'

const messageApi = useNotification()
const store = useProcessingStore()

watch(
  () => [store.message.type, store.message.title, store.message.message] as const,
  ([type, title, text]) => {
    if (!text) return

    const options = {
      title: title,
      description: text,
      duration: 2500,
      keepAliveOnHover: true,
      class: `notify--${type}`,
    }

    if (type === 'success') messageApi.success(options)
    else if (type === 'error') messageApi.error(options)
    else if (type === 'warning') messageApi.warning(options)
    else messageApi.info(options)

    store.clearMessage()
  },
)
</script>

<style lang="scss">
.n-notification-wrapper {
  & .n-notification {
    border: 2px solid $border;
    box-shadow: $box-shadow;
    border-radius: $border-radius;
  }

  &.notify--info .n-notification {
    background-color: #fff;

    & .n-notification-main .n-notification-main__header {
      color: $text-dark !important;
    }

    & .n-notification__close {
      color: $text-dark !important;
    }

    & .n-notification-main__description {
      color: $text-dark !important;
    }
  }

  & .n-notification-main .n-notification-main__header {
    color: $text-dark !important;
    font-size: 18px !important;
    font-weight: bold !important;
  }

  & .n-notification__close {
    color: $text-dark !important;
  }

  & .n-notification-main__description {
    font-size: 16px !important;
    color: $text-dark !important;
  }
}
</style>
