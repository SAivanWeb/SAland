<template>
  <div class="game">
    <Chat
      v-if="gameId"
      class="game__chat"
      :class="{ 'game__chat--open': chatOpen }"
      :gameId="gameId"
      :closable="chatOpen"
      @close="chatOpen = false"
      @new-message="onNewMessage"
    />

    <div class="game__info-bar">
      <!-- Global game timer -->
      <div v-if="formattedGameTimer !== null" class="game__game-timer">
        <span>{{ formattedGameTimer }}</span>
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

      <!-- Chat toggle (mobile only) -->
      <button class="game__chat-toggle" @click="chatOpen = !chatOpen; hasUnread = false">
        <n-icon size="20"><ChatIcon /></n-icon>
        <span v-if="hasUnread" class="game__chat-badge" />
      </button>
    </div>

    <div class="game__users">
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
    <div
      class="game__board"
      @touchstart="onBoardTouchStart"
      @touchmove="onBoardTouchMove"
      @touchend="onBoardTouchEnd"
    >
      <!-- --attacker-color передаётся как CSS-переменная для цвета доступных ходов -->
      <div
        ref="boardContainerRef"
        class="game__board-container"
        :style="{ ...boardContainerStyle, '--attacker-color': currentTurnPlayer?.color, ...mobileBoardStyle }"
      >
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
        >
          <!-- Иконка мечей — только на доступных ходах по занятой чужой клетке (атака) -->
          <SwordsIcon v-if="isAttackMove(cell)" class="hex__sword" />
        </div>
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
      :message="gameStore.answerResult?.message ?? ''"
      @answer-selected="onAnswerSelected"
      @time-up="onQuestionTimeUp"
    />

    <GameEndModal />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { NProgress, NIcon } from 'naive-ui'
import GameModal from '@/components/modals/GameModal.vue'
import GameEndModal from '@/components/modals/GameEndModal.vue'
import { useGameStore } from '@/stores/useGameStore.ts'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { useWebSocket } from '@/api'
import Chat from '@/components/template/Chat.vue'

import { useGameTimers } from '@/composables/useGameTimers.ts'
import { useGamePlayers } from '@/composables/useGamePlayers.ts'
import { useGameBoard } from '@/composables/useGameBoard.ts'
import { useGameQuestion } from '@/composables/useGameQuestion.ts'
import { useGameForfeit } from '@/composables/useGameForfeit.ts'
import SwordsIcon from '@/assets/icons/swords.vue'
import ChatIcon from '@/assets/icons/chat.vue'

const ws = useWebSocket()
const gameStore = useGameStore()
const processingStore = useProcessingStore()

// ID текущей игры для компонента чата
const gameId = computed(() => gameStore.currentGameId ?? gameStore.currentGame?.game_id)

// Таймеры хода и глобальный таймер игры
const { turnTimerData, formattedGameTimer } = useGameTimers()

// Данные игроков, ходы, права на ответ
const { players, canAnswer, isMyCard, isCurrentTurnPlayer, currentTurnPlayer } = useGamePlayers()

// Отрисовка и взаимодействие с доской
const { boardContainerStyle, getCellStyle, isAvailableMove, isAttackMove, onCellClick } =
  useGameBoard()

// Модалка вопроса
const { questionSeconds, questionPlayers, onAnswerSelected, onQuestionTimeUp } = useGameQuestion()

// Двухэтапное подтверждение сдачи
const { forfeitConfirming, onForfeitConfirm } = useGameForfeit()

// Мобильный чат-оверлей
const chatOpen = ref(false)
const hasUnread = ref(false)

const onNewMessage = () => {
  if (!chatOpen.value) hasUnread.value = true
}

// Мобильный pinch-to-zoom + pan игровой доски
const boardContainerRef = ref<HTMLElement | null>(null)
const mobileScale = ref(1)
const mobilePanX = ref(0)
const mobilePanY = ref(0)

const SCALE_MIN = 0.5
const SCALE_MAX = 4

const mobileBoardStyle = computed(() => ({
  transform: `translate(${mobilePanX.value}px, ${mobilePanY.value}px) scale(${mobileScale.value})`,
  transformOrigin: 'center center',
}))

const _clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)

const clampPan = (x: number, y: number) => {
  const el = boardContainerRef.value
  if (!el) return { x, y }
  // offsetWidth/Height не меняются от CSS-трансформа — всегда натуральный размер
  const maxX = Math.max(0, (el.offsetWidth * mobileScale.value - window.innerWidth) / 2)
  const maxY = Math.max(0, (el.offsetHeight * mobileScale.value - window.innerHeight) / 2)
  return { x: _clamp(x, -maxX, maxX), y: _clamp(y, -maxY, maxY) }
}

const _touch = { isPinching: false, lastDist: 0, lastMidX: 0, lastMidY: 0, startX: 0, startY: 0 }

const onBoardTouchStart = (e: TouchEvent) => {
  if (window.innerWidth > 900) return
  if (e.touches.length === 1) {
    _touch.isPinching = false
    _touch.startX = e.touches[0].clientX - mobilePanX.value
    _touch.startY = e.touches[0].clientY - mobilePanY.value
  } else if (e.touches.length === 2) {
    _touch.isPinching = true
    const t0 = e.touches[0]; const t1 = e.touches[1]
    const dx = t1.clientX - t0.clientX; const dy = t1.clientY - t0.clientY
    _touch.lastDist = Math.sqrt(dx * dx + dy * dy)
    _touch.lastMidX = (t0.clientX + t1.clientX) / 2
    _touch.lastMidY = (t0.clientY + t1.clientY) / 2
  }
}

const onBoardTouchMove = (e: TouchEvent) => {
  if (window.innerWidth > 900) return
  e.preventDefault()
  if (e.touches.length === 1 && !_touch.isPinching) {
    const { x, y } = clampPan(
      e.touches[0].clientX - _touch.startX,
      e.touches[0].clientY - _touch.startY,
    )
    mobilePanX.value = x
    mobilePanY.value = y
  } else if (e.touches.length === 2) {
    const t0 = e.touches[0]; const t1 = e.touches[1]
    const dx = t1.clientX - t0.clientX; const dy = t1.clientY - t0.clientY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const midX = (t0.clientX + t1.clientX) / 2
    const midY = (t0.clientY + t1.clientY) / 2

    mobileScale.value = _clamp(mobileScale.value * (dist / _touch.lastDist), SCALE_MIN, SCALE_MAX)

    const { x, y } = clampPan(
      mobilePanX.value + (midX - _touch.lastMidX),
      mobilePanY.value + (midY - _touch.lastMidY),
    )
    mobilePanX.value = x
    mobilePanY.value = y

    _touch.lastDist = dist
    _touch.lastMidX = midX
    _touch.lastMidY = midY
  }
}

const onBoardTouchEnd = (e: TouchEvent) => {
  if (e.touches.length < 2) _touch.isPinching = false
}

// При монтировании переподключаемся к игре, если стор пустой (например, после перезагрузки страницы)
onMounted(() => {
  if (!gameStore.currentGame && !gameStore.isStarting) {
    processingStore.startLoading()
    ws.game.reconnect()
  }
})
</script>

<style scoped lang="scss">
.game {
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;
  background: $background;

  @media (max-width: 900px) {
    height: 100svh;
    display: flex;
    flex-direction: column;
    touch-action: none;
  }

  &__chat {
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);

    @media (max-width: 900px) {
      display: none;
      top: auto;
      bottom: 72px;
      right: 12px;
      transform: none;

      &--open {
        display: flex;
        z-index: 10;
      }
    }
  }

  &__chat-toggle {
    display: none;

    @media (max-width: 900px) {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid $border;
      background: #fff;
      box-shadow: $box-shadow;
      cursor: pointer;
      color: $text-dark;
    }
  }

  &__chat-badge {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: $error;
    border: 2px solid #fff;
    pointer-events: none;
  }

  &__info-bar {
    display: contents;

    @media (max-width: 900px) {
      order: 3;
      display: flex;
      align-items: center;
      gap: 12px;
      position: static;
      flex-shrink: 0;
      padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
      z-index: 10;

      .game__game-timer,
      .game__turn-indicator {
        position: static;
        transform: none;
        min-width: 0;
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
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
    gap: 6px;
    padding: 8px 12px;
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
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__users {
    display: none;
    position: absolute;
    top: 12px;
    left: 12px;
    right: 12px;
    z-index: 10;

    @media (max-width: 900px) {
      order: 1;
      position: static;
      flex-shrink: 0;
      display: flex;
      align-items: stretch;
      gap: 12px;
      padding: calc(8px + env(safe-area-inset-top)) 12px 4px;
      overflow-x: auto;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }

      & .game__user {
        display: flex;
        position: static;
        flex-shrink: 0;
      }
    }
  }

  &__user {
    padding: 12px 16px;
    background: #fff;
    border-radius: $border-radius;
    border: 2px solid $border;
    width: 100%;
    max-width: 220px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: absolute;
    z-index: 10;
    box-shadow: $box-shadow;

    @media (max-width: 900px) {
      display: none;
    }

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

    @media (max-width: 900px) {
      order: 2;
      position: relative;
      flex: 1;
      min-height: 0;
      top: auto;
      left: auto;
      right: auto;
      bottom: auto;
      transform: none;
      display: flex;
      align-items: center;
      justify-content: center;
      // Запрещаем браузерный скролл/зум — обрабатываем жесты сами
      touch-action: none;
    }

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

  // drop-shadow следует за hex-формой, нарисованной псевдоэлементами
  filter: drop-shadow(1px 2px 0px $border);
  transition:
    filter 0.1s ease,
    transform 0.15s ease;

  // Слой рамки: полноразмерный hex, цвет $border — виден по краям как обводка
  &::after {
    content: '';
    position: absolute;
    z-index: 0;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: $border;
    clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  }

  // Слой заливки: inset 2px внутрь, чтобы показать рамку по периметру
  &::before {
    content: '';
    position: absolute;
    z-index: 1;
    top: 2px;
    left: 2px;
    width: calc(100% - 4px);
    height: calc(100% - 4px);
    background: var(--player-color);
    clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
    transition:
      filter 0.15s ease,
      background 0.15s ease;
  }

  // Click: схлопываем тень и сдвигаем позицию — как у MainButton :active
  &:active {
    filter: drop-shadow(0px 0px 0px $border);
    transform: translate(calc(-50% + var(--hex-x) + 1px), calc(-50% + var(--hex-y) + 2px));
  }

  // Иконка мечей: поверх псевдоэлементов, по центру, белая
  &__sword {
    position: absolute;
    z-index: 2;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 38%;
    height: 38%;
    pointer-events: none;
    color: rgba(255, 255, 255, 0.9);
  }

  // Нейтральная (пустая) клетка
  &--neutral {
    &::before {
      background: #fff;
    }
  }

  // Доступный ход: заливка = цвет ходящего игрока, чуть светлее; рамка остаётся тёмной
  &--available {
    &::before {
      background: var(--attacker-color, $primary-yellow);
      filter: brightness(1.35);
    }
  }

  // Атакуемая клетка (доступный ход + занята врагом = иконка мечей):
  // рамка окрашивается в цвет владельца
  &--available.hex--player-0::after,
  &--available.hex--player-1::after,
  &--available.hex--player-2::after,
  &--available.hex--player-3::after {
    background: var(--player-color);
  }
}
</style>
