/**
 * Предоставляет реактивные данные об игроках текущей партии:
 * - отсортированный список игроков для карточек
 * - идентификация текущего пользователя среди участников
 * - вычисление чей сейчас ход и кто может отвечать на вопрос
 */

import { computed } from 'vue'
import { useGameStore } from '@/stores/useGameStore.ts'
import { useUserStore } from '@/stores/useUserStore.ts'

export function useGamePlayers() {
  const gameStore = useGameStore()
  const userStore = useUserStore()

  // Игроки отсортированы по player_index — порядок карточек всегда стабилен
  const players = computed(() =>
    [...gameStore.players].sort((a, b) => a.player_index - b.player_index),
  )

  // Индекс авторизованного пользователя среди участников игры (null если не участник)
  const myPlayerIndex = computed(() => {
    if (!userStore.currentUser) return null
    const me = gameStore.players.find((p) => p.user_id === userStore.currentUser!.user.id)
    return me?.player_index ?? null
  })

  // Является ли текущий ход ходом авторизованного пользователя
  const isMyTurn = computed(
    () =>
      gameStore.currentTurn !== null &&
      gameStore.currentTurn.current_player_index === myPlayerIndex.value,
  )

  // Может ли авторизованный пользователь ответить на текущий вопрос:
  // в обычном вопросе — только атакующий, в бою — атакующий и защитник
  const canAnswer = computed(() => {
    if (!gameStore.currentQuestion || myPlayerIndex.value === null) return false
    if (gameStore.currentQuestion.is_battle) {
      return (
        myPlayerIndex.value === gameStore.currentTurn?.current_player_index ||
        myPlayerIndex.value === gameStore.currentQuestion.defender_index
      )
    }
    return myPlayerIndex.value === gameStore.currentTurn?.current_player_index
  })

  // Принадлежит ли карточка по sortedIdx текущему пользователю
  const isMyCard = (sortedIdx: number) =>
    players.value[sortedIdx]?.player_index === myPlayerIndex.value

  // Ходит ли сейчас игрок, чья карточка находится на позиции sortedIdx
  const isCurrentTurnPlayer = (sortedIdx: number) =>
    players.value[sortedIdx]?.player_index === gameStore.currentTurn?.current_player_index

  // Полные данные игрока, чья сейчас очередь хода (для индикатора хода)
  const currentTurnPlayer = computed(() => {
    if (!gameStore.currentTurn) return null
    return (
      gameStore.players.find(
        (p) => p.player_index === gameStore.currentTurn!.current_player_index,
      ) ?? null
    )
  })

  return {
    players,
    myPlayerIndex,
    isMyTurn,
    canAnswer,
    isMyCard,
    isCurrentTurnPlayer,
    currentTurnPlayer,
  }
}
