/**
 * Управляет таймерами игры:
 * - глобальный таймер до конца партии
 * - таймер текущего хода с разделением на обычное и дополнительное время
 *
 * Запускает и очищает интервал обновления времени при монтировании/размонтировании компонента.
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/useGameStore.ts'

export function useGameTimers() {
  const gameStore = useGameStore()

  // Текущее время в мс — обновляется каждые 100мс для плавной анимации прогресс-баров
  const now = ref(Date.now())
  let clockInterval: number | null = null

  // Прогресс таймера текущего хода и флаг, находимся ли мы в дополнительном времени
  const turnTimerData = computed(() => {
    const turn = gameStore.currentTurn
    if (!turn) return null

    const elapsed = now.value - turn.started_at
    const timeLimitMs = turn.time_limit
    const extraTimeMs = turn.extra_time_remaining
    const normalRemaining = timeLimitMs - elapsed

    // Обычное время ещё не истекло
    if (normalRemaining > 0) {
      return {
        percentage: (normalRemaining / timeLimitMs) * 100,
        isExtra: false,
      }
    }

    // Дополнительное время
    if (extraTimeMs > 0) {
      const extraElapsed = elapsed - timeLimitMs
      const extraRemaining = Math.max(0, extraTimeMs - extraElapsed)
      return {
        percentage: (extraRemaining / extraTimeMs) * 100,
        isExtra: true,
      }
    }

    return { percentage: 0, isExtra: false }
  })

  // Оставшееся время до конца игры в формате "X ч Y мин" / "X мин Y сек" / "X сек"
  const formattedGameTimer = computed(() => {
    if (!gameStore.gameTimerEndsAt) return null
    const remaining = Math.max(0, gameStore.gameTimerEndsAt - now.value)
    const hours = Math.floor(remaining / 3_600_000)
    const minutes = Math.floor((remaining % 3_600_000) / 60_000)
    const seconds = Math.floor((remaining % 60_000) / 1_000)
    if (hours > 0) return `${hours} ч ${minutes} мин`
    if (minutes > 0) return `${minutes} мин ${seconds} сек`
    return `${seconds} сек`
  })

  onMounted(() => {
    clockInterval = window.setInterval(() => {
      now.value = Date.now()
    }, 100)
  })

  onUnmounted(() => {
    if (clockInterval !== null) {
      clearInterval(clockInterval)
      clockInterval = null
    }
  })

  return { turnTimerData, formattedGameTimer }
}
