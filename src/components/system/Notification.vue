<template>
  <n-popover
    v-model:show="showPopover"
    style="padding: 0; top: 12px"
    trigger="click"
    placement="bottom-end"
    :show-arrow="false"
    @update:show="handlePopoverChange"
  >
    <template #trigger>
      <div class="notification" :class="{ notification_has: hasNotification }">
        <n-icon size="20">
          <notification />
        </n-icon>
      </div>
    </template>
    <div class="notification__requests">
      <div v-if="activeRoom.name && !isGameCreate" class="notification__item">
        <span>Активные комнаты:</span>
        <div class="notification__room">
          <div class="notification__room-name">{{ activeRoom.name }}</div>
          <MainButton title="Подключиться" size="small" color="green" @click="connectRoom" />
        </div>
      </div>
      <div v-if="requests" class="notification__item">
        <span>Запросы в друзья:</span>
        <div v-for="item in requests" :key="item.id" class="notification__friend-item">
          <div class="notification__friend-user">
            <PlayerIcon :name="item.from_user.name" no-tooltip />
            <span>{{ item.from_user.name }}</span>
          </div>
          <div class="notification__friend-btns">
            <div class="notification__friend-btns-item cancel" @click="rejectRequest(item.id)">
              <n-icon size="20">
                <close />
              </n-icon>
            </div>
            <div class="notification__friend-btns-item accept" @click="acceptRequest(item.id)">
              <n-icon size="20">
                <check />
              </n-icon>
            </div>
          </div>
        </div>
      </div>
      <div class="notification__nodata" v-if="!requests && !activeRoom.name">
        Нет активных уведомлений
      </div>
    </div>
  </n-popover>
</template>

<script setup lang="ts">
import PlayerIcon from '@/components/games/PlayerIcon.vue'
import { NIcon, NPopover } from 'naive-ui'
import Close from '@/assets/icons/close.vue'
import Notification from '@/assets/icons/notification.vue'
import Check from '@/assets/icons/check.vue'
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import { api, type FriendRequest, useWebSocket } from '@/api'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { useUserStore } from '@/stores/useUserStore.ts'
import MainButton from '@/components/ui/button/MainButton.vue'
import { useRouter, useRoute } from 'vue-router'

const route = useRoute()
const router = useRouter()
const processingStore = useProcessingStore()
const ws = useWebSocket()
const userStore = useUserStore()
let unsubNotification: (() => void) | null = null

const currentUser = computed(() => userStore.currentUser)
const showPopover = ref(false)
const requests = ref<FriendRequest[]>()

const isGameCreate = computed(() => {
  return route.path === '/game-create'
})

const hasNotification = computed(() => {
  if (requests.value && requests.value.length > 0) {
    return true
  } else if (activeRoom.value.name) {
    return true
  }
  return false
})

const activeRoom = computed(() => {
  return processingStore.activeRoomNotification
})

watch(
  currentUser,
  (newValue) => {
    if (newValue && newValue.pending_requests_count > 0) {
      fetchPendingRequests()
    }
  },
  { immediate: true },
)

watch(
  () => processingStore.showNotification,
  (newValue) => {
    if (newValue) {
      showPopover.value = true
    }
  },
)

async function acceptRequest(id: string) {
  try {
    processingStore.startLoading()
    await api.friends.acceptRequest({ request_id: id })
    await fetchPendingRequests()
  } catch {
    processingStore.setMessage('error', 'Заявка в друзья', 'Ошибка принятия заявки')
  } finally {
    processingStore.stopLoading()
  }
}

async function rejectRequest(id: string) {
  try {
    processingStore.startLoading()
    await api.friends.rejectRequest({ request_id: id })
    await fetchPendingRequests()
  } catch {
    processingStore.setMessage('error', 'Заявка в друзья', 'Ошибка отклонения заявки')
  } finally {
    processingStore.stopLoading()
  }
}

async function fetchPendingRequests() {
  try {
    processingStore.startLoading()
    requests.value = await api.friends.getRequests()
  } catch {
    // background refresh — fail silently
  } finally {
    processingStore.stopLoading()
  }
}

const handlePopoverChange = (value: boolean) => {
  if (!value) {
    processingStore.showNotification = false
  }
}

const connectRoom = () => {
  if (activeRoom.value.role) {
    if (activeRoom.value.role === 'admin') {
      router.push('/game-create')
    } else {
      router.push('/games')
    }
    processingStore.clearActiveRoom()
  }
}

onMounted(() => {
  unsubNotification = ws.notifications.onNotification((data) => {
    if (data.type === 'friend_request') {
      processingStore.setMessage('info', 'Уведомление', 'Новая заявка в друзья')
      fetchPendingRequests()
    }
  })
})

onUnmounted(() => {
  unsubNotification?.()
})
</script>

<style scoped lang="scss">
.notification {
  background-color: $primary-green;
  border-radius: 50%;
  border: 2px solid $border;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $box-shadow;
  cursor: pointer;
  position: relative;

  &_has {
    &::before {
      position: absolute;
      top: -2px;
      left: 22px;
      content: '';
      width: 10px;
      height: 10px;
      background: $text-dark;
      border-radius: 50%;
      z-index: 10;
    }
  }

  &:active {
    -webkit-box-shadow: 0px 0px 0px $border;
    -moz-box-shadow: 0px 0px 0px $border;
    box-shadow: 0px 0px 0px $border;
    transform: translate(1px, 2px);
  }

  &__requests {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 240px;

    @media (max-width: 400px) {
      width: 200px;
    }
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 12px;

    & span {
      @include body-1;
    }
  }

  &__friend {
    &-item {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    &-user {
      display: flex;
      align-items: center;
      gap: 8px;
      & span {
        @include body-1-bold;
      }
    }

    &-btns {
      display: flex;
      align-items: center;
      gap: 12px;

      &-item {
        border-radius: 50%;
        border: 2px solid $border;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: $box-shadow;
        cursor: pointer;

        &:active {
          -webkit-box-shadow: 0px 0px 0px $border;
          -moz-box-shadow: 0px 0px 0px $border;
          box-shadow: 0px 0px 0px $border;
          transform: translate(1px, 2px);
        }

        &.accept {
          background-color: $primary-green;
        }

        &.cancel {
          background-color: $primary-red;
        }
      }
    }
  }

  &__room {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;

    &-name {
      @include body-1-bold;
    }
  }

  &__nodata {
    @include caption;
    margin: 0 auto;
    color: $text-grey;
  }
}
</style>
