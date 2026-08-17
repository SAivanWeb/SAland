<template>
  <ModalContainer
    v-model:show="isVisible"
    modal-width="min(800px, 95vw)"
    :mask-closable="false"
    :close-on-esc="false"
    :show-close="false"
  >
    <template #body>
      <!-- Timer -->
      <div class="game-modal__timer">
        <template v-if="phase === 'result'">
          <div class="game-modal__timer-label">Закрывается через {{ closingRemaining }} сек</div>
          <n-progress
            type="line"
            :percentage="closingPercentage"
            :show-indicator="false"
            :height="8"
            :border-radius="4"
            color="#fed787"
          />
        </template>
        <template v-else-if="phase === 'waiting'">
          <div class="game-modal__timer-waiting">Ждём ответа соперника...</div>
        </template>
        <template v-else>
          <div class="game-modal__timer-time">{{ formattedTime }}</div>
          <n-progress
            type="line"
            :percentage="percentage"
            :show-indicator="false"
            :height="8"
            :border-radius="4"
            color="#fed787"
          />
        </template>
      </div>

      <!-- Players -->
      <div class="game-modal__players" v-if="players && players.length > 0">
        <template v-if="phase === 'result'">
          <template v-if="isBattle && players[0] && players[1]">
            <div class="game-modal__players-battle">
              <div class="game-modal__player" :style="{ color: players[0].color }">
                {{ players[0].name }}
              </div>
              <div class="game-modal__players-battle-label">{{ message }}</div>
              <div class="game-modal__player" :style="{ color: players[1].color }">
                {{ players[1].name }}
              </div>
            </div>
          </template>
          <template v-else>
            <div class="game-modal__players-solo">
              <div class="game-modal__players-battle-label">{{ message }}</div>
            </div>
          </template>
        </template>

        <template v-else>
          <template v-if="isBattle && players[0] && players[1]">
            <div class="game-modal__players-battle">
              <div class="game-modal__player" :style="{ color: players[0].color }">
                {{ players[0].name }}
              </div>
              <div class="game-modal__players-battle-label">атакует</div>
              <div class="game-modal__player" :style="{ color: players[1].color }">
                {{ players[1].name }}
              </div>
            </div>
          </template>
          <template v-else-if="players[0]">
            <div class="game-modal__players-solo">
              <div class="game-modal__players-solo-label">Отвечает:</div>
              <div class="game-modal__player" :style="{ color: players[0].color }">
                {{ players[0].name }}
              </div>
            </div>
          </template>
        </template>
      </div>

      <!-- Question -->
      <h3 class="game-modal__question">{{ question }}</h3>

      <!-- Answers -->
      <div class="game-modal__answers">
        <div
          v-for="(answer, index) in answers"
          :key="index"
          class="game-modal__answer"
          :class="getAnswerClass(index)"
          :style="getAnswerStyle(index)"
          @click="onAnswerClick(index)"
        >
          <div class="game-modal__answer-header">Ответ {{ index + 1 }}</div>
          <h4 class="game-modal__answer-body">{{ answer }}</h4>
        </div>
      </div>
    </template>
  </ModalContainer>
</template>

<script setup lang="ts">
import { NProgress } from 'naive-ui'
import { ref, computed, watch, onUnmounted } from 'vue'
import ModalContainer from '@/components/template/ModalContainer.vue'

interface Player {
  id: number
  name: string
  color: string
}

interface Props {
  isOpen: boolean
  seconds?: number
  question?: string
  answers?: string[]
  players?: Player[]
  waitingForOpponent?: boolean
  correctAnswerIndex?: number | null
  playerAnswerIndex?: number | null
  playerAnswerCorrect?: boolean
  defenderAnswerIndex?: number | null
  defenderAnswerCorrect?: boolean
  isBattle?: boolean
  canAnswer?: boolean
  resultType?: string | null
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  seconds: 30,
  question: '',
  answers: () => [],
  players: () => [],
  waitingForOpponent: false,
  correctAnswerIndex: null,
  playerAnswerIndex: null,
  playerAnswerCorrect: undefined,
  defenderAnswerIndex: null,
  defenderAnswerCorrect: undefined,
  isBattle: false,
  canAnswer: true,
  resultType: null,
  message: '',
})

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  timeUp: []
  answerSelected: [answerIndex: number]
}>()

const isVisible = computed({
  get: () => props.isOpen,
  set: (value) => emit('update:isOpen', value),
})

// --- Фаза модалки ---
const phase = computed(() => {
  if (props.correctAnswerIndex != null) return 'result'
  if (props.waitingForOpponent) return 'waiting'
  return 'question'
})

// --- Таймер вопроса ---
const remainingTime = ref(props.seconds)
let questionInterval: number | null = null

const startQuestionTimer = () => {
  stopQuestionTimer()
  remainingTime.value = props.seconds
  questionInterval = window.setInterval(() => {
    remainingTime.value--
    if (remainingTime.value <= 0) {
      stopQuestionTimer()
      emit('timeUp')
    }
  }, 1000)
}

const stopQuestionTimer = () => {
  if (questionInterval !== null) {
    clearInterval(questionInterval)
    questionInterval = null
  }
}

const formattedTime = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60)
  const seconds = remainingTime.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const percentage = computed(() => (remainingTime.value / props.seconds) * 100)

// --- Таймер закрытия (после получения результата) ---
const closingTotal = computed(() => (props.isBattle ? 7 : 5))
const closingRemaining = ref(0)
let closingInterval: number | null = null

const startClosingCountdown = () => {
  stopClosingCountdown()
  closingRemaining.value = closingTotal.value
  closingInterval = window.setInterval(() => {
    if (closingRemaining.value > 0) closingRemaining.value--
    if (closingRemaining.value <= 0) stopClosingCountdown()
  }, 1000)
}

const stopClosingCountdown = () => {
  if (closingInterval !== null) {
    clearInterval(closingInterval)
    closingInterval = null
  }
}

const closingPercentage = computed(() => (closingRemaining.value / closingTotal.value) * 100)

// --- Индекс выбранного ответа ---
const selectedAnswerIndex = ref<number | null>(null)

// --- Подсветка ответов ---
const getAnswerClass = (index: number) => {
  if (phase.value === 'result') {
    if (index === props.correctAnswerIndex) return { 'game-modal__answer--correct': true }
    const isPlayerWrong = props.playerAnswerIndex === index && props.playerAnswerCorrect === false
    const isDefenderWrong =
      props.defenderAnswerIndex === index && props.defenderAnswerCorrect === false
    if (isPlayerWrong || isDefenderWrong) return { 'game-modal__answer--wrong': true }
    return {}
  }
  if (!props.canAnswer) return { 'game-modal__answer--inactive': true }
  return {}
}

const getAnswerStyle = (index: number) => {
  const firstPlayer = props.players[0]
  if (phase.value === 'waiting' && index === selectedAnswerIndex.value && firstPlayer) {
    const color = firstPlayer.color
    return { backgroundColor: `${color}30`, borderColor: color }
  }
  return {}
}

// --- Клик по ответу ---
const onAnswerClick = (answerIndex: number) => {
  if (selectedAnswerIndex.value !== null || phase.value !== 'question' || !props.canAnswer) return
  selectedAnswerIndex.value = answerIndex
  emit('answerSelected', answerIndex)
}

// --- Переходы между фазами ---
watch(phase, (newPhase, oldPhase) => {
  if (oldPhase === 'question' && newPhase !== 'question') {
    stopQuestionTimer()
  }
  if (newPhase === 'result') {
    startClosingCountdown()
  }
})

// --- Открытие/закрытие модалки ---
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      selectedAnswerIndex.value = null
      closingRemaining.value = 0
      stopClosingCountdown()
      startQuestionTimer()
    } else {
      stopQuestionTimer()
      stopClosingCountdown()
    }
  },
)

onUnmounted(() => {
  stopQuestionTimer()
  stopClosingCountdown()
})
</script>

<style scoped lang="scss">
.game-modal {
  &__question {
    min-width: 0;
    flex: 1;
    font-weight: 700;
    color: $text-dark;
  }

  &__players {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;

    &-battle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 12px;

      &-label {
        @include body-1-bold;
        color: $text-grey;
        white-space: nowrap;
      }
    }

    &-solo {
      display: flex;
      align-items: center;
      gap: 6px;

      &-label {
        @include body-1;
        color: $text-grey;
        white-space: nowrap;
      }
    }
  }

  &__player {
    font-size: 16px;
    font-weight: 600;
  }

  &__timer {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;

    &-time {
      font-size: $fs-head-extra;
      font-weight: 700;
      color: $text-dark;
      font-variant-numeric: tabular-nums;
    }

    &-label {
      @include body-2;
      color: $text-grey;
      font-variant-numeric: tabular-nums;
    }

    &-waiting {
      @include body-1-bold;
      color: $text-grey;
    }
  }

  &__answers {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;

    @include sm {
      grid-template-columns: 1fr;
    }
  }

  &__answer {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    border-radius: $border-radius;
    border: 2px solid $border;
    box-shadow: $box-shadow;
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      transform 0.1s ease,
      box-shadow 0.1s ease;
    background: #fff;

    &:hover {
      background: $primary-yellow;
      border-color: $border;
    }

    &:active {
      box-shadow: 0px 0px 0px $border;
      transform: translate(1px, 2px);
    }

    &--correct {
      background: #c6f6d5 !important;
      border-color: #48bb78 !important;
      cursor: default;

      &:hover {
        background: #c6f6d5 !important;
      }
    }

    &--wrong {
      background: #fed7d7 !important;
      border-color: #fc8181 !important;
      cursor: default;

      &:hover {
        background: #fed7d7 !important;
      }
    }

    &--inactive {
      cursor: default;

      &:hover {
        background: #fff;
        border-color: $border;
      }

      &:active {
        box-shadow: $box-shadow;
        transform: none;
      }
    }

    &-header {
      @include body-2-up;
      color: $text-grey;
    }

    &-body {
      @include body-1-bold;
      font-size: 18px;
      margin: 0;
      color: $text-dark;
    }
  }
}
</style>
