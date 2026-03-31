<template>
  <ModalContainer
    :show="!!gameEnded"
    modal-width="min(560px, 95vw)"
    :mask-closable="false"
    :close-on-esc="false"
    :show-close="false"
  >
    <template #header>
      <div class="end-modal__winner">
        <div class="end-modal__winner-label">Победитель</div>
        <div class="end-modal__winner-name">
          {{ gameEnded?.winner_name ?? 'Ничья' }}
        </div>
      </div>
    </template>

    <template #body>
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

      <!-- Theme rating -->
      <template v-if="canRate">
        <div v-if="!rated" class="end-modal__rating">
          <div class="end-modal__rating-title">Оцените тему «{{ gameEnded!.theme_name }}»</div>
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
          <div v-if="selectedRating === 'dislike'" class="end-modal__reason">
            <div class="end-modal__reason-label">Причина (необязательно):</div>
            <textarea
              v-model="dislikeReason"
              class="end-modal__reason-input"
              placeholder="Что не понравилось в теме?"
              rows="3"
              maxlength="1000"
            />
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
    </template>
  </ModalContainer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { useGameStore } from '@/stores/useGameStore.ts'
import type { TempThemeRating, ThemeRating, Difficulty } from '@/api'
import ModalContainer from '@/components/template/ModalContainer.vue'

const gameStore = useGameStore()
const router = useRouter()

const gameEnded = computed(() => gameStore.gameEnded)

const canRate = computed(() =>
  !!gameEnded.value && (gameEnded.value.is_temp_theme || !!gameEnded.value.theme_id),
)

const isTempTheme = computed(() => !!gameEnded.value?.is_temp_theme)

type AnyRating = TempThemeRating | ThemeRating

const selectedRating = ref<AnyRating | null>(null)
const selectedDifficulty = ref<Difficulty | null>(null)
const dislikeReason = ref('')
const isSubmitting = ref(false)
const rated = ref(false)

const ratingOptions = computed<{ label: string; value: AnyRating }[]>(() => {
  const base = [
    { label: 'Нравится', value: 'like' as const },
    { label: 'Не нравится', value: 'dislike' as const },
  ]
  if (isTempTheme.value) {
    base.push({ label: 'Пропустить', value: 'skip' as const })
  }
  return base
})

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
    if (isTempTheme.value) {
      await api.games.rateTempTheme(gameStore.currentGameId, {
        rating: selectedRating.value as TempThemeRating,
        difficulty_rating: selectedRating.value !== 'skip' ? selectedDifficulty.value! : undefined,
      })
    } else {
      await api.themes.rate(gameEnded.value!.theme_id!, {
        game_id: gameStore.currentGameId,
        rating: selectedRating.value as ThemeRating,
        difficulty_rating: selectedDifficulty.value ?? undefined,
        reason: selectedRating.value === 'dislike' && dislikeReason.value.trim()
          ? dislikeReason.value.trim()
          : undefined,
      })
    }
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
  &__winner {
    display: flex;
    flex-direction: column;
    gap: 4px;

    &-label {
      @include body-2-up;
      color: $text-grey;
    }

    &-name {
      font-size: $fs-h1;
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

  &__reason {
    display: flex;
    flex-direction: column;
    gap: 6px;

    &-label {
      @include body-2;
      color: $text-grey;
    }

    &-input {
      width: 100%;
      padding: 10px 12px;
      border-radius: $border-radius;
      border: 2px solid $border;
      background: #fff;
      box-shadow: $box-shadow;
      resize: vertical;
      font-family: inherit;
      @include body-2;
      color: $text-dark;
      outline: none;
      box-sizing: border-box;

      &:focus {
        border-color: darken($border, 15%);
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
      background: darken($primary-yellow, 8%);
    }

    &:active {
      box-shadow: 0px 0px 0px $border;
      transform: translate(1px, 2px);
    }
  }
}
</style>
