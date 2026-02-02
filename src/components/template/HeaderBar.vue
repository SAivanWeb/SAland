<template>
  <div class="header">
    <div class="header__container">
      <div class="header__logo"></div>
      <div class="header__nav">
        <MainButton
          v-if="!isAuth && !isAuthPage"
          title="войти"
          size="small"
          color="green"
          @click="toAuth"
        />
        <template v-if="currentUser && requests">
          <n-popover
            v-model:show="showPopover"
            style="padding: 0; top: 12px; width: 300px"
            trigger="click"
            placement="bottom-end"
            :show-arrow="false"
            @update:show="handlePopoverChange"
          >
            <template #trigger>
              <div
                v-if="isAuth || !isAuthPage"
                class="header__notification"
                :class="{ header__notification_has: requests.length > 0 }"
              >
                <n-icon size="20">
                  <notification />
                </n-icon>
              </div>
            </template>
            <div class="header__requests">
              <div class="header__friend">
                <span>Запросы в друзья:</span>
                <div v-for="item in requests" :key="item.id" class="header__friend-item">
                  <div class="header__friend-user">
                    <PlayerIcon :name="item.from_user.name" no-tooltip />
                    <span>{{ item.from_user.name }}</span>
                  </div>
                  <div class="header__friend-btns">
                    <div class="header__friend-btns-item cancel" @click="rejectRequest(item.id)">
                      <n-icon size="20">
                        <close />
                      </n-icon>
                    </div>
                    <div class="header__friend-btns-item accept" @click="acceptRequest(item.id)">
                      <n-icon size="20">
                        <check />
                      </n-icon>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </n-popover>
        </template>
        <Menu v-if="!isMainPage && !isAuthPage" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MainButton from '@/components/ui/button/MainButton.vue'
import { useUserStore } from '@/stores/useUserStore.ts'
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import Menu from '@/components/template/Menu.vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import Notification from '@/assets/icons/notification.vue'
import { api, type FriendRequest } from '@/api'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { NPopover, NIcon } from 'naive-ui'
import PlayerIcon from '@/components/games/PlayerIcon.vue'
import Close from '@/assets/icons/close.vue'
import Check from '@/assets/icons/check.vue'
import { useWebSocket } from '@/api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const processingStore = useProcessingStore()
const requests = ref<FriendRequest[]>()
const ws = useWebSocket()

const showPopover = ref(false);

watch(
  () => processingStore.showNotification,
  (newValue) => {
    if (newValue) {
      showPopover.value = true
    }
  }
)

const handlePopoverChange = (value: boolean) => {
  if (!value) {
    processingStore.showNotification = false
  }
}

const isAuth = computed(() => {
  return userStore.currentUser !== null
})

const currentUser = computed(() => {
  return userStore.currentUser
})

const isAuthPage = computed(() => {
  return route.path === '/auth'
})

const isMainPage = computed(() => {
  return route.path === '/'
})

let unsubNotification: (() => void) | null = null

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

const toAuth = () => {
  router.push('/auth')
}

async function fetchPendingRequests() {
  try {
    processingStore.startLoading()
    requests.value = await api.friends.getRequests()
  } catch (error) {
    console.log(error)
  } finally {
    processingStore.stopLoading()
  }
}

async function acceptRequest(id: string) {
  try {
    processingStore.startLoading()
    await api.friends.acceptRequest({ request_id: id })
    await fetchPendingRequests()
  } catch (error) {
    console.log(error)
  } finally {
    processingStore.stopLoading()
  }
}

async function rejectRequest(id: string) {
  try {
    processingStore.startLoading()
    await api.friends.rejectRequest({ request_id: id })
    await fetchPendingRequests()
  } catch (error) {
    console.log(error)
  } finally {
    processingStore.stopLoading()
  }
}

watch(
  currentUser,
  (newValue) => {
    if (newValue && newValue.pending_requests_count > 0) {
      fetchPendingRequests()
    }
  },
  { immediate: true },
)
</script>

<style lang="scss">
.header {
  width: 100%;
  height: $header-height;
  border-bottom: 2px solid $border;
  display: flex;
  align-items: center;
  padding: 0 $side-padding;
  background: $primary-yellow;

  &__container {
    width: 100%;
    max-width: 1080px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  & .n-popover {
    padding: 0 !important;
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  &__notification {
    background-color: $primary-green;
    border-radius: 50%;
    border: 2px solid $border;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-box-shadow: 2px 4px 0px $border;
    -moz-box-shadow: 2px 4px 0px $border;
    box-shadow: 1px 2px 0px $border;
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
  }

  &__requests {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  &__friend {
    display: flex;
    flex-direction: column;
    gap: 12px;

    & span {
      @include body-1;
    }

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
        -webkit-box-shadow: 2px 4px 0px $border;
        -moz-box-shadow: 2px 4px 0px $border;
        box-shadow: 1px 2px 0px $border;
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
}
</style>
