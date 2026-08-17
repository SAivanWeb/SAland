import { defineStore } from 'pinia'
import { ref } from 'vue'
type MessageType = 'success' | 'error' | 'warning' | 'info' | ''

export interface MessageAction {
  label: string
  onClick: () => void
}

interface Message {
  type: MessageType
  message: string
  title: string
  action?: MessageAction | null
}

interface ReportedUser {
  id: string
  name: string
}

export const useProcessingStore = defineStore('useProcessingStore', () => {
  const loading = ref<boolean>(false)

  const message = ref<Message>({
    type: '',
    title: '',
    message: '',
    action: null,
  })

  const reportedUser = ref<ReportedUser>({
    id: '',
    name: '',
  })

  const showNotification = ref<boolean>(false)

  const activeRoomNotification = ref({
    name: '',
    role: '',
  })

  const startLoading = () => {
    loading.value = true
  }

  const stopLoading = () => {
    loading.value = false
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

  const setReport = (payload: ReportedUser) => {
    reportedUser.value.name = payload.name
    reportedUser.value.id = payload.id
  }

  const clearReport = () => {
    reportedUser.value.name = ''
    reportedUser.value.id = ''
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
    clearActiveRoom,
    reportedUser,
    setReport,
    clearReport,
  }
})
