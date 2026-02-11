<template>
  <div class="create">
    <div class="create__container">
      <h1>Создание игры</h1>
      <GameWaiting v-if="0" role="admin"/>
      <div class="create__card">
        <h3 class="create__card-title">Параметры</h3>
        <div class="create__card-content">
          <div class="create__card-param">
            <MainSelect
              name="players"
              :options="playersOption"
              v-model="gamePlayers"
              placeholder="Количество игроков"
              label="Количество игроков"
            />
            <MainSelect
              name="time"
              :options="timeQuestionOption"
              v-model="answerTime"
              placeholder="Время для ответа"
              label="Время для ответа"
            />
            <MainSelect
              name="time"
              :options="timeTurnOption"
              v-model="answerTime"
              placeholder="Время для хода"
              label="Время для хода"
            />
            <MainSelect
              name="time"
              :options="timerOption"
              v-model="timer"
              placeholder="Таймер игры"
              label="Таймер игры"
            />
          </div>
        </div>
      </div>
      <div class="create__card">
        <h3 class="create__card-title">Тема</h3>
        <div class="create__card-content">
          <n-tabs default-value="generate" type="segment" size="medium" justify-content="space-evenly">
            <n-tab-pane name="generate" tab="ИИ генерация">
              <div class="create__generate">
                <div class="create__generate-header">
                  <MainInput
                    name="generateThemeName"
                    label="Название темы"
                    placeholder="Спорт, CS 2, история Руси и т.д."
                    v-model="generateThemeName"
                    size="large"
                  />
                  <MainButton title="Сгенерировать" size="large" color="red"/>
                </div>
              </div>
            </n-tab-pane>
            <n-tab-pane name="manual" tab="Ручное создание">
              <div class="create__manual">
                <div class="create__manual-fields">
                  <MainInput name="manualThemeName" placeholder="Название темы" label="Укажите название темы" v-model="manualThemeName"/>
                  <MainButton title="Получить" @click="getPrompt" :disabled="!manualThemeName"/>
                </div>
                <div v-if="showProcessUpload" class="create__manual-upload">
                  <h4>Прогресс создания темы</h4>
                  <p>Получено вопросов: <span>{{questionUploaded}}/80</span></p>
                  <MainButton title="Загрузить" @click="uploadQuestions"/>
                  <div v-if="showPasteError" class="create__manual-fields">
                    <MainInput name="manualThemeName" placeholder="Вставьте вопросы" label="Сгенерированные вопросы" v-model="questionsArray"/>
                    <MainButton title="Загрузить" @click="uploadQuestionsManually" :disabled="!questionsArray"/>
                  </div>
                </div>
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MainSelect from '@/components/ui/select/MainSelect.vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import GameWaiting from '@/components/games/GameWaiting.vue'
import { type RoomUpdateParamsPayload, useWebSocket } from '@/api'
import type { RoomState } from '@/api/modules/types'
import {NTabs, NTabPane} from 'naive-ui'
import MainInput from '@/components/ui/input/MainInput.vue'
import MainButton from '@/components/ui/button/MainButton.vue'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'

const ws = useWebSocket()
const processingStore = useProcessingStore()

const gamePlayers = ref<number>(2)
const answerTime = ref<number>(20)
const turnTime = ref<number>(20)
const timer =  ref<number>(2400)
const generateThemeName = ref<string>('')
const manualThemeName = ref<string>('')
const questionUploaded = ref<number>(0)
const questionsArray = ref<string>('')
const showPasteError = ref<boolean>(false)
const showProcessUpload = ref<boolean>(false)

const room = ref<RoomState | null>(null)

const playersOption = [
  { label: '2 игрока', value: 2 },
  { label: '3 игрока', value: 3 },
  { label: '4 игрока', value: 4 },
]
const timeQuestionOption = [
  { label: '10 секунд', value: 10 },
  { label: '20 секунд', value: 20 },
  { label: '30 секунд', value: 30 },
  { label: '40 секунд', value: 40 },
]
const timeTurnOption = [
  { label: '15 секунд', value: 15 },
  { label: '20 секунд', value: 20 },
  { label: '30 секунд', value: 30 },
]
const timerOption = [
  { label: '20 минут', value: 1200 },
  { label: '40 минут', value: 2400 },
  { label: '60 минут', value: 3600 },
]

const roomParams = ref<RoomUpdateParamsPayload>({
  players_count: gamePlayers.value,
  time_per_question: answerTime.value,
  time_per_turn: turnTime.value,
  extra_time_per_turn: turnTime.value,
  game_timer: timer.value
})

const unsubs: (() => void)[] = []

function updateRoomParams() {
  ws.rooms.updateParams(roomParams.value)
}

function getPrompt() {
  try {
    ws.rooms.getPrompt({theme_name: manualThemeName.value})
    showProcessUpload.value = true
  } catch {
    processingStore.setMessage('error', 'Создание темы', 'Ошибка при получении промпта')
  }
}

async function uploadQuestions() {
  try {
    const text = await navigator.clipboard.readText()
    ws.rooms.uploadThemeRaw({raw_text: text})
  } catch {
    processingStore.setMessage('error', 'Вставка вопросов', 'Браузер не поддерживает автоматическую вставку. Вставьте ответ от ИИ вручную.')
    showPasteError.value = true
  }
}

async function uploadQuestionsManually() {
  try {
    ws.rooms.uploadThemeRaw({raw_text: questionsArray.value})
    questionsArray.value = ''
  } catch {

  }
}

watch(roomParams.value, updateRoomParams)

watch([gamePlayers, answerTime], ([players, time]) => {
  if (!room.value) return
  const params: Record<string, number> = {}
  if (players) params.players_count = players
  if (time) params.time_per_question = time
  if (Object.keys(params).length) {
    ws.rooms.updateParams(params)
  }
})

onMounted(() => {
  unsubs.push(
    ws.rooms.onCreated((data) => {
      room.value = data
    }),
    ws.rooms.onState((data) => {
      room.value = data
    }),
    ws.rooms.onError((err) => {
      console.error('Room error:', err)
      if (err.code === 'INVALID_FORMAT') processingStore.setMessage('error', 'Загрузка вопросов', 'Невалидный формат вопросов')
    }),
    ws.rooms.onThemeGenerationStarted((data) => {
      console.log('Theme generation started:', data.theme_name)
    }),
    ws.ai.onProgress((data) => {
      console.log('AI progress:', data.progress.generated, '/', data.progress.total)
    }),
    ws.ai.onReady(() => {
      if (room.value) {
        ws.rooms.getState()
      }
    }),
    ws.ai.onError((data) => {
      console.error('AI error:', data.error)
    }),
    ws.rooms.onPrompt((data) => {
      navigator.clipboard.writeText(data.prompt)
      processingStore.setMessage('success', 'Промпт', 'Промпт успешно получен')
    }),
    ws.rooms.onThemeRawUploaded((data) => {
      questionUploaded.value = data.loaded
      processingStore.setMessage('success', 'Вопросы', 'Вопросы загруженны')
    })
  )

  ws.rooms.create()
})

onUnmounted(() => {
  unsubs.forEach((fn) => fn())
})
</script>

<style scoped lang="scss">
.create {
  padding: 24px $side-padding 64px $side-padding;

  &__container {
    max-width: 1080px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  h1 {
    color: $text-dark;
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px 24px;
    background: #fff;
    border-radius: $border-radius;
    border: 2px solid $border;
    transition: all 0.2s ease;
    box-shadow: $box-shadow;

    &-title {
      color: $text-dark;
    }

    &-content {
      display: flex;
      flex-direction: column;
      gap: 16px;

      :deep(.n-tabs-tab__label) {
        font-size: 16px !important;
      }
    }

    &-param {
      display: flex;
      gap: 12px;
    }
  }

  &__generate {
    display: flex;
    flex-direction: column;
    gap: 20px;

    &-header{
      display: flex;
      gap: 20px;
      align-items: end;
    }
  }

  &__manual{
    display: flex;
    flex-direction: column;
    gap: 20px;

    &-instruction {
      display: flex;
      flex-direction: column;
      gap: 12px;
      & button {
        width: fit-content;
      }
      & span{
        @include body-1;
      }
    }

    &-fields {
      display: flex;
      align-items: end;
      gap: 20px;
    }

    &-upload{
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 20px;
      border: 2px solid $border;
      box-shadow: $box-shadow;
      border-radius: $border-radius;
    }
  }
}
</style>
