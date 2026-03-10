<template>
  <div class="chat">
    <div class="chat__header">
      <h3>Чат игры</h3>
    </div>
    <n-scrollbar style="max-height: 400px">
      <div v-if="messages && currentUser" class="chat__body">
        <div v-for="item in messages" :key="item.id" class="chat__message">
          <div
            class="chat__message-user"
            :class="{ 'chat__message-user_own': item.user_id === currentUser.user.id }"
          >
            <PlayerIcon
              class="chat__message-user-icon"
              v-if="item.user_name"
              :name="item.user_name"
            />
            <div class="chat__message-user-additional">
              <n-icon size="24">
                <Dots/>
              </n-icon>
            </div>
          </div>
          <div class="chat__message-content">
            {{ item.content }}
          </div>
        </div>
      </div>
      <div v-if="!messages" class="chat__nodata">Нет сообщений</div>
    </n-scrollbar>
    <div class="chat__footer">
      <MainInput name="message" placeholder="Введите сообщение" v-model="newMessage" />
      <MainButton title="Отправить" @click="sendMessage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type ChatMessage, useWebSocket } from '@/api'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useGameStore } from '@/stores/useGameStore.ts'
import { NScrollbar, NIcon } from 'naive-ui'
import { useUserStore } from '@/stores/useUserStore.ts'
import PlayerIcon from '@/components/games/PlayerIcon.vue'
import MainInput from '@/components/ui/input/MainInput.vue'
import MainButton from '@/components/ui/button/MainButton.vue'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import Dots from '@/assets/icons/dots.vue'

const processingStore = useProcessingStore()
const ws = useWebSocket()
const gameStore = useGameStore()
const userStore = useUserStore()
const unsubs: (() => void)[] = []

const messages = ref<ChatMessage[]>()
const newMessage = ref<string>('')

const currentUser = computed(() => {
  return userStore.currentUser
})

const gameId = computed(() => {
  return gameStore?.currentGame?.game_id
})

const sendMessage = () => {
  if (gameStore.currentGame) {
    ws.chat.send({
      content: newMessage.value,
      game_id: gameStore.currentGame.game_id,
    })
  }
}

onMounted(() => {
  unsubs.push(
    ws.chat.onHistory((data) => {
      messages.value = data
    }),
    ws.chat.onError((err) => {
      if (err.message === 'INVALID_TARGET') {
        processingStore.setMessage('error', 'Чат игры', 'Непредвиденная ошибка')
      } else if (err.message === 'SEND_FAILED') {
        processingStore.setMessage('error', 'Чат игры', 'Ошибка отправки сообщения')
      } else if (err.message === 'HISTORY_FAILED') {
        processingStore.setMessage('error', 'Чат игры', 'Ошибка получения чата')
      }
    }),
    ws.chat.onMessage(() => {
      ws.chat.getHistory({
        game_id: gameId.value,
      })
    }),
  )

  ws.chat.getHistory({
    game_id: gameId.value,
  })
})

onUnmounted(() => {
  unsubs.forEach((fn) => fn())
})
</script>

<style scoped lang="scss">
.chat {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  width: 300px;
  border-radius: $border-radius;
  border: 2px solid $border;
  box-shadow: $box-shadow;
  background: $primary-blue;

  &__header {
    padding-bottom: 16px;
    border-bottom: 1px solid $border;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 400px;
  }

  &__nodata {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 400px;
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

      &-additional{
        cursor: pointer;
      }
    }

    &-content {
      padding: 6px;
      border-radius: $border-radius;
      color: $text-dark;
      background: #fff;
      border: 1px solid $border;
    }
  }
}
</style>
