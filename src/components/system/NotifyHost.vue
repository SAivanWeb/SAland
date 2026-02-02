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
    -webkit-box-shadow: 2px 4px 0px $border;
    -moz-box-shadow: 2px 4px 0px $border;
    box-shadow: 1px 2px 0px $border;
  }

  &.notify--error .n-notification {
    background-color: $primary-red;
  }

  &.notify--success .n-notification {
    background-color: $primary-green;
  }

  &.notify--info .n-notification {
    background-color: #fff;
  }

  & .n-notification-main .n-notification-main__header {
    color: $text-dark !important;
  }

  & .n-notification__close {
    color: $text-dark !important;
  }

  & .n-notification-main__description {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: $text-grey !important;
    text-overflow: ellipsis;
  }
}
</style>
