/**
 * Логика сдачи игры с двухэтапным подтверждением:
 * первый клик показывает кнопки "Да/Нет", второй — отправляет forfeit на сервер.
 */

import { ref } from 'vue'
import { useWebSocket } from '@/api'

export function useGameForfeit() {
  const ws = useWebSocket()

  // true — показываем кнопки подтверждения, false — показываем кнопку "Сдаться"
  const forfeitConfirming = ref(false)

  const onForfeitConfirm = () => {
    ws.game.forfeit()
    forfeitConfirming.value = false
  }

  return { forfeitConfirming, onForfeitConfirm }
}
