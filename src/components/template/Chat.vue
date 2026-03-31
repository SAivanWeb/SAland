<template>
  <div class="chat">
    <div class="chat__header">
      <h4>Чат игры</h4>
      <button v-if="closable" class="chat__close" @click="emit('close')">
        <n-icon size="20"><Close /></n-icon>
      </button>
    </div>
    <n-scrollbar ref="scrollbarRef" style="max-height: 250px">
      <div class="chat__content">
        <div v-if="messages && currentUser" class="chat__body">
          <div
            v-for="item in messages.filter((m) => m.type !== 'system')"
            :key="item.id"
            class="chat__message"
          >
            <div
              class="chat__message-user"
              :class="{ 'chat__message-user_own': item.user_id === currentUser.user.id }"
            >
              <PlayerIcon
                class="chat__message-user-icon"
                v-if="item.user_name"
                :name="item.user_name"
                no-tooltip
              />
              <n-popover
                trigger="manual"
                :show="openPopoverUserId === item.user_id"
                placement="bottom-start"
                :show-arrow="false"
                style="padding: 8px; min-width: 160px"
                @clickoutside="openPopoverUserId = null"
              >
                <template #trigger>
                  <div
                    class="chat__message-user-additional"
                    @click.stop="openPopoverUserId = openPopoverUserId === item.user_id ? null : item.user_id"
                  >
                    <n-icon size="24">
                      <Dots />
                    </n-icon>
                  </div>
                </template>
                <div class="chat__popover">
                  <div class="chat__popover-item" @click="openReport(item.user_id, item.user_name)">
                    Пожаловаться
                  </div>
                  <div class="chat__popover-item" @click="addFriend(item.user_id)">
                    Добавить в друзья
                  </div>
                </div>
              </n-popover>
            </div>
            <div class="chat__message-content">
              {{ item.content }}
            </div>
          </div>
        </div>
        <div v-if="!messages" class="chat__nodata">
          <span>Нет сообщений</span>
        </div>
      </div>
    </n-scrollbar>
    <div v-if="typingUsers.size > 0" class="chat__typing">
      <span>{{ [...typingUsers.values()].map((u) => u.name).join(', ') }} печатает...</span>
    </div>
    <div class="chat__footer">
      <MainInput name="message" placeholder="Введите сообщение" v-model="newMessage" @keydown.enter="sendMessage" @input="onInputTyping" />
      <div class="chat__send" @click="sendMessage">
        <n-icon class="chat__send-icon" size="24">
          <Send />
        </n-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type ChatMessage, useWebSocket, useApi } from '@/api'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { NScrollbar, NIcon, NPopover } from 'naive-ui'
import { useUserStore } from '@/stores/useUserStore.ts'
import PlayerIcon from '@/components/games/PlayerIcon.vue'
import MainInput from '@/components/ui/input/MainInput.vue'
import MainButton from '@/components/ui/button/MainButton.vue'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import Dots from '@/assets/icons/dots.vue'
import Send from '@/assets/icons/send.vue'
import Close from '@/assets/icons/close.vue'

interface Props {
  gameId: string
  closable?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()
const api = useApi()
const processingStore = useProcessingStore()
const ws = useWebSocket()
const userStore = useUserStore()
const unsubs: (() => void)[] = []
const openPopoverUserId = ref<string | null>(null)

const scrollbarRef = ref<InstanceType<typeof NScrollbar> | null>(null)
const messages = ref<ChatMessage[]>()
const newMessage = ref<string>('')
const typingUsers = ref<Map<string, { name: string; timer: ReturnType<typeof setTimeout> }>>(new Map())

let typingThrottleTimer: ReturnType<typeof setTimeout> | null = null

function onInputTyping() {
  if (!typingThrottleTimer) {
    ws.chat.typing({ game_id: props.gameId })
    typingThrottleTimer = setTimeout(() => {
      typingThrottleTimer = null
    }, 2000)
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    scrollbarRef.value?.scrollTo({ top: 999999, behavior: 'smooth' })
  })
}

watch(messages, scrollToBottom)

const currentUser = computed(() => userStore.currentUser)

function openReport(userId: string, userName: string) {
  openPopoverUserId.value = null
  processingStore.setReport({ id: userId, name: userName })
}

async function addFriend(userId: string) {
  openPopoverUserId.value = null
  try {
    await api.friends.sendRequest({ user_id: userId })
    processingStore.setMessage('success', 'Друзья', 'Запрос на дружбу отправлен')
  } catch {
    processingStore.setMessage('error', 'Друзья', 'Ошибка отправки запроса')
  }
}

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  ws.chat.send({
    content: newMessage.value,
    game_id: props.gameId,
  })
  newMessage.value = ''
}

onMounted(() => {
  unsubs.push(
    ws.chat.onHistory((data) => {
      messages.value = data
    }),
    ws.chat.onError((err) => {
      if (err.code === 'SEND_FAILED') {
        processingStore.setMessage('error', 'Чат игры', 'Ошибка отправки сообщения')
      } else if (err.code === 'HISTORY_FAILED') {
        processingStore.setMessage('error', 'Чат игры', 'Ошибка получения чата')
      }
    }),
    ws.chat.onMessage(() => {
      ws.chat.getHistory({ game_id: props.gameId })
    }),
    ws.chat.onTyping((data) => {
      if (data.user_id === currentUser.value?.user.id) return
      const existing = typingUsers.value.get(data.user_id)
      if (existing) clearTimeout(existing.timer)
      const timer = setTimeout(() => {
        typingUsers.value.delete(data.user_id)
      }, 3000)
      typingUsers.value.set(data.user_id, { name: data.user_name, timer })
    }),
  )

  ws.chat.getHistory({ game_id: props.gameId })
})

onUnmounted(() => {
  unsubs.forEach((fn) => fn())
  if (typingThrottleTimer) clearTimeout(typingThrottleTimer)
  typingUsers.value.forEach((v) => clearTimeout(v.timer))
})
</script>

<style scoped lang="scss">
.chat {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  width: 300px;
  border-radius: $border-radius;
  border: 2px solid $border;
  box-shadow: $box-shadow;
  background: #fff;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 6px;
    border-bottom: 1px solid $border;
  }

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    border-radius: $border-radius;
    color: $text-grey;
    transition: color 0.15s ease, background-color 0.15s ease;

    &:hover {
      color: $text-dark;
      background-color: $background;
    }
  }

  &__content {
    width: 100%;
    padding: 0 4px;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 250px;
  }

  &__nodata {
    width: 100%;
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
    @include body-1;
    text-align: center;
    color: $text-grey;
  }

  &__message {
    display: flex;
    flex-direction: column;
    gap: 6px;

    &-user {
      display: flex;
      justify-content: space-between;
      align-items: center;

      &_own {
        & .chat__message-user-icon {
          margin-left: auto;
        }

        & .chat__message-user-additional {
          display: none;
        }
      }

      &-additional {
        cursor: pointer;
      }
    }

    &-content {
      padding: 6px;
      border-radius: $border-radius;
      color: $text-dark;
      background: #fff;
      border: 1px solid $border;
      overflow: hidden;
    }
  }

  &__typing {
    min-height: 18px;
    overflow: hidden;
    span {
      @include body-2;
      color: $text-grey;
      font-style: italic;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &__footer {
    display: flex;
    gap: 8px;

    & .input {
      width: 208px;
    }
  }

  &__popover {
    display: flex;
    flex-direction: column;
    gap: 2px;

    &-item {
      padding: 8px 12px;
      cursor: pointer;
      border-radius: 4px;
      @include body-2;
      white-space: nowrap;
      transition: background-color 0.2s;

      &:hover {
        background-color: $primary-blue;
      }

      &:first-child:hover {
        background-color: $primary-red;
      }
    }
  }

  &__send {
    display: flex;
    height: 48px;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    background: $primary-green;
    border-radius: 50%;
    border: 2px solid $border;
    box-shadow: $box-shadow;
    cursor: pointer;

    &:active {
      box-shadow: 0px 0px 0px $border;
      transform: translate(1px, 2px);
    }
    &-icon {
      transform: translate(2px, -2px) rotate(-35deg);
    }
  }
}
</style>
