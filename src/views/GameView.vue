<template>
  <div class="game">
    <Chat v-if="gameId" class="game__chat" :gameId="gameId" />

    <!-- Global game timer -->
    <div v-if="formattedGameTimer !== null" class="game__game-timer">
      До конца: <span>{{ formattedGameTimer }}</span>
    </div>

    <!-- Current turn indicator -->
    <div
      v-if="currentTurnPlayer && !gameStore.currentQuestion"
      class="game__turn-indicator"
      :style="{ borderColor: currentTurnPlayer.color }"
    >
      <span class="game__turn-label">Ходит:</span>
      <span class="game__turn-name" :style="{ color: currentTurnPlayer.color }">{{
        currentTurnPlayer.name
      }}</span>
    </div>

    <!-- Player panels -->
    <div
      class="game__user first"
      v-if="players.length >= 1"
      :style="{ borderColor: players[0].color }"
    >
      <div class="game__user-header">
        <div class="game__user-name">{{ players[0]?.name }}</div>
        <template v-if="isMyCard(0)">
          <button
            v-if="!forfeitConfirming"
            class="game__forfeit-btn"
            @click="forfeitConfirming = true"
          >
            Сдаться
          </button>
          <div v-else class="game__forfeit-confirm">
            <button
              class="game__forfeit-btn game__forfeit-btn--cancel"
              @click="forfeitConfirming = false"
            >
              Нет
            </button>
            <button class="game__forfeit-btn game__forfeit-btn--ok" @click="onForfeitConfirm">
              Да
            </button>
          </div>
        </template>
      </div>
      <div class="game__user-stat">
        Захвачено: <span>{{ players[0]?.territories_count }}</span>
      </div>
      <n-progress
        v-if="isCurrentTurnPlayer(0) && !gameStore.currentQuestion"
        type="line"
        :percentage="turnTimerData?.percentage ?? 0"
        :show-indicator="false"
        :height="4"
        :border-radius="2"
        :color="turnTimerData?.isExtra ? '#EF476F' : '#fed787'"
      />
    </div>

    <div
      class="game__user second"
      v-if="players.length >= 2"
      :style="{ borderColor: players[1].color }"
    >
      <div class="game__user-header">
        <div class="game__user-name">{{ players[1]?.name }}</div>
        <template v-if="isMyCard(1)">
          <button
            v-if="!forfeitConfirming"
            class="game__forfeit-btn"
            @click="forfeitConfirming = true"
          >
            Сдаться
          </button>
          <div v-else class="game__forfeit-confirm">
            <button
              class="game__forfeit-btn game__forfeit-btn--cancel"
              @click="forfeitConfirming = false"
            >
              Нет
            </button>
            <button class="game__forfeit-btn game__forfeit-btn--ok" @click="onForfeitConfirm">
              Да
            </button>
          </div>
        </template>
      </div>
      <div class="game__user-stat">
        Захвачено: <span>{{ players[1]?.territories_count }}</span>
      </div>
      <n-progress
        v-if="isCurrentTurnPlayer(1) && !gameStore.currentQuestion"
        type="line"
        :percentage="turnTimerData?.percentage ?? 0"
        :show-indicator="false"
        :height="4"
        :border-radius="2"
        :color="turnTimerData?.isExtra ? '#EF476F' : '#fed787'"
      />
    </div>

    <div
      class="game__user third"
      v-if="players.length >= 3"
      :style="{ borderColor: players[2].color }"
    >
      <div class="game__user-header">
        <div class="game__user-name">{{ players[2]?.name }}</div>
        <template v-if="isMyCard(2)">
          <button
            v-if="!forfeitConfirming"
            class="game__forfeit-btn"
            @click="forfeitConfirming = true"
          >
            Сдаться
          </button>
          <div v-else class="game__forfeit-confirm">
            <button
              class="game__forfeit-btn game__forfeit-btn--cancel"
              @click="forfeitConfirming = false"
            >
              Нет
            </button>
            <button class="game__forfeit-btn game__forfeit-btn--ok" @click="onForfeitConfirm">
              Да
            </button>
          </div>
        </template>
      </div>
      <div class="game__user-stat">
        Захвачено: <span>{{ players[2]?.territories_count }}</span>
      </div>
      <n-progress
        v-if="isCurrentTurnPlayer(2) && !gameStore.currentQuestion"
        type="line"
        :percentage="turnTimerData?.percentage ?? 0"
        :show-indicator="false"
        :height="4"
        :border-radius="2"
        :color="turnTimerData?.isExtra ? '#EF476F' : '#fed787'"
      />
    </div>

    <div
      class="game__user fourth"
      v-if="players.length >= 4"
      :style="{ borderColor: players[3].color }"
    >
      <div class="game__user-header">
        <div class="game__user-name">{{ players[3]?.name }}</div>
        <template v-if="isMyCard(3)">
          <button
            v-if="!forfeitConfirming"
            class="game__forfeit-btn"
            @click="forfeitConfirming = true"
          >
            Сдаться
          </button>
          <div v-else class="game__forfeit-confirm">
            <button
              class="game__forfeit-btn game__forfeit-btn--cancel"
              @click="forfeitConfirming = false"
            >
              Нет
            </button>
            <button class="game__forfeit-btn game__forfeit-btn--ok" @click="onForfeitConfirm">
              Да
            </button>
          </div>
        </template>
      </div>
      <div class="game__user-stat">
        Захвачено: <span>{{ players[3]?.territories_count }}</span>
      </div>
      <n-progress
        v-if="isCurrentTurnPlayer(3) && !gameStore.currentQuestion"
        type="line"
        :percentage="turnTimerData?.percentage ?? 0"
        :show-indicator="false"
        :height="4"
        :border-radius="2"
        :color="turnTimerData?.isExtra ? '#EF476F' : '#fed787'"
      />
    </div>

    <!-- Game board -->
    <div class="game__board">
      <div class="game__board-container" :style="boardContainerStyle">
        <div
          v-for="cell in gameStore.cells"
          :key="`${cell.q},${cell.r}`"
          class="hex"
          :class="[
            cell.player_index !== null ? `hex--player-${cell.player_index}` : 'hex--neutral',
            { 'hex--start': cell.is_base },
            { 'hex--available': isAvailableMove(cell) },
          ]"
          :style="getCellStyle(cell)"
          @click="onCellClick(cell)"
        />
      </div>
    </div>

    <GameModal
      :is-open="!!gameStore.currentQuestion"
      :seconds="questionSeconds"
      :question="gameStore.currentQuestion?.question"
      :answers="gameStore.currentQuestion?.answers"
      :players="questionPlayers"
      :waiting-for-opponent="gameStore.waitingForOpponent"
      :correct-answer-index="gameStore.answerResult?.correct_answer_index ?? null"
      :player-answer-index="gameStore.answerResult?.result.player_answer?.answer_index ?? null"
      :player-answer-correct="gameStore.answerResult?.result.player_answer?.is_correct"
      :defender-answer-index="gameStore.answerResult?.result.defender_answer?.answer_index ?? null"
      :defender-answer-correct="gameStore.answerResult?.result.defender_answer?.is_correct"
      :is-battle="!!gameStore.currentQuestion?.is_battle"
      :can-answer="canAnswer"
      :result-type="gameStore.answerResult?.result.type ?? null"
      @answer-selected="onAnswerSelected"
      @time-up="onQuestionTimeUp"
    />

    <GameEndModal />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { NProgress } from 'naive-ui'
import GameModal from '@/components/modals/GameModal.vue'
import GameEndModal from '@/components/modals/GameEndModal.vue'
import { useGameStore } from '@/stores/useGameStore.ts'
import { useUserStore } from '@/stores/useUserStore.ts'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { useWebSocket } from '@/api'
import type { HexCell } from '@/api'
import Chat from '@/components/template/Chat.vue'

const ws = useWebSocket()
const gameStore = useGameStore()
const userStore = useUserStore()
const processingStore = useProcessingStore()

const hexSize = 50
const hexGap = 6

const gameId = computed(() => gameStore.currentGameId ?? gameStore.currentGame?.game_id)

// Tick every 100ms for smooth timer progress
const now = ref(Date.now())
let clockInterval: number | null = null

// Игроки отсортированы по player_index
const players = computed(() =>
  [...gameStore.players].sort((a, b) => a.player_index - b.player_index),
)

// Индекс текущего пользователя в игре
const myPlayerIndex = computed(() => {
  if (!userStore.currentUser) return null
  const me = gameStore.players.find((p) => p.user_id === userStore.currentUser!.user.id)
  return me?.player_index ?? null
})

// Могу ли я отвечать на текущий вопрос
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

// Мой ли сейчас ход
const isMyTurn = computed(
  () =>
    gameStore.currentTurn !== null &&
    gameStore.currentTurn.current_player_index === myPlayerIndex.value,
)

// Карточка текущего пользователя
const isMyCard = (sortedIdx: number) =>
  players.value[sortedIdx]?.player_index === myPlayerIndex.value

// Карточка текущего ходящего игрока
const isCurrentTurnPlayer = (sortedIdx: number) =>
  players.value[sortedIdx]?.player_index === gameStore.currentTurn?.current_player_index

// Данные о текущем ходящем игроке
const currentTurnPlayer = computed(() => {
  if (!gameStore.currentTurn) return null
  return (
    gameStore.players.find((p) => p.player_index === gameStore.currentTurn!.current_player_index) ??
    null
  )
})

// Таймер хода с определением фазы (обычное/доп. время)
const turnTimerData = computed(() => {
  const turn = gameStore.currentTurn
  if (!turn) return null

  const elapsed = now.value - turn.started_at
  const timeLimitMs = turn.time_limit
  const extraTimeMs = turn.extra_time_remaining
  const normalRemaining = timeLimitMs - elapsed

  if (normalRemaining > 0) {
    return {
      percentage: (normalRemaining / timeLimitMs) * 100,
      isExtra: false,
    }
  }

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

// Глобальный игровой таймер (до конца игры)
const formattedGameTimer = computed(() => {
  if (!gameStore.gameTimerEndsAt) return null
  const remaining = Math.max(0, gameStore.gameTimerEndsAt - now.value)
  const hours = Math.floor(remaining / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)
  if (hours > 0) return `${hours} ч ${minutes} мин`
  if (minutes > 0) return `${minutes} мин ${seconds} сек`
  return `${seconds} сек`
})

// Доступные ходы в виде Set для быстрого поиска
const availableMoveSet = computed(() => {
  if (!isMyTurn.value || !gameStore.currentTurn) return new Set<string>()
  return new Set((gameStore.currentTurn.available_moves ?? []).map((m) => `${m.q},${m.r}`))
})

const isAvailableMove = (cell: HexCell) => availableMoveSet.value.has(`${cell.q},${cell.r}`)

// Конвертация axial координат в пиксели
const hexToPixel = (q: number, r: number) => {
  const size = hexSize + hexGap
  const x = size * ((3 / 2) * q)
  const y = size * ((Math.sqrt(3) / 2) * q + Math.sqrt(3) * r)
  return { x, y }
}

// Стиль для позиционирования ячейки
const getCellStyle = (cell: HexCell) => {
  const { x, y } = hexToPixel(cell.q, cell.r)
  const owner =
    cell.player_index !== null
      ? gameStore.players.find((p) => p.player_index === cell.player_index)
      : null
  return {
    '--hex-x': `${x}px`,
    '--hex-y': `${y}px`,
    '--hex-size': `${hexSize}px`,
    '--player-color': owner ? owner.color : '#e0e0e0',
  }
}

// Радиус сетки по кол-ву игроков
const boardRadius = computed(() => (players.value.length <= 2 ? 1 : 2))

const boardContainerStyle = computed(() => {
  const size = (boardRadius.value * 2 + 1) * (hexSize + hexGap) * 2
  return { width: `${size}px`, height: `${size}px` }
})

// Клик по ячейке — только в свой ход, только по доступным
const onCellClick = (cell: HexCell) => {
  if (!isMyTurn.value || gameStore.currentQuestion) return
  if (!isAvailableMove(cell)) return
  ws.game.selectCell({ q: cell.q, r: cell.r })
}

// Секунды на ответ из серверного time_limit (мс)
const questionSeconds = computed(() => {
  if (!gameStore.currentQuestion) return 30
  return Math.floor(gameStore.currentQuestion.time_limit / 1000)
})

// Игроки для модалки вопроса
const questionPlayers = computed(() => {
  if (!gameStore.currentQuestion) return []
  const result: { id: number; name: string; color: string }[] = []

  const attackerIndex = gameStore.currentTurn?.current_player_index ?? null
  if (attackerIndex !== null) {
    const attacker = gameStore.players.find((p) => p.player_index === attackerIndex)
    if (attacker) result.push({ id: attacker.player_index, name: attacker.name, color: attacker.color })
  }

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

const onAnswerSelected = (answerIndex: number) => {
  ws.game.answer({ answer_index: answerIndex })
}

const onQuestionTimeUp = () => {
  // Таймаут обрабатывается на сервере
}

// Сдаться
const forfeitConfirming = ref(false)

const onForfeitConfirm = () => {
  ws.game.forfeit()
  forfeitConfirming.value = false
}

onMounted(() => {
  clockInterval = window.setInterval(() => {
    now.value = Date.now()
  }, 100)

  if (!gameStore.currentGame && !gameStore.isStarting) {
    processingStore.startLoading()
    ws.game.reconnect()
  }
})

onUnmounted(() => {
  if (clockInterval !== null) {
    clearInterval(clockInterval)
    clockInterval = null
  }
})
</script>

<style scoped lang="scss">
.game {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: $background;

  &__chat {
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
  }

  &__game-timer {
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    padding: 8px 20px;
    background: #fff;
    border-radius: $border-radius;
    border: 2px solid $border;
    box-shadow: $box-shadow;
    @include body-2;
    color: $text-grey;
    white-space: nowrap;

    span {
      @include body-1-bold;
      color: $text-dark;
      font-variant-numeric: tabular-nums;
    }
  }

  &__turn-indicator {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    background: #fff;
    border-radius: $border-radius;
    border: 2px solid $border;
    box-shadow: $box-shadow;
  }

  &__turn-label {
    @include body-2;
    color: $text-grey;
  }

  &__turn-name {
    @include body-1-bold;
  }

  &__user {
    padding: 12px 16px;
    background: #fff;
    border-radius: $border-radius;
    border: 2px solid $border;
    width: 180px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: absolute;
    z-index: 10;
    box-shadow: $box-shadow;

    &.first {
      top: 16px;
      left: 16px;
    }
    &.second {
      right: 16px;
      top: 16px;
    }
    &.third {
      bottom: 16px;
      left: 16px;
    }
    &.fourth {
      right: 16px;
      bottom: 16px;
    }

    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    &-name {
      @include body-1-bold;
      color: $text-dark;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &-stat {
      @include body-2;
      color: $text-grey;

      span {
        @include body-2-bold;
        color: $text-dark;
      }
    }
  }

  &__forfeit-btn {
    padding: 2px 8px;
    border-radius: $border-radius;
    border: 2px solid $border;
    background: #fff;
    cursor: pointer;
    @include caption;
    color: $text-grey;
    white-space: nowrap;
    transition:
      background-color 0.15s ease,
      transform 0.1s ease,
      box-shadow 0.1s ease;
    box-shadow: $box-shadow;
    flex-shrink: 0;

    &:hover {
      background: $primary-red;
      color: $text-dark;
    }

    &:active {
      box-shadow: 0px 0px 0px $border;
      transform: translate(1px, 2px);
    }

    &--cancel {
      background: #fff;

      &:hover {
        background: $primary-green;
      }
    }

    &--ok {
      background: $primary-red;

      &:hover {
        background: darken(#fea89a, 10%);
      }
    }
  }

  &__forfeit-confirm {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
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
    transition: filter 0.2s ease;
  }

  &:hover {
    transform: translate(calc(-50% + var(--hex-x)), calc(-50% + var(--hex-y))) scale(1.1);
    z-index: 5;

    &::before {
      filter: brightness(1.15);
    }
  }

  &--neutral {
    &::before {
      background: #fff;
    }

    &:hover::before {
      background: $primary-yellow;
    }
  }

  &--start::before {
    filter: brightness(1.2);
  }

  &--available {
    &::before {
      background: $primary-red;
      filter: brightness(1.1);
    }
  }

  &--available.hex--player-0::before,
  &--available.hex--player-1::before,
  &--available.hex--player-2::before,
  &--available.hex--player-3::before {
    filter: brightness(1.25);
  }
}
</style>
