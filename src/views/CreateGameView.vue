<template>
  <div class="create">
    <div class="create__container">
      <template v-if="room">
        <div class="create__header">
          <div class="create__header-title">
            <h1>Создание игры</h1>
            <p>Для выхода со страницы удалите комнату</p>
          </div>
          <MainButton title="Удалить комнату" color="red" size="small" @click="leaveRoom" />
        </div>
        <div class="create__card">
          <div class="create__card-header create__card-header_col">
            <h3 class="create__card-title">
              {{ room.status === 'inactive' ? 'Запуск комнаты' : 'Ожидание игроков' }}
            </h3>
            <p>
              {{
                room.status === 'inactive'
                  ? 'После запуска начнется ожидание игроков'
                  : 'После подключение всех игроков можно начать игру'
              }}
            </p>
          </div>
          <div class="create__card-content">
            <div v-if="room.status !== 'inactive'" class="create__card-users">
              <div
                v-for="player in room.players"
                :key="player.user_id"
                class="create__card-user create__card-user--filled"
              >
                <div
                  v-if="player.user_id !== room.owner_id"
                  class="create__card-user-kick"
                  @click="kickUser(player.user_id)"
                >
                  <Close width="12" height="12" />
                </div>
                <PlayerIcon :name="player.name" />
              </div>
              <div
                v-for="n in emptySlots"
                :key="'empty-' + n"
                class="create__card-user create__card-user--empty"
              >
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
                v-if="room.status === 'waiting' && room.players_count === room.players.length"
                title="Начать игру"
                color="green"
                @click="startGame"
              />
            </div>
          </div>
        </div>
        <div class="create__card">
          <div class="create__card-header create__card-header_col">
            <h3 class="create__card-title">Параметры</h3>
            <p>Укажите все параметры для начала игры</p>
          </div>
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
            <div class="create__card-header create__card-header_col">
              <h3 class="create__card-title">Тема</h3>
              <p>Создайте тему удобным способом</p>
            </div>
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
                  <!-- Тема готова (после завершения AI генерации) -->
                  <div v-if="aiGenStatus === 'idle' && room?.theme?.upload_method === 'ai'" class="create__theme-status">
                    <p>Тема: <span>{{ room.theme.name }}</span></p>
                    <p>Вопросов: <span>{{ room.theme.questions_loaded }}/{{ room.theme.questions_total }}</span></p>
                  </div>

                  <!-- Idle: форма запуска -->
                  <template v-else-if="aiGenStatus === 'idle'">
                    <div class="create__generate-header">
                      <MainInput
                        name="generateThemeName"
                        label="Название темы"
                        placeholder="Спорт, CS 2, история Руси и т.д."
                        v-model="generateThemeName"
                        size="large"
                      />
                      <MainSelect
                        name="generateDifficulty"
                        :options="difficultyOption"
                        v-model="generateDifficulty"
                        placeholder="Сложность"
                        label="Сложность"
                      />
                      <MainButton
                        title="Сгенерировать"
                        size="large"
                        color="blue"
                        :disabled="!generateThemeName || !generateDifficulty || room.status === 'waiting'"
                        @click="joinAiGenQueue"
                      />
                    </div>
                  </template>

                  <!-- Queued: ожидание в очереди -->
                  <template v-else-if="aiGenStatus === 'queued'">
                    <div class="create__generate-status">
                      <div class="create__generate-status-icon">⏳</div>
                      <p class="create__generate-status-title">Вы в очереди</p>
                      <p class="create__generate-status-sub">Позиция {{ aiQueuePosition }} из {{ aiQueueTotal }}</p>
                      <MainButton title="Отменить" color="red" size="small" @click="leaveAiGenQueue" />
                    </div>
                  </template>

                  <!-- Generating: идёт генерация -->
                  <template v-else-if="aiGenStatus === 'generating'">
                    <div class="create__generate-status">
                      <p class="create__generate-status-title">Генерация вопросов...</p>
                      <div class="create__generate-progress">
                        <n-progress
                          type="line"
                          :percentage="aiGenProgressPercent"
                          :show-indicator="false"
                          :height="8"
                          :border-radius="4"
                          color="#4ecca3"
                        />
                        <span class="create__generate-progress-label">{{ aiGenProgressGenerated }} / {{ aiGenProgressTotal }} вопросов</span>
                      </div>
                      <MainButton title="Отменить" color="red" size="small" @click="leaveAiGenQueue" />
                    </div>
                  </template>

                  <!-- Error: ошибка генерации -->
                  <template v-else-if="aiGenStatus === 'error'">
                    <div class="create__generate-status create__generate-status--error">
                      <p class="create__generate-status-title">Ошибка генерации</p>
                      <p class="create__generate-status-sub">{{ aiGenError }}</p>
                      <div class="create__generate-status-actions">
                        <MainButton title="Попробовать снова" color="blue" size="small" @click="joinAiGenQueue" :disabled="!generateThemeName || !generateDifficulty" />
                        <MainButton title="Сбросить" size="small" @click="resetAiGenState" />
                      </div>
                    </div>
                  </template>
                </div>
              </n-tab-pane>
              <n-tab-pane name="manual" tab="Ручное создание">
                <div class="create__manual">
                  <div
                    v-if="isThemeComplete && activeTab === 'manual'"
                    class="create__theme-status"
                  >
                    <p>
                      Тема: <span>{{ room!.theme!.name }}</span>
                    </p>
                    <p>
                      Вопросов:
                      <span
                        >{{ room!.theme!.questions_loaded }}/{{
                          room!.theme!.questions_total
                        }}</span
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
                      <MainSelect
                        name="manualDifficulty"
                        :options="difficultyOption"
                        v-model="manualDifficulty"
                        placeholder="Сложность"
                        label="Сложность вопросов"
                        :disabled="showProcessUpload"
                      />
                      <MainButton
                        title="Получить"
                        @click="getPrompt"
                        :disabled="!manualThemeName || !manualDifficulty || showProcessUpload"
                      />
                    </div>
                    <div v-if="promptText" class="create__manual-prompt">
                      <p>Если промпт не скопировался автоматически — нажмите кнопку ниже:</p>
                      <MainButton
                        title="Показать / скопировать промпт"
                        size="small"
                        @click="showPrompt = !showPrompt"
                      />
                      <textarea
                        v-if="showPrompt"
                        class="create__manual-prompt-text"
                        readonly
                        :value="promptText"
                        @click="($event.target as HTMLTextAreaElement).select()"
                      />
                    </div>
                    <div v-if="showProcessUpload" class="create__manual-upload">
                      <h4>Прогресс создания темы</h4>
                      <p>
                        Получено вопросов:
                        <span>{{ questionUploaded }}/{{ room?.theme?.questions_total ?? 80 }}</span>
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
              <n-tab-pane name="existing" tab="Готовая тема">
                <div v-if="room?.theme" class="create__theme-status">
                  <p>Тема уже добавлена: <span>{{ room.theme.name }}</span></p>
                  <p>Вопросов: <span>{{ room.theme.questions_loaded }}/{{ room.theme.questions_total }}</span></p>
                </div>
                <template v-else>
                  <div class="create__existing">
                    <MainInput
                      name="themeSearch"
                      placeholder="Поиск по названию..."
                      label="Поиск темы"
                      v-model="themeSearch"
                    />
                    <div v-if="themesLoading" class="create__existing-empty">Загрузка...</div>
                    <div v-else-if="!existingThemes.length" class="create__existing-empty">Темы не найдены</div>
                    <div v-else class="create__existing-list">
                      <div
                        v-for="theme in existingThemes"
                        :key="theme.id"
                        class="create__existing-item"
                      >
                        <div class="create__existing-info">
                          <span class="create__existing-name">{{ theme.name }}</span>
                          <span class="create__existing-meta">{{ themeDifficultyLabel(theme.difficulty) }} · {{ theme.questions_count }} вопросов</span>
                        </div>
                        <MainButton
                          title="Добавить"
                          size="small"
                          color="green"
                          :disabled="room?.status === 'waiting'"
                          @click="selectExistingTheme(theme.id)"
                        />
                      </div>
                    </div>
                  </div>
                </template>
              </n-tab-pane>
            </n-tabs>
          </div>
        </div>
      </template>
      <div v-else class="create__noroom">
        <h3>Нет активной комнаты</h3>
        <MainButton title="На главную" color="red" @click="router.push('/games')" size="medium" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MainSelect from '@/components/ui/select/MainSelect.vue'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { type RoomUpdateParamsPayload, useWebSocket, api, type Theme } from '@/api'
import { NTabs, NTabPane, NIcon, NProgress } from 'naive-ui'
import MainInput from '@/components/ui/input/MainInput.vue'
import MainButton from '@/components/ui/button/MainButton.vue'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { useRoomStore } from '@/stores/useRoomStore.ts'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore.ts'
import PlayerIcon from '@/components/games/PlayerIcon.vue'
import { AddCircle } from '@vicons/ionicons5'
import Close from '@/assets/icons/close.vue'

const router = useRouter()
const route = useRoute()
const ws = useWebSocket()
const processingStore = useProcessingStore()
const roomStore = useRoomStore()
const userStore = useUserStore()

const room = computed(() => roomStore.room)

const gamePlayers = ref<number>(2)
const answerTime = ref<number>()
const turnTime = ref<number>()
const timer = ref<number>()
const generateThemeName = ref<string>('')
const generateDifficulty = ref<'easy' | 'medium' | 'hard' | undefined>(undefined)

// AI Gen queue state
type AiGenStatus = 'idle' | 'queued' | 'generating' | 'error'
const aiGenStatus = ref<AiGenStatus>('idle')
const aiQueuePosition = ref(0)
const aiQueueTotal = ref(0)
const aiGenProgressGenerated = ref(0)
const aiGenProgressTotal = ref(80)
const aiGenError = ref('')

const aiGenProgressPercent = computed(() =>
  aiGenProgressTotal.value > 0
    ? Math.round((aiGenProgressGenerated.value / aiGenProgressTotal.value) * 100)
    : 0
)

function resetAiGenState() {
  aiGenStatus.value = 'idle'
  aiQueuePosition.value = 0
  aiQueueTotal.value = 0
  aiGenProgressGenerated.value = 0
  aiGenProgressTotal.value = 80
  aiGenError.value = ''
}

function joinAiGenQueue() {
  if (!generateThemeName.value || !generateDifficulty.value) return
  ws.aiGen.joinQueue({ theme_name: generateThemeName.value, difficulty: generateDifficulty.value })
}

function leaveAiGenQueue() {
  ws.aiGen.leaveQueue()
}

const manualThemeName = ref<string>('')
const manualDifficulty = ref<'easy' | 'medium' | 'hard' | undefined>(undefined)
const questionUploaded = ref<number>(0)
const questionsArray = ref<string>('')
const showPasteError = ref<boolean>(false)
const showProcessUpload = ref<boolean>(false)
const promptText = ref<string>('')
const showPrompt = ref<boolean>(false)
const activeTab = ref<string>('generate')
const emptySlots = computed(() => {
  if (room.value) return gamePlayers.value - room.value.players.length
  return 0
})

const isThemeComplete = computed(() => room.value?.theme?.questions_loaded === 80)

const themeSearch = ref('')
const existingThemes = ref<Theme[]>([])
const themesLoading = ref(false)

async function fetchExistingThemes() {
  themesLoading.value = true
  try {
    const res = await api.themes.popular({ q: themeSearch.value || undefined, size: 20 })
    existingThemes.value = res.themes
  } catch {
    existingThemes.value = []
  } finally {
    themesLoading.value = false
  }
}

watch(themeSearch, () => fetchExistingThemes())

watch(activeTab, (val) => {
  if (val === 'existing' && !room.value?.theme) fetchExistingThemes()
})

function selectExistingTheme(id: string) {
  ws.rooms.selectTheme({ theme_id: id })
}

function themeDifficultyLabel(d: string) {
  if (d === 'easy') return 'Лёгкая'
  if (d === 'medium') return 'Средняя'
  if (d === 'hard') return 'Сложная'
  return d
}

function resetThemeState() {
  generateThemeName.value = ''
  manualThemeName.value = ''
  manualDifficulty.value = undefined
  questionUploaded.value = 0
  questionsArray.value = ''
  showPasteError.value = false
  showProcessUpload.value = false
  promptText.value = ''
  showPrompt.value = false
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
const difficultyOption = [
  { label: 'Лёгкий', value: 'easy' },
  { label: 'Средний', value: 'medium' },
  { label: 'Сложный', value: 'hard' },
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
let paramsInitialized = false
let isLeaving = false
let themeAutoSelected = false

watch(
  () => roomStore.room,
  (data) => {
    if (!data) return
    if (data.owner_id !== userStore.currentUser?.user.id) {
      router.push('/games')
      return
    }
    gamePlayers.value = data.players_count
    answerTime.value = data.time_per_question
    turnTime.value = data.time_per_turn
    timer.value = data.game_timer ?? undefined
    if (data.theme) {
      if (data.theme.upload_method === 'manual') activeTab.value = 'manual'
      else if (data.theme.upload_method === 'ai') activeTab.value = 'generate'
      else if (data.theme.upload_method === 'existing') activeTab.value = 'existing'
      if (data.theme.name) {
        if (activeTab.value === 'manual') manualThemeName.value = data.theme.name
        else if (activeTab.value === 'generate') generateThemeName.value = data.theme.name
      }
      if (data.theme.difficulty) {
        manualDifficulty.value = data.theme.difficulty
      }
      questionUploaded.value = data.theme.questions_loaded
      showProcessUpload.value = data.theme.name !== ''
    } else {
      resetThemeState()
      if (route.query.theme && !themeAutoSelected) {
        themeAutoSelected = true
        ws.rooms.selectTheme({ theme_id: route.query.theme as string })
      }
    }
    paramsInitialized = true
  },
  { immediate: true },
)

function getPrompt() {
  try {
    ws.rooms.getPrompt({ theme_name: manualThemeName.value, difficulty: manualDifficulty.value })
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
  resetAiGenState()
}

function activateRoom() {
  if (
    !roomParams.value.players_count ||
    !roomParams.value.time_per_turn ||
    !roomParams.value.time_per_question ||
    !roomParams.value.game_timer
  ) {
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
}

function leaveRoom() {
  isLeaving = true
  ws.rooms.leave()
  router.push({ path: '/games', state: { left: true } })
}

watch(roomParams, (newParams) => {
  if (room.value && paramsInitialized) {
    ws.rooms.updateParams(newParams)
  }
})

onMounted(() => {
  unsubs.push(
    ws.rooms.onState((data) => {
      if (!data && !isLeaving) {
        router.push('/games')
      }
    }),
    ws.rooms.onThemeDeleted(() => {
      if (roomStore.room) {
        roomStore.room = { ...roomStore.room, theme: null }
      }
      resetThemeState()
      resetAiGenState()
    }),
    ws.rooms.onError((err) => {
      if (isLeaving) return
      if (err.code === 'INVALID_FORMAT') {
        processingStore.setMessage('error', 'Загрузка вопросов', 'Невалидный формат вопросов')
      } else if (err.code === 'NO_THEME') {
        processingStore.setMessage('error', 'Ошибка запуска', 'Необходимо создать тему')
      } else if (err.code === 'THEME_NOT_FOUND') {
        processingStore.setMessage('error', 'Выбор темы', 'Тема не найдена')
        themeAutoSelected = false
      } else if (err.code === 'INVALID_QUESTIONS_COUNT') {
        processingStore.setMessage(
          'error',
          'Выбор темы',
          'Тема содержит неверное количество вопросов',
        )
        themeAutoSelected = false
      } else if (err.code === 'ROOM_ALREADY_ACTIVE') {
        processingStore.setMessage('error', 'Выбор темы', 'Нельзя изменить тему в активной комнате')
        themeAutoSelected = false
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
      promptText.value = data.prompt
      roomStore.initRoom()
      navigator.clipboard
        ?.writeText(data.prompt)
        .then(() => {
          processingStore.setMessage(
            'success',
            'Загрузка вопросов',
            'Промпт успешно скопирован в буфер обмена. Можете вставить его в ИИ.',
          )
        })
        .catch(() => {
          processingStore.setMessage(
            'warning',
            'Загрузка вопросов',
            'Не удалось скопировать автоматически. Нажмите кнопку для копирования вручную.',
          )
        })
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
    }),
    ws.rooms.onPlayerLeft((data) => {
      processingStore.setMessage('info', `${data.name}`, `Пользователь покинул комнату`)
    }),
    ws.rooms.onThemeProgress(() => {
      roomStore.initRoom()
    }),
    ws.rooms.onThemeSelected(() => {
      router.replace({ query: { ...route.query, theme: undefined } })
      processingStore.setMessage(
        'success',
        'Тема выбрана',
        'Готовая тема успешно подключена к комнате',
      )
      roomStore.initRoom()
    }),
    ws.aiGen.onQueued((data) => {
      aiGenStatus.value = 'queued'
      aiQueuePosition.value = data.queue_position
      aiQueueTotal.value = data.queue_total
    }),
    ws.aiGen.onPositionUpdate((data) => {
      aiQueuePosition.value = data.queue_position
      aiQueueTotal.value = data.queue_total
    }),
    ws.aiGen.onStarted(() => {
      aiGenStatus.value = 'generating'
    }),
    ws.aiGen.onProgress((data) => {
      aiGenProgressGenerated.value = data.progress.generated
      aiGenProgressTotal.value = data.progress.total
    }),
    ws.aiGen.onCompleted((data) => {
      resetAiGenState()
      roomStore.room = data.room_state
    }),
    ws.aiGen.onError((data) => {
      aiGenStatus.value = 'error'
      aiGenError.value = data.message || data.error || 'Неизвестная ошибка'
      if (data.code === 'DAILY_LIMIT_REACHED') {
        processingStore.setMessage('error', 'ИИ генерация', 'Лимит 3 генерации в день исчерпан')
        resetAiGenState()
      } else if (data.code === 'ALREADY_IN_QUEUE') {
        processingStore.setMessage('error', 'ИИ генерация', 'Вы уже находитесь в очереди')
        aiGenStatus.value = 'queued'
      }
    }),
    ws.aiGen.onCancelled(() => {
      resetAiGenState()
    }),
    ws.aiGen.onStatus((data) => {
      if (!data.in_queue) {
        resetAiGenState()
      } else if (data.status === 'queued') {
        aiGenStatus.value = 'queued'
        aiQueuePosition.value = data.queue_position ?? 0
        aiQueueTotal.value = data.queue_total ?? 0
      } else if (data.status === 'generating') {
        aiGenStatus.value = 'generating'
        aiGenProgressGenerated.value = data.progress?.generated ?? 0
        aiGenProgressTotal.value = data.progress?.total ?? 80
      }
    }),
  )
  if (!window.history.state?.fresh) {
    roomStore.initRoom()
  }
  ws.aiGen.getStatus()
})

onUnmounted(() => {
  unsubs.forEach((fn) => fn())
})
</script>

<style scoped lang="scss">
.create {
  padding: 24px $side-padding 64px $side-padding;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;

    &-title {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  }

  &__container {
    max-width: 1080px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-height: calc(100vh - $footer-height - $header-height - 88px);
  }

  &__noroom {
    display: flex;
    flex-direction: column;
    gap: 24px;
    align-items: center;
    justify-content: center;
    margin: auto 0;
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

    @media (max-width: 900px) {
      padding: 14px 18px;
      gap: 12px;
    }

    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;

      &_col {
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

      @media (max-width: 900px) {
        gap: 12px;
      }

      :deep(.n-tabs-tab__label) {
        font-size: $fs-body-1 !important;
      }

      :deep(.n-tabs .n-tabs-tab) {
        padding: 0 12px;
      }

      :deep(.n-tabs .n-tabs-rail) {
        overflow-x: auto;
        scrollbar-width: none;

        &::-webkit-scrollbar {
          display: none;
        }
      }
    }

    &-param {
      display: flex;
      gap: 12px;

      @media (max-width: 900px) {
        flex-direction: column;
      }
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

      &-kick {
        position: absolute;
        top: -8px;
        right: -8px;
        background-color: $primary-red;
        border-radius: 50%;
        border: 2px solid $border;
        cursor: pointer;
        width: 24px;
        height: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: $border;
      }
    }
  }

  &__existing {
    display: flex;
    flex-direction: column;
    gap: 12px;

    &-empty {
      @include body-1;
      color: $text-grey;
      text-align: center;
      padding: 16px 0;
    }

    &-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 320px;
      overflow-y: auto;
    }

    &-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px;
      border: 2px solid $border;
      border-radius: $border-radius;
      background: #f9f9f9;
    }

    &-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    &-name {
      @include body-1-bold;
      color: $text-dark;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &-meta {
      @include caption;
      color: $text-grey;
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
      flex-wrap: wrap;
    }

    &-status {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 24px;
      border: 2px solid $border;
      border-radius: $border-radius;
      background: #f9f9f9;
      text-align: center;

      &--error {
        border-color: $primary-red;
        background: rgba($primary-red, 0.05);
      }

      &-icon {
        font-size: 32px;
      }

      &-title {
        @include body-1-bold;
        color: $text-dark;
      }

      &-sub {
        @include body-1;
        color: $text-grey;
      }

      &-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        justify-content: center;
      }
    }

    &-progress {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 6px;

      &-label {
        @include caption;
        color: $text-grey;
        text-align: center;
      }
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
      @media (max-width: 900px) {
        flex-direction: column;
      }
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

    &-prompt {
      display: flex;
      flex-direction: column;
      gap: 12px;

      p {
        @include body-1;
        color: $text-dark;
      }

      &-text {
        width: 100%;
        min-height: 160px;
        padding: 12px;
        border: 2px solid $border;
        border-radius: $border-radius;
        font-size: 13px;
        font-family: monospace;
        resize: vertical;
        background: #f9f9f9;
        color: $text-dark;
        cursor: text;
      }
    }
  }
}
</style>
