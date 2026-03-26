/**
 * Логика отображения и взаимодействия с игровой доской:
 * - расчёт размеров контейнера под текущее число игроков
 * - стили для каждой ячейки (позиция + цвет владельца)
 * - определение доступных ходов и обработка клика по ячейке
 */

import { computed } from 'vue'
import { useGameStore } from '@/stores/useGameStore.ts'
import { useWebSocket } from '@/api'
import { hexToPixel } from '@/utils/hexGrid.ts'
import { useGamePlayers } from '@/composables/useGamePlayers.ts'
import type { HexCell } from '@/api'

// Базовые константы сетки — меняй здесь, остальное пересчитается автоматически
const HEX_SIZE = 50 // радиус гексагона в px
const HEX_GAP = 6 // отступ между гексагонами в px

export function useGameBoard() {
  const gameStore = useGameStore()
  const ws = useWebSocket()
  const { players, isMyTurn } = useGamePlayers()

  // Для 2 игроков поле меньше (радиус 1), для 3–4 — больше (радиус 2)
  const boardRadius = computed(() => (players.value.length <= 2 ? 1 : 2))

  // Размер контейнера доски подбирается так, чтобы вместить весь радиус сетки
  const boardContainerStyle = computed(() => {
    const size = (boardRadius.value * 2 + 1) * (HEX_SIZE + HEX_GAP) * 2
    return { width: `${size}px`, height: `${size}px` }
  })

  // CSS-переменные для позиционирования ячейки и цвета её владельца
  const getCellStyle = (cell: HexCell) => {
    const { x, y } = hexToPixel(cell.q, cell.r, HEX_SIZE, HEX_GAP)
    const owner =
      cell.player_index !== null
        ? gameStore.players.find((p) => p.player_index === cell.player_index)
        : null
    return {
      '--hex-x': `${x}px`,
      '--hex-y': `${y}px`,
      '--hex-size': `${HEX_SIZE}px`,
      '--player-color': owner ? owner.color : '#e0e0e0',
    }
  }

  // Доступные ходы в виде Set<"q,r"> для O(1)-проверки — строится только в свой ход
  const availableMoveSet = computed(() => {
    if (!isMyTurn.value || !gameStore.currentTurn) return new Set<string>()
    return new Set((gameStore.currentTurn.available_moves ?? []).map((m) => `${m.q},${m.r}`))
  })

  const isAvailableMove = (cell: HexCell) => availableMoveSet.value.has(`${cell.q},${cell.r}`)

  // Ячейка является атакой: доступный ход И занята чужим игроком
  const isAttackMove = (cell: HexCell) =>
    isAvailableMove(cell) && cell.player_index !== null

  // Клик разрешён только в свой ход, только по доступной ячейке, и не во время вопроса
  const onCellClick = (cell: HexCell) => {
    if (!isMyTurn.value || gameStore.currentQuestion) return
    if (!isAvailableMove(cell)) return
    ws.game.selectCell({ q: cell.q, r: cell.r })
  }

  return {
    boardContainerStyle,
    getCellStyle,
    isAvailableMove,
    isAttackMove,
    onCellClick,
  }
}
