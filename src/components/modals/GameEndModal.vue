<template>
  <n-modal :show="!!gameEnded" :mask-closable="false" :close-on-esc="false">
    <n-card style="width: 560px" :bordered="false" size="huge" role="dialog" aria-modal="true">
      <div class="end-modal">
        <!-- Winner -->
        <div class="end-modal__winner">
          <div class="end-modal__winner-label">Победитель</div>
          <div class="end-modal__winner-name">
            {{ gameEnded?.winner_name ?? 'Ничья' }}
          </div>
        </div>

        <!-- Standings -->
        <div class="end-modal__standings">
          <div
            v-for="standing in gameEnded?.final_standings"
            :key="standing.player_index"
            class="end-modal__standing"
            :class="{ 'end-modal__standing--first': standing.place === 1 }"
          >
            <div class="end-modal__standing-place">#{{ standing.place }}</div>
            <div class="end-modal__standing-name">{{ standing.name }}</div>
            <div class="end-modal__standing-stats">
              <span>{{ standing.territories }} тер.</span>
              <span>{{ standing.correct_answers }}/{{ standing.questions_answered }}</span>
            </div>
          </div>
        </div>

        <!-- Temp theme rating -->
        <template v-if="gameEnded?.is_temp_theme">
          <div v-if="!rated" class="end-modal__rating">
            <div class="end-modal__rating-title">Оцените тему «{{ gameEnded.theme_name }}»</div>
            <div class="end-modal__rating-options">
              <button
                v-for="opt in ratingOptions"
                :key="opt.value"
                class="end-modal__rating-btn"
                :class="{ 'end-modal__rating-btn--active': selectedRating === opt.value }"
                @click="selectedRating = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>
            <div v-if="selectedRating && selectedRating !== 'skip'" class="end-modal__difficulty">
              <div class="end-modal__difficulty-label">Сложность темы:</div>
              <div class="end-modal__difficulty-options">
                <button
                  v-for="opt in difficultyOptions"
                  :key="opt.value"
                  class="end-modal__difficulty-btn"
                  :class="{ 'end-modal__difficulty-btn--active': selectedDifficulty === opt.value }"
                  @click="selectedDifficulty = opt.value"
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>
            <button
              class="end-modal__submit-btn"
              :disabled="!canSubmitRating || isSubmitting"
              @click="submitRating"
            >
              {{ isSubmitting ? 'Отправка...' : 'Оценить' }}
            </button>
          </div>
          <div v-else class="end-modal__rated">
            Спасибо за оценку!
          </div>
        </template>

        <button class="end-modal__lobby-btn" @click="goToLobby">
          В лобби
        </button>
      </div>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { NModal, NCard } from 'naive-ui'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { useGameStore } from '@/stores/useGameStore.ts'
import type { TempThemeRating, Difficulty } from '@/api'

const gameStore = useGameStore()
const router = useRouter()

const gameEnded = computed(() => gameStore.gameEnded)

const selectedRating = ref<TempThemeRating | null>(null)
const selectedDifficulty = ref<Difficulty | null>(null)
const isSubmitting = ref(false)
const rated = ref(false)

const ratingOptions: { label: string; value: TempThemeRating }[] = [
  { label: 'Нравится', value: 'like' },
  { label: 'Не нравится', value: 'dislike' },
  { label: 'Пропустить', value: 'skip' },
]

const difficultyOptions: { label: string; value: Difficulty }[] = [
  { label: 'Лёгкая', value: 'easy' },
  { label: 'Средняя', value: 'medium' },
  { label: 'Сложная', value: 'hard' },
]

const canSubmitRating = computed(() => {
  if (!selectedRating.value) return false
  if (selectedRating.value === 'skip') return true
  return !!selectedDifficulty.value
})

const submitRating = async () => {
  if (!canSubmitRating.value || !gameStore.currentGameId) return
  isSubmitting.value = true
  try {
    await api.games.rateTempTheme(gameStore.currentGameId, {
      rating: selectedRating.value!,
      difficulty_rating: selectedRating.value !== 'skip' ? selectedDifficulty.value! : undefined,
    })
    rated.value = true
  } finally {
    isSubmitting.value = false
  }
}

const goToLobby = () => {
  gameStore.clearGameEnded()
  router.push('/games')
}
</script>

<style scoped lang="scss">
.end-modal {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__winner {
    text-align: center;

    &-label {
      @include body-2-up;
      color: $text-grey;
      margin-bottom: 8px;
    }

    &-name {
      font-size: 2rem;
      font-weight: 700;
      color: $text-dark;
      line-height: 1;
    }
  }

  &__standings {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__standing {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    border-radius: $border-radius;
    border: 2px solid $border;
    background: #fff;
    box-shadow: $box-shadow;

    &--first {
      background: $primary-yellow;
    }

    &-place {
      @include body-1-bold;
      color: $text-grey;
      width: 28px;
    }

    &-name {
      @include body-1-bold;
      color: $text-dark;
      flex: 1;
    }

    &-stats {
      display: flex;
      gap: 12px;

      span {
        @include body-2;
        color: $text-grey;
      }
    }
  }

  &__rating {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border-radius: $border-radius;
    border: 2px solid $border;
    background: $background;
    box-shadow: $box-shadow;

    &-title {
      @include body-1-bold;
      color: $text-dark;
    }

    &-options {
      display: flex;
      gap: 8px;
    }

    &-btn {
      flex: 1;
      padding: 10px 12px;
      border-radius: $border-radius;
      border: 2px solid $border;
      background: #fff;
      box-shadow: $box-shadow;
      cursor: pointer;
      @include body-2-bold;
      color: $text-dark;
      transition:
        background-color 0.15s ease,
        transform 0.1s ease,
        box-shadow 0.1s ease;

      &:hover {
        background: $primary-yellow;
      }

      &:active {
        box-shadow: 0px 0px 0px $border;
        transform: translate(1px, 2px);
      }

      &--active {
        background: $primary-yellow;
        border-color: $border;
      }
    }
  }

  &__difficulty {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &-label {
      @include body-2;
      color: $text-grey;
    }

    &-options {
      display: flex;
      gap: 8px;
    }

    &-btn {
      flex: 1;
      padding: 8px 10px;
      border-radius: $border-radius;
      border: 2px solid $border;
      background: #fff;
      box-shadow: $box-shadow;
      cursor: pointer;
      @include body-2;
      color: $text-dark;
      transition:
        background-color 0.15s ease,
        transform 0.1s ease,
        box-shadow 0.1s ease;

      &:hover {
        background: $primary-green;
      }

      &:active {
        box-shadow: 0px 0px 0px $border;
        transform: translate(1px, 2px);
      }

      &--active {
        background: $primary-green;
      }
    }
  }

  &__submit-btn {
    padding: 10px 16px;
    border-radius: $border-radius;
    border: 2px solid $border;
    background: $primary-yellow;
    box-shadow: $box-shadow;
    cursor: pointer;
    @include body-1-bold;
    color: $text-dark;
    transition:
      opacity 0.15s ease,
      transform 0.1s ease,
      box-shadow 0.1s ease;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:not(:disabled):active {
      box-shadow: 0px 0px 0px $border;
      transform: translate(1px, 2px);
    }
  }

  &__rated {
    @include body-1-bold;
    color: $text-dark;
    text-align: center;
    padding: 12px;
    border-radius: $border-radius;
    border: 2px solid $border;
    background: $primary-green;
    box-shadow: $box-shadow;
  }

  &__lobby-btn {
    padding: 14px 24px;
    border-radius: $border-radius;
    border: 2px solid $border;
    background: $primary-yellow;
    box-shadow: $box-shadow;
    cursor: pointer;
    @include body-1-bold;
    color: $text-dark;
    text-align: center;
    transition:
      background-color 0.15s ease,
      transform 0.1s ease,
      box-shadow 0.1s ease;

    &:hover {
      background: darken(#fed787, 8%);
    }

    &:active {
      box-shadow: 0px 0px 0px $border;
      transform: translate(1px, 2px);
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
