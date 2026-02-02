import {defineStore} from 'pinia'
import { ref } from 'vue'
type MessageType = 'success' | 'error' | 'warning' | 'info' | ''
interface Message {
  type: MessageType,
  message: string
  title: string
}

export const useProcessingStore = defineStore('useProcessingStore', () => {
  const loading = ref<boolean>(false);
  const message = ref<Message>({
    type: '',
    title: '',
    message: '',
  })
  const showNotification = ref<boolean>(false);

  const startLoading= () => {
    loading.value = true;
  };

  const stopLoading = () => {
    loading.value = false;
  }

  const setMessage = (type: MessageType, title: string, text: string) => {
    message.value.type = type
    message.value.title = title
    message.value.message = text
  }

  const clearMessage = () => {
    message.value.message = message.value.title = message.value.type = ''
  }

  return {
    showNotification,
    loading,
    startLoading,
    stopLoading,
    message,
    setMessage,
    clearMessage,
  }
})
