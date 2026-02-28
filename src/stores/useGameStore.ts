import { defineStore } from 'pinia'
import { type GameStartedEvent, useWebSocket } from '@/api'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import {ref} from 'vue'

export const useGameStore = defineStore('useGameStore', () => {
  const ws = useWebSocket()
  const processingStore = useProcessingStore()

  const currentGame = ref<GameStartedEvent>()

  ws.game.onStarted((data) => {
    currentGame.value = data
    processingStore.setMessage('success', 'Игра запущена', 'Приятной игры')
  })

  return {
    currentGame
  }
})