import {defineStore} from 'pinia'
import { ref } from 'vue'

export const useProcessingStore = defineStore('useProcessingStore', () => {
  const loading = ref<boolean>(false);

  const startLoading= () => {
    loading.value = true;
  };

  const stopLoading = () => {
    loading.value = false;
  }

  return {
    loading,
    startLoading,
    stopLoading,
  }
})
