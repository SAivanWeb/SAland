<template></template>

<script setup lang="ts">
import { h, watch } from 'vue'
import { NButton, useNotification } from 'naive-ui'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import MainButton from '@/components/ui/button/MainButton.vue'

const messageApi = useNotification()
const store = useProcessingStore()

watch(
  () =>
    [store.message.type, store.message.title, store.message.message, store.message.action] as const,
  ([type, title, text, action]) => {
    if (!text) return

    const options: Record<string, any> = {
      title: title,
      description: text,
      duration: 3000,
      keepAliveOnHover: true,
      class: `notify--${type}`,
    }

    if (action) {
      const actionCopy = { ...action }
      options.action = () =>
        h(
          MainButton,
          {
            title: actionCopy.label,
            size: 'small',
            color: 'green',
            onClick: () => actionCopy.onClick(),
          },
          { default: () => actionCopy.label },
        )
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

  & .n-notification-main-footer__action{
    margin-left: auto;
  }
}
</style>
