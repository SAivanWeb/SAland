import {defineStore} from 'pinia'
import { ref } from 'vue'
type MessageType = 'success' | 'error' | 'warning' | 'info' | ''

interface MessageAction {
  label: string
  onClick: () => void
}

interface Message {
  type: MessageType,
  message: string
  title: string
  action?: MessageAction | null
}

export const useProcessingStore = defineStore('useProcessingStore', () => {

  const loading = ref<boolean>(false);

  const message = ref<Message>({
    type: '',
    title: '',
    message: '',
    action: null,
  })

  const showNotification = ref<boolean>(false);

  const activeRoomNotification = ref({
    name: '',
    role: ''
  })

  const startLoading = () => {
    loading.value = true;
  };

  const stopLoading = () => {
    loading.value = false;
  }

  const setMessage = (type: MessageType, title: string, text: string, action?: MessageAction) => {
    message.value.type = type
    message.value.title = title
    message.value.message = text
    message.value.action = action ?? null
  }

  const clearMessage = () => {
    message.value.message = message.value.title = message.value.type = ''
    message.value.action = null
  }

  const setActiveRoom = (name: string, role: string) => {
    activeRoomNotification.value.name = name
    activeRoomNotification.value.role = role
  }

  const clearActiveRoom = () => {
    activeRoomNotification.value.name = ''
    activeRoomNotification.value.role = ''
  }

  return {
    showNotification,
    loading,
    startLoading,
    stopLoading,
    message,
    setMessage,
    clearMessage,
    activeRoomNotification,
    setActiveRoom,
    clearActiveRoom
  }
})
