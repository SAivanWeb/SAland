import { defineStore } from 'pinia'
import {
  type GameStartedEvent,
  type GamePlayer,
  type HexCell,
  type GameTurnEvent,
  type GameQuestionEvent,
  type GameEndedEvent,
  useWebSocket,
} from '@/api'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useGameStore = defineStore('useGameStore', () => {
  const ws = useWebSocket()
  const processingStore = useProcessingStore()
  const router = useRouter()

  const currentGame = ref<GameStartedEvent>()
  const cells = ref<HexCell[]>([])
  const players = ref<GamePlayer[]>([])
  const currentTurn = ref<GameTurnEvent | null>(null)
  const currentQuestion = ref<GameQuestionEvent | null>(null)
  const waitingForOpponent = ref(false)
  const gameEnded = ref<GameEndedEvent | null>(null)
  const gameTimerEndsAt = ref<number | null>(null)

  ws.game.onStarted((data) => {
    currentGame.value = data
    cells.value = data.cells
    players.value = data.players
    currentTurn.value = null
    currentQuestion.value = null
    gameEnded.value = null
    gameTimerEndsAt.value = data.game_timer_ends_at
    processingStore.setMessage('success', 'Игра запущена', 'Приятной игры')
    processingStore.stopLoading()
  })

  ws.game.onTurn((data) => {
    currentTurn.value = data
    currentQuestion.value = null
    waitingForOpponent.value = false
  })

  ws.game.onQuestion((data) => {
    currentQuestion.value = data
  })

  ws.game.onAnswerSubmitted((data) => {
    waitingForOpponent.value = !!data.waiting_for_opponent
  })

  ws.game.onAnswerResult((data) => {
    data.updated_cells.forEach((updated) => {
      const idx = cells.value.findIndex((c) => c.q === updated.q && c.r === updated.r)
      if (idx !== -1) cells.value[idx] = updated
    })
    data.updated_players.forEach((updated) => {
      const idx = players.value.findIndex((p) => p.player_index === updated.player_index)
      if (idx !== -1) players.value[idx] = updated
    })
    currentQuestion.value = null
    waitingForOpponent.value = false
    currentTurn.value = null
  })

  ws.game.onPlayerForfeited((data) => {
    data.updated_cells.forEach((updated) => {
      const idx = cells.value.findIndex((c) => c.q === updated.q && c.r === updated.r)
      if (idx !== -1) cells.value[idx] = updated
    })
    processingStore.setMessage('info', `${data.name}`, 'Сдался и вышел из игры')
  })

  ws.game.onPlayerDisconnected((data) => {
    processingStore.setMessage('warning', `${data.name}`, 'Потерял соединение')
  })

  ws.game.onPlayerReconnected((data) => {
    processingStore.setMessage('info', `${data.name}`, 'Переподключился')
  })

  ws.game.onEnded((data) => {
    gameEnded.value = data
    currentTurn.value = null
    currentQuestion.value = null
  })

  ws.game.onState((data) => {
    cells.value = data.cells
    players.value = data.players
    currentTurn.value = data.current_turn
    gameTimerEndsAt.value = data.game_timer_ends_at
    processingStore.stopLoading()
  })

  ws.game.onError((err) => {
    if (err.code === 'GAME_START_FAILED') {
      processingStore.setMessage('error', 'Запуск игры', 'Ошибка запуска комнаты')
      router.push('/games')
    } else if (err.code === 'NOT_IN_GAME') {
      router.push('/games')
    }
  })

  const clearGameEnded = () => {
    gameEnded.value = null
  }

  return {
    currentGame,
    cells,
    players,
    currentTurn,
    currentQuestion,
    waitingForOpponent,
    gameEnded,
    gameTimerEndsAt,
    clearGameEnded,
  }
})
