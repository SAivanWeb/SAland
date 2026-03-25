<template>
  <n-modal v-model:show="isVisible" :mask-closable="false" :close-on-esc="false">
    <n-card style="width: 800px" :bordered="false" size="huge" role="dialog" aria-modal="true">
      <div class="modal">
        <div class="modal__players" v-if="players && players.length > 0">
          <!-- Result phase -->
          <template v-if="phase === 'result'">
            <template v-if="isBattle">
              <div class="modal__players-result">
                <template v-if="resultType === 'battle_draw'">
                  <div class="modal__players-result-label modal__players-result-label--draw">Ничья</div>
                </template>
                <template v-else-if="winner">
                  <div class="modal__players-result-battle">
                    <span class="modal__players-result-battle-name" :style="{ color: winner.color }">{{ winner.name }}</span>
                    <span class="modal__players-result-battle-verb">победил</span>
                    <span class="modal__players-result-battle-name" :style="{ color: loser!.color }">{{ loser!.name }}</span>
                  </div>
                </template>
                <div v-else class="modal__players-result-label">Никто не ответил правильно</div>
              </div>
            </template>
            <template v-else>
              <div class="modal__players-solo">
                <div
                  class="modal__player"
                  :style="{ borderColor: players[0].color, backgroundColor: `${players[0].color}15` }"
                >
                  <div class="modal__player-indicator" :style="{ backgroundColor: players[0].color }" />
                  <div class="modal__player-name">{{ players[0].name }}</div>
                </div>
                <div
                  class="modal__players-solo-verdict"
                  :class="playerAnswerCorrect ? 'modal__players-solo-verdict--correct' : 'modal__players-solo-verdict--wrong'"
                >
                  {{ playerAnswerCorrect ? 'Правильно' : 'Неправильно' }}
                </div>
              </div>
            </template>
          </template>

          <!-- Question / waiting phase -->
          <template v-else>
            <template v-if="isBattle && players.length >= 2">
              <div class="modal__players-battle">
                <div
                  class="modal__player"
                  :style="{ borderColor: players[0].color, backgroundColor: `${players[0].color}15` }"
                >
                  <div class="modal__player-indicator" :style="{ backgroundColor: players[0].color }" />
                  <div class="modal__player-name">{{ players[0].name }}</div>
                </div>
                <div class="modal__players-battle-label">атакует</div>
                <div
                  class="modal__player"
                  :style="{ borderColor: players[1].color, backgroundColor: `${players[1].color}15` }"
                >
                  <div class="modal__player-indicator" :style="{ backgroundColor: players[1].color }" />
                  <div class="modal__player-name">{{ players[1].name }}</div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="modal__players-solo">
                <div class="modal__players-solo-label">Отвечает на вопрос</div>
                <div
                  class="modal__player"
                  :style="{ borderColor: players[0].color, backgroundColor: `${players[0].color}15` }"
                >
                  <div class="modal__player-indicator" :style="{ backgroundColor: players[0].color }" />
                  <div class="modal__player-name">{{ players[0].name }}</div>
                </div>
              </div>
            </template>
          </template>
        </div>

        <div class="modal__timer">
          <template v-if="phase === 'result'">
            <div class="modal__timer-label">Закрывается через {{ closingRemaining }} сек</div>
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
            <div class="modal__timer-waiting">Ждём ответа соперника...</div>
          </template>
          <template v-else>
            <div class="modal__timer-time">{{ formattedTime }}</div>
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

        <h2 class="modal__question">{{ question }}</h2>

        <div class="modal__answers">
          <div
            v-for="(answer, index) in answers"
            :key="index"
            class="modal__answer"
            :class="getAnswerClass(index)"
            :style="getAnswerStyle(index)"
            @click="onAnswerClick(index)"
          >
            <div class="modal__answer-header">Ответ {{ index + 1 }}</div>
            <h4 class="modal__answer-body">{{ answer }}</h4>
          </div>
        </div>
      </div>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { NModal, NCard, NProgress } from 'naive-ui'
import { ref, computed, watch, onUnmounted } from 'vue'

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

const closingPercentage = computed(() => {
  if (closingTotal.value === 0) return 0
  return (closingRemaining.value / closingTotal.value) * 100
})

// --- Победитель в батле ---
const winner = computed(() => {
  if (!props.isBattle || props.players.length < 2) return null
  if (props.resultType === 'battle_draw') return null
  if (props.resultType === 'battle_won') return props.players[0]
  if (props.resultType === 'battle_lost') return props.players[1]
  // fallback to answer flags when resultType not provided
  if (props.playerAnswerCorrect === true) return props.players[0]
  if (props.defenderAnswerCorrect === true) return props.players[1]
  return null
})

const loser = computed(() => {
  if (!winner.value || props.players.length < 2) return null
  return winner.value === props.players[0] ? props.players[1] : props.players[0]
})

// --- Индекс выбранного ответа (null = ещё не ответил) ---
const selectedAnswerIndex = ref<number | null>(null)

// --- Подсветка ответов ---
const getAnswerClass = (index: number) => {
  if (phase.value === 'result') {
    if (index === props.correctAnswerIndex) return { 'modal__answer--correct': true }
    const isPlayerWrong = props.playerAnswerIndex === index && props.playerAnswerCorrect === false
    const isDefenderWrong = props.defenderAnswerIndex === index && props.defenderAnswerCorrect === false
    if (isPlayerWrong || isDefenderWrong) return { 'modal__answer--wrong': true }
    return {}
  }
  if (!props.canAnswer) return { 'modal__answer--inactive': true }
  return {}
}

// Цвет выбранного ответа в фазе ожидания (батл: показываем свой выбор)
const getAnswerStyle = (index: number) => {
  if (phase.value === 'waiting' && index === selectedAnswerIndex.value && props.players.length > 0) {
    const color = props.players[0].color
    return { backgroundColor: `${color}30`, borderColor: color }
  }
  return {}
}

// --- Клик по ответу ---
const onAnswerClick = (answerIndex: number) => {
  if (selectedAnswerIndex.value !== null || phase.value !== 'question' || !props.canAnswer) return
  selectedAnswerIndex.value = answerIndex
  emit('answerSelected', answerIndex)
  // Модалка НЕ закрывается — ждём game:answer_result от сервера
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
.modal {
  display: flex;
  flex-direction: column;
  gap: 24px;

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
      gap: 12px;

      &-label {
        @include body-1;
        color: $text-grey;
        white-space: nowrap;
      }

      &-verdict {
        @include body-1-bold;
        padding: 6px 16px;
        border-radius: $border-radius;
        white-space: nowrap;

        &--correct {
          color: #276749;
          background: #c6f6d5;
          border: 2px solid #48bb78;
        }

        &--wrong {
          color: #9b2c2c;
          background: #fed7d7;
          border: 2px solid #fc8181;
        }
      }
    }

    &-result {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      width: 100%;

      &-label {
        @include body-1;
        color: $text-grey;

        &--draw {
          @include body-1-bold;
          color: $text-dark;
        }
      }

      &-battle {
        display: flex;
        align-items: center;
        gap: 10px;

        &-name {
          @include body-1-bold;
          font-size: 1.2rem;
        }

        &-verb {
          @include body-1;
          color: $text-grey;
        }
      }
    }
  }

  &__player {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: $border-radius;
    border: 2px solid;
    background: $background;
    box-shadow: $box-shadow;

    &-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    &-name {
      @include body-1-bold;
      color: $text-dark;
    }

    &--winner {
      padding: 10px 20px;
      font-size: 1.1rem;
    }
  }

  &__timer {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;

    &-time {
      font-size: 2.5rem;
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

  &__question {
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
    margin: 0;
    color: $text-dark;
  }

  &__answers {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 12px;
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

:deep(.n-card) {
  background: $background !important;
  border: 2px solid $border !important;
  box-shadow: $box-shadow !important;
  border-radius: $border-radius !important;
}
</style>
