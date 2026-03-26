/**
 * Логика модального окна вопроса:
 * - преобразование времени на ответ из мс в секунды
 * - формирование списка участников вопроса (атакующий + защитник при бое)
 * - отправка ответа и обработка истечения времени
 */

import { computed } from 'vue'
import { useGameStore } from '@/stores/useGameStore.ts'
import { useWebSocket } from '@/api'

export function useGameQuestion() {
  const gameStore = useGameStore()
  const ws = useWebSocket()

  // Время на ответ в секундах (сервер присылает в мс)
  const questionSeconds = computed(() => {
    if (!gameStore.currentQuestion) return 30
    return Math.floor(gameStore.currentQuestion.time_limit / 1_000)
  })

  // Участники вопроса: сначала атакующий, затем защитник (только в режиме боя)
  const questionPlayers = computed(() => {
    if (!gameStore.currentQuestion) return []
    const result: { id: number; name: string; color: string }[] = []

    // currentTurn обнуляется при получении answerResult — берём fallback из самого результата
    const attackerIndex =
      gameStore.currentTurn?.current_player_index ??
      gameStore.answerResult?.result.player_answer?.player_index ??
      null
    if (attackerIndex !== null) {
      const attacker = gameStore.players.find((p) => p.player_index === attackerIndex)
      if (attacker)
        result.push({ id: attacker.player_index, name: attacker.name, color: attacker.color })
    }

    // Добавляем защитника только если это бой и он отличается от атакующего
    if (gameStore.currentQuestion.is_battle && gameStore.currentQuestion.defender_index !== null) {
      const defIdx = gameStore.currentQuestion.defender_index
      if (defIdx !== attackerIndex) {
        const defender = gameStore.players.find((p) => p.player_index === defIdx)
        if (defender)
          result.push({ id: defender.player_index, name: defender.name, color: defender.color })
      }
    }

    return result
  })

  // Отправляем выбранный ответ на сервер
  const onAnswerSelected = (answerIndex: number) => {
    ws.game.answer({ answer_index: answerIndex })
  }

  // Истечение времени обрабатывается на сервере — клиент только сигнализирует
  const onQuestionTimeUp = () => {}

  return { questionSeconds, questionPlayers, onAnswerSelected, onQuestionTimeUp }
}
