<template>
  <n-modal v-model:show="isVisible" :mask-closable="false" :close-on-esc="false">
    <n-card style="width: 800px" :bordered="false" size="huge" role="dialog" aria-modal="true">
      <div class="modal">
        <div class="modal__players" v-if="players && players.length > 0">
          <div class="modal__players-list">
            <div
              v-for="player in players"
              :key="player.id"
              class="modal__player"
              :style="{ borderColor: player.color, backgroundColor: `${player.color}15` }"
            >
              <div class="modal__player-indicator" :style="{ backgroundColor: player.color }" />
              <div class="modal__player-name">{{ player.name }}</div>
            </div>
          </div>
        </div>

        <div class="modal__timer">
          <div class="modal__timer-time">{{ formattedTime }}</div>
          <n-progress
            type="line"
            :percentage="percentage"
            :show-indicator="false"
            :height="8"
            :border-radius="4"
            color="#fed787"
          />
        </div>
        <h2 class="modal__question">{{ question }}</h2>
        <div class="modal__answers">
          <div
            v-for="(answer, index) in answers"
            :key="index"
            class="modal__answer"
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
}

const props = withDefaults(defineProps<Props>(), {
  seconds: 30,
  question: 'В каком году на Руси появилась картошка?',
  answers: () => ['1698', '1750', '1812', '1920'],
  players: () => [],
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

const remainingTime = ref(props.seconds)
let intervalId: number | null = null

// Форматирование времени в MM:SS
const formattedTime = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60)
  const seconds = remainingTime.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// Процент оставшегося времени
const percentage = computed(() => {
  return (remainingTime.value / props.seconds) * 100
})

// Запуск таймера
const startTimer = () => {
  stopTimer()
  remainingTime.value = props.seconds

  intervalId = window.setInterval(() => {
    remainingTime.value--

    if (remainingTime.value <= 0) {
      stopTimer()
      emit('timeUp')
      isVisible.value = false
    }
  }, 1000)
}

// Остановка таймера
const stopTimer = () => {
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// Обработка выбора ответа
const onAnswerClick = (answerIndex: number) => {
  emit('answerSelected', answerIndex)
  stopTimer()
  isVisible.value = false
}

// Следим за открытием модального окна
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      startTimer()
    } else {
      stopTimer()
    }
  },
)

// Очистка при размонтировании
onUnmounted(() => {
  stopTimer()
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

    &-list {
      display: flex;
      gap: 12px;
      justify-content: space-between;
      flex-wrap: wrap;
      width: 100%;
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
