<template>
  <div class="game">
    <!-- Панели игроков -->
    <div class="game__user first" v-if="players.length >= 1">
      <div class="game__user-name">{{ players[0]?.name }}</div>
      <div class="game__user-stat">
        Захвачено: <span>{{ getPlayerTerritories(0) }}</span>
      </div>
    </div>
    <div class="game__user second" v-if="players.length >= 2">
      <div class="game__user-name">{{ players[1]?.name }}</div>
      <div class="game__user-stat">
        Захвачено: <span>{{ getPlayerTerritories(1) }}</span>
      </div>
    </div>
    <div class="game__user third" v-if="players.length >= 3">
      <div class="game__user-name">{{ players[2]?.name }}</div>
      <div class="game__user-stat">
        Захвачено: <span>{{ getPlayerTerritories(2) }}</span>
      </div>
    </div>
    <div class="game__user fourth" v-if="players.length >= 4">
      <div class="game__user-name">{{ players[3]?.name }}</div>
      <div class="game__user-stat">
        Захвачено: <span>{{ getPlayerTerritories(3) }}</span>
      </div>
    </div>

    <!-- Игровое поле -->
    <div class="game__board">
      <div class="game__board-container" :style="boardContainerStyle">
        <div
          v-for="cell in cells"
          :key="cell.id"
          class="hex"
          :class="[
            cell.owner !== null ? `hex--player-${cell.owner}` : 'hex--neutral',
            { 'hex--start': cell.isStart },
          ]"
          :style="getCellStyle(cell)"
          @click="onCellClick(cell)"
        />
      </div>
    </div>

    <Chat class="game__chat" />

    <GameModal
      :is-open="showGameModal"
      :seconds="30"
      :question="currentQuestion"
      :answers="currentAnswers"
      :players="currentPlayers"
      @answer-selected="onAnswerSelected"
      @time-up="onQuestionTimeUp"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Chat from '@/components/template/Chat.vue'
import GameModal from '@/components/modals/GameModal.vue'

interface Player {
  id: number
  name: string
  color: string
}

interface HexCell {
  id: number
  q: number // координата по оси q (колонка)
  r: number // координата по оси r (ряд)
  owner: number | null
  isStart: boolean
}

const showGameModal = ref<boolean>(false)

// Цвета игроков (Cyberpunk Gold palette)
const playerColors = ['#06D6A0', '#118AB2', '#EF476F', '#9B5DE5']

// Тестовые данные для вопроса
const currentQuestion = ref('В каком году на Руси появилась картошка?')
const currentAnswers = ref(['1698', '1750', '1812', '1920'])
const currentPlayers = ref<Player[]>([
  { id: 0, name: 'Игрок 1', color: playerColors[0] },
  { id: 1, name: 'Игрок 2', color: playerColors[1] },
])

// Обработка выбора ответа
const onAnswerSelected = (answerIndex: number) => {
  console.log('Выбран ответ:', answerIndex, currentAnswers.value[answerIndex])
  // Здесь будет логика проверки правильности ответа
}

// Обработка окончания времени на вопрос
const onQuestionTimeUp = () => {
  console.log('Время на вопрос истекло!')
  // Здесь будет логика при истечении времени
}

// Настройки
const playerCount = ref(4) // количество игроков (2-4)

// Конфигурация размера поля в зависимости от числа игроков
// Используем полные симметричные гексагональные сетки
const boardConfig = computed(() => {
  switch (playerCount.value) {
    case 2:
      return { radius: 1 }
    case 3:
      return { radius: 2 }
    case 4:
    default:
      return { radius: 2 }
  }
})

// Размер одного шестиугольника
const hexSize = 50 // px
const hexGap = 6 // расстояние между ячейками

// Конфигурация поля для разного количества игроков
const boardPresets: Record<
  number,
  {
    excluded: { q: number; r: number }[]
    starts: { q: number; r: number }[]
  }
> = {
  2: {
    excluded: [],
    starts: [
      { q: -1, r: 0 }, // Игрок 0
      { q: 1, r: 0 }, // Игрок 1
    ],
  },
  3: {
    excluded: [
      { q: -1, r: -1 },
      { q: -2, r: 0 },
      { q: -2, r: 1 },
      { q: 1, r: -2 },
      { q: 2, r: -2 },
      { q: 2, r: -1 },
      { q: -1, r: 2 },
      { q: 0, r: 2 },
      { q: 1, r: 1 },
    ],
    starts: [
      { q: 0, r: -2 }, // Игрок 0
      { q: -2, r: 2 }, // Игрок 1
      { q: 2, r: 0 }, // Игрок 2 — центр
    ],
  },
  4: {
    excluded: [
      { q: 0, r: -2 },
      { q: 0, r: 2 },
    ],
    starts: [
      { q: -2, r: 0 }, // Игрок 0 — левый
      { q: 2, r: 0 }, // Игрок 1 — правый
      { q: -2, r: 2 }, // Игрок 2 — левый нижний
      { q: 2, r: -2 }, // Игрок 3 — правый верхний
    ],
  },
}

// Получаем текущий пресет
const currentPreset = computed(() => boardPresets[playerCount.value] || boardPresets[4])

// Игроки
const players = ref<Player[]>(
  [
    { id: 0, name: 'Игрок 1', color: playerColors[0] },
    { id: 1, name: 'Игрок 2', color: playerColors[1] },
    { id: 2, name: 'Игрок 3', color: playerColors[2] },
    { id: 3, name: 'Игрок 4', color: playerColors[3] },
  ].slice(0, playerCount.value),
)

// Генерация шестиугольной сетки (axial coordinates)
const generateHexGrid = (radius: number): HexCell[] => {
  const cells: HexCell[] = []
  let id = 0

  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius)
    const r2 = Math.min(radius, -q + radius)
    for (let r = r1; r <= r2; r++) {
      cells.push({
        id: id++,
        q,
        r,
        owner: null,
        isStart: false,
      })
    }
  }

  return cells
}

// Получаем полную симметричную сетку
const cells = computed(() => {
  const allCells = generateHexGrid(boardConfig.value.radius)
  const { excluded } = currentPreset.value

  // Фильтруем исключённые ячейки
  const filtered = allCells.filter(
    (cell) => !excluded.some((ex) => ex.q === cell.q && ex.r === cell.r),
  )

  assignStartPositions(filtered)

  return filtered
})

// Назначение стартовых позиций
const assignStartPositions = (cells: HexCell[]) => {
  const { starts } = currentPreset.value

  starts.forEach((pos, index) => {
    const cell = cells.find((c) => c.q === pos.q && c.r === pos.r)
    if (cell) {
      cell.isStart = true
      cell.owner = index
    }
  })
}

// Конвертация axial координат в пиксели (с учётом gap)
const hexToPixel = (q: number, r: number) => {
  const size = hexSize + hexGap
  const x = size * ((3 / 2) * q)
  const y = size * ((Math.sqrt(3) / 2) * q + Math.sqrt(3) * r)
  return { x, y }
}

// Стиль для позиционирования ячейки
const getCellStyle = (cell: HexCell) => {
  const { x, y } = hexToPixel(cell.q, cell.r)
  return {
    '--hex-x': `${x}px`,
    '--hex-y': `${y}px`,
    '--hex-size': `${hexSize}px`,
    '--player-color': cell.owner !== null ? players.value[cell.owner]?.color : '#e0e0e0',
  }
}

// Размер контейнера поля
const boardContainerStyle = computed(() => {
  const size = (boardConfig.value.radius * 2 + 1) * (hexSize + hexGap) * 2
  return {
    width: `${size}px`,
    height: `${size}px`,
  }
})

// Подсчёт территорий игрока
const getPlayerTerritories = (playerId: number): number => {
  return cells.value.filter((c) => c.owner === playerId).length
}

// Обработка клика по ячейке
const onCellClick = (cell: HexCell) => {
  console.log('Clicked cell:', cell)
  showGameModal.value = true
}
</script>

<style scoped lang="scss">
.game {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: radial-gradient(ellipse at center, $second-background 0%, $background 100%);

  &__user {
    padding: 12px 16px;
    background: rgba($second-background, 0.95);
    border-radius: $border-radius;
    border: 2px solid;
    width: fit-content;
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: absolute;
    z-index: 10;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

    &.first {
      top: 16px;
      left: 16px;
      border-color: $player-1;
    }
    &.second {
      right: 16px;
      top: 16px;
      border-color: $player-2;
    }
    &.third {
      bottom: 16px;
      left: 16px;
      border-color: $player-3;
    }
    &.fourth {
      right: 16px;
      bottom: 16px;
      border-color: $player-4;
    }

    &-name {
      font-size: 1rem;
      font-weight: 600;
      color: $text-primary;
    }

    &-stat {
      font-size: 0.9rem;
      font-weight: 500;
      color: $text-secondary;

      span {
        font-weight: 700;
        color: $primary;
      }
    }
  }

  &__board {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    &-container {
      position: relative;
    }
  }

  &__chat {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
  }
}

// Шестиугольник
.hex {
  position: absolute;
  width: calc(var(--hex-size) * 2);
  height: calc(var(--hex-size) * 1.732);
  left: 50%;
  top: 50%;
  transform: translate(calc(-50% + var(--hex-x)), calc(-50% + var(--hex-y)));
  cursor: pointer;
  transition: transform 0.2s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--player-color);
    clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
    transition:
      filter 0.2s ease,
      box-shadow 0.2s ease;
  }

  &:hover {
    transform: translate(calc(-50% + var(--hex-x)), calc(-50% + var(--hex-y))) scale(1.1);
    z-index: 5;

    &::before {
      filter: brightness(1.2);
      box-shadow: 0 0 25px var(--player-color);
    }
  }

  &--neutral {
    &::before {
      background: $third-background;
      border: 1px solid $border;
    }

    &:hover::before {
      background: $surface-elevated;
      box-shadow: 0 0 15px $primary-glow;
    }
  }

  &--player-0::before {
    background: $player-1;
  }

  &--player-1::before {
    background: $player-2;
  }

  &--player-2::before {
    background: $player-3;
  }

  &--player-3::before {
    background: $player-4;
  }

  &--start {
    &::before {
      box-shadow: 0 0 20px var(--player-color),
                  0 0 40px rgba(var(--player-color), 0.3);
    }
  }
}
</style>
