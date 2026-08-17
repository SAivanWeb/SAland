<template>
  <div style="display: none" />
</template>

<script setup lang="ts">
import { h, watch } from 'vue'
import { type NotificationOptions, useNotification } from 'naive-ui'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import MainButton from '@/components/ui/button/MainButton.vue'

type NotifyOptions = NotificationOptions & { class?: string }

const messageApi = useNotification()
const store = useProcessingStore()

watch(
  () =>
    [store.message.type, store.message.title, store.message.message, store.message.action] as const,
  ([type, title, text, action]) => {
    if (!type) return

    const options: NotifyOptions = {
      title: title,
      description: text,
      duration: 3500,
      keepAliveOnHover: true,
      class: `notify--${type}`,
      action: action
        ? () =>
            h(
              MainButton,
              {
                title: action.label,
                size: 'small',
                color: 'green',
                onClick: () => action.onClick(),
              },
              { default: () => action.label },
            )
        : undefined,
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
    font-size: $fs-h3 !important;
    font-weight: bold !important;
  }

  & .n-notification__close {
    color: $text-dark !important;
  }

  & .n-notification-main__description {
    font-size: $fs-body-1 !important;
    color: $text-dark !important;
  }

  & .n-notification-main-footer__action {
    margin-left: auto;
  }
}
</style>
