<template>
  <ModalContainer v-model:show="show" modal-width="760px">
    <template #header>
      <div class="theme-modal__header">
        <h3>{{ theme?.name ?? 'Загрузка...' }}</h3>
        <span v-if="theme" class="theme-modal__count">{{ theme.questions.length }} вопросов</span>
      </div>
    </template>
    <template #body>
      <div v-if="loading" class="theme-modal__loading">Загрузка...</div>
      <template v-else-if="theme">
        <div class="theme-modal__questions">
          <div
            v-for="(q, index) in theme.questions"
            :key="q.id"
            class="theme-modal__question"
          >
            <div class="theme-modal__question-title">
              <span class="theme-modal__question-num">{{ index + 1 }}</span>
              {{ q.question }}
            </div>
            <div class="theme-modal__answers">
              <div
                v-for="(answer, i) in q.answers"
                :key="i"
                class="theme-modal__answer"
                :class="{ 'theme-modal__answer--correct': i === q.correct_answer }"
              >
                <span class="theme-modal__answer-letter">{{ letters[i] }}</span>
                {{ answer }}
              </div>
            </div>
          </div>
        </div>
        <MainButton
          :title="isChecked ? 'Снять проверку' : 'Отметить проверенной'"
          :color="isChecked ? 'red' : 'green'"
          @click="toggleCheck"
        />
      </template>
    </template>
  </ModalContainer>
</template>

<script setup lang="ts">
import ModalContainer from '@/components/template/ModalContainer.vue'
import MainButton from '@/components/ui/button/MainButton.vue'
import { useApi, type AdminThemeDetail } from '@/api'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { computed, ref, watch } from 'vue'

interface Props {
  show: boolean
  themeId: string | null
  checked: boolean
}

const props = defineProps<Props>()
const api = useApi()
const processingStore = useProcessingStore()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'check-updated'): void
}>()

const show = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

const theme = ref<AdminThemeDetail | null>(null)
const loading = ref(false)
const isChecked = ref(props.checked)

const letters = ['A', 'B', 'C', 'D']

watch(
  () => props.show,
  async (value) => {
    if (value && props.themeId) {
      isChecked.value = props.checked
      try {
        loading.value = true
        theme.value = await api.admin.themes.getById(props.themeId)
      } catch {
        processingStore.setMessage('error', 'Просмотр темы', 'Ошибка загрузки темы')
        emit('update:show', false)
      } finally {
        loading.value = false
      }
    } else {
      theme.value = null
    }
  },
)

async function toggleCheck() {
  if (!theme.value) return
  try {
    processingStore.startLoading()
    await api.admin.themes.setCheck(theme.value.id, { check: !isChecked.value })
    isChecked.value = !isChecked.value
    emit('check-updated')
    processingStore.setMessage('success', 'Тема', isChecked.value ? 'Тема отмечена проверенной' : 'Отметка снята')
  } catch {
    processingStore.setMessage('error', 'Тема', 'Ошибка обновления статуса')
  } finally {
    processingStore.stopLoading()
  }
}
</script>

<style scoped lang="scss">
.theme-modal {
  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__count {
    @include body-2;
    color: $text-grey;
    white-space: nowrap;
  }

  &__loading {
    text-align: center;
    padding: 40px 0;
    color: $text-grey;
    @include body-1;
  }

  &__questions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 60vh;
    overflow-y: auto;
    padding-right: 8px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: $background;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: $border;
      border-radius: 4px;
    }
  }

  &__question {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 14px;
    border: 2px solid $border;
    border-radius: $border-radius;
    background: #fff;

    &-title {
      @include body-1-bold;
      color: $text-dark;
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    &-num {
      @include body-2;
      color: $text-grey;
      min-width: 20px;
      padding-top: 2px;
    }
  }

  &__answers {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    padding-left: 28px;
  }

  &__answer {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 6px;
    border: 2px solid $border;
    @include body-2;
    color: $text-dark;

    &--correct {
      background: $primary-green;
      border-color: darken(#a8e6cf, 15%);
      font-weight: 600;
    }

    &-letter {
      font-weight: 700;
      color: $text-grey;
      min-width: 16px;
    }

    &--correct &-letter {
      color: $text-dark;
    }
  }
}
</style>
