<template>
  <div class="chat-wrapper">
    <n-badge :value="unreadCount" :max="9" :show="unreadCount > 0">
      <n-button circle @click="isOpen = !isOpen">
        <template #icon>
          <n-icon size="24" :component="ChatbubbleEllipses" />
        </template>
      </n-button>
    </n-badge>

    <n-drawer
      v-model:show="isOpen"
      :width="maxWidth"
      :height="maxHeight"
      placement="right"
    >
      <n-drawer-content title="Чат" closable>
        <template #header>
          <div class="chat-header">
            <n-icon :component="ChatbubbleEllipses" size="20" />
            <span>Чат текущей игры</span>
          </div>
        </template>

        <n-scrollbar ref="scrollbarRef" class="messages-container">
          <div class="messages-list">
            <div
              v-for="message in messages"
              :key="message.id"
              class="message"
              :class="{ own: message.isOwn }"
            >
              <div class="message-avatar" v-if="!message.isOwn">
                <PlayerIcon :name="message.author" />
              </div>
              <div class="message-content">
                <div class="message-author">{{ message.author }}</div>
                <div class="message-text">{{ message.text }}</div>
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
              </div>
              <div class="message-avatar" v-if="message.isOwn">
                <PlayerIcon :name="message.author" />
              </div>
            </div>
          </div>
        </n-scrollbar>

        <template #footer>
          <div class="chat-input">
            <n-input
              v-model:value="newMessage"
              type="textarea"
              placeholder="Введите сообщение..."
              :autosize="{ minRows: 1, maxRows: 3 }"
              @keydown.enter.exact.prevent="sendMessage"
            />
            <n-button
              type="primary"
              :disabled="!newMessage.trim()"
              @click="sendMessage"
            >
              <template #icon>
                <n-icon :component="Send" />
              </template>
            </n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, computed } from 'vue'
import {
  NButton,
  NDrawer,
  NDrawerContent,
  NScrollbar,
  NInput,
  NIcon,
  NBadge,
} from 'naive-ui'
import { ChatbubbleEllipses, Send } from '@vicons/ionicons5'
import PlayerIcon from '@/components/games/PlayerIcon.vue'

export interface Message {
  id: string | number
  author: string
  text: string
  timestamp: Date
  isOwn: boolean
}

interface Props {
  maxWidth?: number | string
  maxHeight?: number | string
  messages?: Message[] | null
  currentUser?: string
  unreadCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 400,
  maxHeight: '100%',
  messages: null,
  currentUser: 'Вы',
  unreadCount: 3,
})

const demoMessages: Message[] = [
  {
    id: 1,
    author: 'Алексей',
    text: 'Привет всем! Кто готов играть?',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    isOwn: false,
  },
  {
    id: 2,
    author: 'Мария',
    text: 'Привет! Я готова, давайте начинать',
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    isOwn: false,
  },
  {
    id: 3,
    author: 'Вы',
    text: 'Отлично, я тоже готов!',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    isOwn: true,
  },
  {
    id: 4,
    author: 'Алексей',
    text: 'Супер, тогда начинаем. Удачи всем!',
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    isOwn: false,
  },
  {
    id: 5,
    author: 'Вы',
    text: 'Спасибо, вам тоже! Это будет интересная игра 🎮',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isOwn: true,
  },
  {
    id: 6,
    author: 'Мария',
    text: 'Кстати, кто знает правила? Я первый раз играю',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    isOwn: false,
  },
  {
    id: 7,
    author: 'Алексей',
    text: 'Да, конечно! Сейчас объясню. Правила простые: нужно собрать как можно больше очков за отведённое время.',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    isOwn: false,
  },
]

const messages = computed(() => props.messages ?? demoMessages)

const emit = defineEmits<{
  (e: 'send', message: string): void
  (e: 'open'): void
  (e: 'close'): void
}>()

const isOpen = ref(false)
const newMessage = ref('')
const scrollbarRef = ref<InstanceType<typeof NScrollbar> | null>(null)

const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const scrollToBottom = async () => {
  await nextTick()
  if (scrollbarRef.value) {
    scrollbarRef.value.scrollTo({ top: 999999, behavior: 'smooth' })
  }
}

const sendMessage = () => {
  const text = newMessage.value.trim()
  if (!text) return

  emit('send', text)
  newMessage.value = ''
  scrollToBottom()
}

watch(isOpen, (value) => {
  if (value) {
    emit('open')
    scrollToBottom()
  } else {
    emit('close')
  }
})

watch(
  () => messages.value.length,
  () => {
    if (isOpen.value) {
      scrollToBottom()
    }
  }
)
</script>

<style scoped lang="scss">
.chat-wrapper {
  position: relative;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: $text-primary;
}

.messages-container {
  height: calc(100vh - 180px);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px;
}

.message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 80%;

  &.own {
    margin-left: auto;
    flex-direction: row-reverse;

    .message-content {
      background: linear-gradient(135deg, $primary 0%, $primary-hover 100%);
      color: $background;
      border-radius: 16px 16px 4px 16px;
    }

    .message-author {
      text-align: right;
      color: $background;
    }

    .message-time {
      text-align: right;
      color: $background;
      opacity: 0.7;
    }

    .message-text {
      color: $background;
    }
  }
}

.message-content {
  background: $third-background;
  padding: 10px 14px;
  border-radius: 16px 16px 16px 4px;
  min-width: 100px;
  border: 1px solid $border;
}

.message-author {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
  color: $secondary;
}

.message-text {
  word-break: break-word;
  white-space: pre-wrap;
  color: $text-primary;
}

.message-time {
  font-size: 10px;
  color: $text-muted;
  margin-top: 4px;
}

.chat-input {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  width: 100%;
}

.message-avatar {
  flex-shrink: 0;
}

// Стили для drawer в темной теме
:deep(.n-drawer) {
  background: $second-background !important;
}

:deep(.n-drawer-header__main) {
  color: $text-primary !important;
}

:deep(.n-drawer-body-content-wrapper) {
  background: $second-background !important;
}

:deep(.n-drawer-footer) {
  background: $second-background !important;
  border-top: 1px solid $border !important;
}
</style>
