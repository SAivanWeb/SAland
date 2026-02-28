<template>
  <div v-if="room" class="create">
    <div class="create__container">
      <h1>Создание игры</h1>
      <div class="create__card">
        <div class="create__card-header create__card-header_col">
          <h3 class="create__card-title">{{ room.status === 'inactive' ? 'Запуск комнаты' : 'Ожидание игроков'}}</h3>
          <p>{{ room.status === 'inactive' ? 'После запуска начнется ожидание игроков' : 'После подключение всех игроков можно начать игру' }}</p>
        </div>
        <div class="create__card-content">
          <div v-if="room.status !== 'inactive'" class="create__card-users">
            <div v-for="player in room.players" :key="player.user_id" class="create__card-user create__card-user--filled">
              <div v-if="player.user_id !== room.owner_id" class="create__card-user-kick" @click="kickUser(player.user_id)">
                <n-icon size="16">
                  <Close/>
                </n-icon>
              </div>
              <PlayerIcon :name="player.name" />
            </div>
            <div v-for="n in emptySlots" :key="'empty-' + n" class="create__card-user create__card-user--empty">
              <n-icon size="24" color="#858585">
                <AddCircle />
              </n-icon>
            </div>
          </div>
          <div class="create__card-row">
            <MainButton
              v-if="room.status === 'inactive'"
              title="Запустить"
              color="green"
              @click="activateRoom"
            />
            <MainButton
              v-else-if="room.status === 'waiting'"
              title="Остановить"
              color="red"
              @click="deactivateRoom"
            />
            <MainButton
              v-if="room.players_count === room.players.length"
              title="Начать игру"
              color="green"
              @click="startGame"
            />
          </div>
        </div>
      </div>
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
              v-model="turnTime"
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
        <div class="create__card-header">
          <h3 class="create__card-title">Тема</h3>
          <MainButton
            v-if="room && room.theme"
            title="Очистить тему"
            @click="clearTheme"
            size="small"
            color="red"
            :disabled="room.status === 'waiting'"
          />
        </div>
        <div class="create__card-content">
          <n-tabs
            default-value="generate"
            type="segment"
            size="medium"
            justify-content="space-evenly"
            v-model:value="activeTab"
          >
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
                  <MainButton
                    title="Сгенерировать"
                    size="large"
                    color="blue"
                    :disabled="!generateThemeName || room.status === 'waiting'"
                  />
                </div>
              </div>
            </n-tab-pane>
            <n-tab-pane name="manual" tab="Ручное создание">
              <div class="create__manual">
                <div v-if="isThemeComplete && activeTab === 'manual'" class="create__theme-status">
                  <p>
                    Тема: <span>{{ room!.theme!.name }}</span>
                  </p>
                  <p>
                    Вопросов:
                    <span
                      >{{ room!.theme!.questions_loaded }}/{{ room!.theme!.questions_total }}</span
                    >
                  </p>
                </div>
                <template v-else>
                  <div class="create__manual-fields">
                    <MainInput
                      name="manualThemeName"
                      placeholder="Название темы"
                      label="Укажите название темы"
                      v-model="manualThemeName"
                      :disabled="showProcessUpload"
                    />
                    <MainButton
                      title="Получить"
                      @click="getPrompt"
                      :disabled="!manualThemeName || showProcessUpload"
                    />
                  </div>
                  <div v-if="showProcessUpload" class="create__manual-upload">
                    <h4>Прогресс создания темы</h4>
                    <p>
                      Получено вопросов: <span>{{ questionUploaded }}/80</span>
                    </p>
                    <MainButton
                      title="Загрузить"
                      @click="uploadQuestions"
                      :disabled="isThemeComplete"
                    />
                    <div v-if="showPasteError" class="create__manual-fields">
                      <MainInput
                        name="questionsInput"
                        placeholder="Вставьте вопросы"
                        label="Сгенерированные вопросы"
                        v-model="questionsArray"
                      />
                      <MainButton
                        title="Загрузить"
                        @click="uploadQuestionsManually"
                        :disabled="!questionsArray || isThemeComplete"
                      />
                    </div>
                  </div>
                </template>
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { type RoomUpdateParamsPayload, useWebSocket } from '@/api'
import { NTabs, NTabPane, NIcon } from 'naive-ui'
import MainInput from '@/components/ui/input/MainInput.vue'
import MainButton from '@/components/ui/button/MainButton.vue'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { useRoomStore } from '@/stores/useRoomStore.ts'
import { useRouter } from 'vue-router'
import PlayerIcon from '@/components/games/PlayerIcon.vue'
import { AddCircle } from '@vicons/ionicons5'
import Close from '@/assets/icons/close.vue'

const router = useRouter()
const ws = useWebSocket()
const processingStore = useProcessingStore()
const roomStore = useRoomStore()

const room = computed(() => roomStore.room)

const gamePlayers = ref<number>(2)
const answerTime = ref<number>()
const turnTime = ref<number>()
const timer = ref<number>()
const generateThemeName = ref<string>('')
const manualThemeName = ref<string>('')
const questionUploaded = ref<number>(0)
const questionsArray = ref<string>('')
const showPasteError = ref<boolean>(false)
const showProcessUpload = ref<boolean>(false)
const activeTab = ref<string>('generate')
const emptySlots = computed(() => {
  if (room.value) return gamePlayers.value - room.value.players.length
  return 0
})

const isThemeComplete = computed(() => room.value?.theme?.questions_loaded === 80)

function resetThemeState() {
  generateThemeName.value = ''
  manualThemeName.value = ''
  questionUploaded.value = 0
  questionsArray.value = ''
  showPasteError.value = false
  showProcessUpload.value = false
}

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

const roomParams = computed<RoomUpdateParamsPayload>(() => ({
  players_count: gamePlayers.value,
  time_per_question: answerTime.value,
  time_per_turn: turnTime.value,
  extra_time_per_turn: turnTime.value,
  game_timer: timer.value,
}))

const unsubs: (() => void)[] = []

watch(() => roomStore.room, (data) => {
  if (!data) return
  gamePlayers.value = data.players_count
  answerTime.value = data.time_per_question
  turnTime.value = data.time_per_turn
  timer.value = data.game_timer ?? undefined
  if (data.theme) {
    if (data.theme.upload_method === 'manual') activeTab.value = 'manual'
    else if (data.theme.upload_method === 'ai') activeTab.value = 'generate'
    if (data.theme.name) {
      if (activeTab.value === 'manual') manualThemeName.value = data.theme.name
      else generateThemeName.value = data.theme.name
    }
    questionUploaded.value = data.theme.questions_loaded
    showProcessUpload.value = data.theme.name !== ''
  } else {
    resetThemeState()
  }
}, { immediate: true })

function getPrompt() {
  try {
    ws.rooms.getPrompt({ theme_name: manualThemeName.value })
    showProcessUpload.value = true
  } catch {
    processingStore.setMessage('error', 'Создание темы', 'Ошибка при получении промпта')
  }
}

async function uploadQuestions() {
  try {
    const text = await navigator.clipboard.readText()
    ws.rooms.uploadThemeRaw({ raw_text: text })
  } catch {
    processingStore.setMessage(
      'error',
      'Вставка вопросов',
      'Браузер не поддерживает автоматическую вставку. Вставьте ответ от ИИ вручную.',
    )
    showPasteError.value = true
  }
}

async function uploadQuestionsManually() {
  try {
    ws.rooms.uploadThemeRaw({ raw_text: questionsArray.value })
    questionsArray.value = ''
  } catch {}
}

function clearTheme() {
  ws.rooms.deleteTheme()
  resetThemeState()
}

function activateRoom() {
  if(!roomParams.value.players_count || !roomParams.value.time_per_turn || !roomParams.value.time_per_question || !roomParams.value.game_timer){
    processingStore.setMessage('error', 'Запуск комнаты', 'Укажите все игровые параметры')
    return
  }
  if (!room.value?.theme) {
    processingStore.setMessage('error', 'Запуск комнаты', 'Создайте тему')
    return
  }
  if (room.value?.theme.questions_loaded !== room.value?.theme.questions_total) {
    processingStore.setMessage('error', 'Запуск комнаты', 'Создайте тему')
    return
  }
  ws.rooms.activate()
}

function deactivateRoom() {
  ws.rooms.deactivate()
}

function kickUser(id: string) {
  ws.rooms.kick({ user_id: id })
}

function startGame() {
  ws.rooms.start()
  router.push('/game')
}

watch(roomParams, (newParams) => {
  if (room.value) {
    ws.rooms.updateParams(newParams)
  }
})

onMounted(() => {
  unsubs.push(
    ws.rooms.onThemeDeleted(() => {
      if (roomStore.room) {
        roomStore.room = { ...roomStore.room, theme: null }
      }
      resetThemeState()
    }),
    ws.rooms.onError((err) => {
      console.error('Room error:', err)
      if (err.code === 'INVALID_FORMAT') {
        processingStore.setMessage('error', 'Загрузка вопросов', 'Невалидный формат вопросов')
      } else if (
        err.code === 'NOT_IN_ROOM' ||
        err.code === 'ROOM_NOT_FOUND' ||
        err.code === 'ALREADY_IN_ROOM'
      ) {
        processingStore.setMessage('error', 'Ошибка подключения', 'Комната не существует')
        router.push('/games')
      } else if (err.code === 'NO_THEME') {
        processingStore.setMessage('error', 'Ошибка запуска', 'Необходимо создать тему')
      }
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
      processingStore.setMessage(
        'success',
        'Загрузка вопросов',
        'Промпт успешно скопирован в буфер обмена. Можете вставить его в ИИ.',
      )
    }),
    ws.rooms.onThemeRawUploaded((data) => {
      questionUploaded.value = data.loaded
      processingStore.setMessage('success', 'Загрузка вопросов', 'Вопросы загруженны')
    }),
    ws.rooms.onActivated(() => {
      processingStore.setMessage(
        'success',
        'Запуск комнаты',
        'Комната запущена, идет ожидание игроков.',
      )
    }),
    ws.rooms.onDeactivated(() => {
      processingStore.setMessage(
        'success',
        'Остановка комнаты',
        'Комната неактивна, ожидание игроков остановлено.',
      )
    }),
    ws.rooms.onPlayerJoined((data) => {
      processingStore.setMessage(
        'info',
        `${data.player.name}`,
        `Пользователь присоединился к комнате`,
      )
      roomStore.initRoom()
    }),
    ws.rooms.onPlayerLeft((data) => {
      processingStore.setMessage(
        'info',
        `${data.name}`,
        `Пользователь покинул комнату`,
      )
      roomStore.initRoom()
    }),
    ws.rooms.onThemeProgress(() => {
      roomStore.initRoom()
    })
  )
  roomStore.initRoom()
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

    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      &_col{
        flex-direction: column;
        gap: 2px;
        align-items: start;
      }
    }

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

    &-row {
      display: flex;
      justify-content: end;
      gap: 16px;
    }

    &-users {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 8px;
    }

    &-user {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      &--empty {
        border-radius: 50%;
        border: 2px solid $border;
        background: $background;
      }

      &-kick{
        position: absolute;
        top: -8px;
        right: -8px;
        background-color: $primary-red;
        border-radius: 50%;
        border:  2px solid $border;
        cursor: pointer;
        width: 24px;
        height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }

  &__theme-status {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    border: 2px solid $border;
    border-radius: $border-radius;
    background: #f9f9f9;

    p {
      @include body-1;
      color: $text-dark;
    }

    & span {
      @include body-1-bold;
    }
  }

  &__generate {
    display: flex;
    flex-direction: column;
    gap: 20px;

    &-header {
      display: flex;
      gap: 20px;
      align-items: end;
    }
  }

  &__manual {
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
      & span {
        @include body-1;
      }
    }

    &-fields {
      display: flex;
      align-items: end;
      gap: 20px;
    }

    &-upload {
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
