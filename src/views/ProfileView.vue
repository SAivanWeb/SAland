<template>
  <div class="profile">
    <div v-if="profile" class="profile__container">
      <h1>Профиль</h1>
      <div class="profile__content">
        <!-- Левая карточка -->
        <div class="profile__user">
          <div class="profile__user-header">
            <h2 class="profile__user-name">{{ profile.name }}</h2>
            <MainButton
              title="Редактировать"
              size="small"
              color="green"
              @click="showEditProfile = true"
            />
          </div>
          <div class="profile__user-info">
            <span class="profile__user-meta">{{ profile.email }}</span>
            <span class="profile__user-meta">С нами с {{ formatDate(profile.created_at) }}</span>
          </div>
        </div>

        <!-- Правая часть -->
        <div class="profile__info">
          <!-- Статистика -->
          <div class="profile__stats">
            <h3>Статистика</h3>
            <div class="profile__stats-grid">
              <div class="profile__stats-item">
                <span class="profile__stats-item-name">Сыграно</span>
                <div class="profile__stats-item-value">{{ formatStat(profile.stats.games_played) }}</div>
              </div>
              <div class="profile__stats-item">
                <span class="profile__stats-item-name">Победы</span>
                <div class="profile__stats-item-value">{{ formatStat(profile.stats.games_won) }}</div>
              </div>
              <div class="profile__stats-item">
                <span class="profile__stats-item-name">% побед</span>
                <div class="profile__stats-item-value">
                  {{ formatPercent(profile.stats.win_rate) }}
                </div>
              </div>
              <div class="profile__stats-item">
                <span class="profile__stats-item-name">Территорий</span>
                <div class="profile__stats-item-value">
                  {{ formatStat(profile.stats.total_territories_captured) }}
                </div>
              </div>
              <div class="profile__stats-item">
                <span class="profile__stats-item-name">Вопросов</span>
                <div class="profile__stats-item-value">
                  {{ formatStat(profile.stats.total_questions_answered) }}
                </div>
              </div>
              <div class="profile__stats-item">
                <span class="profile__stats-item-name">Точность</span>
                <div class="profile__stats-item-value">{{ accuracy }}</div>
              </div>
            </div>
          </div>

          <!-- Друзья -->
          <div class="profile__friends">
            <div class="profile__friends-header">
              <h3>Друзья</h3>
              <MainButton
                title="Добавить"
                size="small"
                color="green"
                @click="showSearch = !showSearch"
              />
            </div>
            <div v-if="friends" class="profile__friends-content">
              <div v-if="friends.length < 1" class="profile__friends-none">Нет друзей</div>
              <div v-else class="profile__friends-list">
                <div
                  v-for="item in friends"
                  :key="item.id"
                  class="profile__friends-item"
                  @click="fetchUserProfile(item.id)"
                >
                  <PlayerIcon :name="item.name" no-tooltip />
                  <div class="profile__friends-item-info">
                    <span class="profile__friends-item-name">{{ item.name }}</span>
                    <span class="profile__friends-item-meta">
                      {{ item.stats.games_played }} игр · {{ item.stats.games_won }} побед
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <SearchPlayerModal v-model:show="showSearch" />
  <UserProfileModal
    v-if="selectedUser"
    v-model:show="showProfile"
    :user="selectedUser"
    @deleted="fetchFriends"
  />
  <EditRowModal v-model:show="showEditProfile" type="profile-edit" @action="fetchProfile" />
</template>

<script setup lang="ts">
import MainButton from '@/components/ui/button/MainButton.vue'
import { api, type Friend, type PublicUserProfile, type UserProfile } from '@/api'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import SearchPlayerModal from '@/components/modals/SearchPlayerModal.vue'
import PlayerIcon from '@/components/games/PlayerIcon.vue'
import UserProfileModal from '@/components/modals/UserProfileModal.vue'
import EditRowModal from '@/components/modals/EditRowModal.vue'
import { useWebSocket } from '@/api'

const ws = useWebSocket()
const processingStore = useProcessingStore()
const profile = ref<UserProfile>()
const friends = ref<Friend[]>([])
const showSearch = ref<boolean>(false)
const showProfile = ref<boolean>(false)
const showEditProfile = ref<boolean>(false)
const selectedUser = ref<PublicUserProfile>()

const accuracy = computed(() => {
  const s = profile.value?.stats
  if (!s || s.total_questions_answered <= 0) return '—'
  return formatPercent(s.total_correct_answers / s.total_questions_answered)
})

function formatPercent(value: number): string {
  return Math.round(value * 100) + '%'
}

function formatStat(value: number): string | number {
  return value < 0 ? 0 : value
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

async function fetchProfile() {
  try {
    processingStore.startLoading()
    profile.value = await api.user.getProfile()
  } catch (error) {
    console.log(error)
  } finally {
    processingStore.stopLoading()
  }
}

async function fetchFriends() {
  try {
    processingStore.startLoading()
    friends.value = await api.friends.list()
  } catch (error) {
    console.log(error)
  } finally {
    processingStore.stopLoading()
  }
}

async function fetchUserProfile(id: string) {
  try {
    processingStore.startLoading()
    selectedUser.value = await api.user.getPublicProfile(id)
    showProfile.value = true
  } catch (error) {
    console.error(error)
  } finally {
    processingStore.stopLoading()
  }
}

onMounted(() => {
  fetchProfile()
  fetchFriends()
})

let unsubNotification: (() => void) | null = null

onMounted(() => {
  unsubNotification = ws.notifications.onNotification((data) => {
    if (data.type === 'friend_accepted') {
      fetchFriends()
    }
  })
})

onUnmounted(() => {
  unsubNotification?.()
})
</script>

<style scoped lang="scss">
.profile {
  padding: 24px $side-padding 64px $side-padding;

  &__container {
    max-width: 1080px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__user {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    background: #fff;
    border-radius: $border-radius;
    border: 2px solid $border;
    box-shadow: 4px 6px 0px $border;

    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &-info {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    &-name {
      color: $text-dark;
    }

    &-meta {
      @include body-2;
      color: $text-grey;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__stats {
    padding: 20px;
    background: #fff;
    border-radius: $border-radius;
    border: 2px solid $border;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 4px 6px 0px $border;

    &-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    &-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      border: 2px solid $border;
      border-radius: $border-radius;
      box-shadow: $box-shadow;

      &-name {
        @include body-2;
        color: $text-grey;
      }

      &-value {
        text-align: center;
        font-size: 2rem;
        font-weight: 700;
        color: $primary-purple;
      }
    }
  }

  &__friends {
    padding: 20px;
    background: #fff;
    border-radius: $border-radius;
    border: 2px solid $border;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 4px 6px 0px $border;

    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &-content {
      display: flex;
      flex-direction: column;
    }

    &-none {
      color: $text-grey;
      @include caption;
      margin: 20px auto;
    }

    &-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    &-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px;
      border-radius: $border-radius;
      cursor: pointer;
      transition: background 0.15s ease;

      &:hover {
        background: $background;
      }

      &-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      &-name {
        @include body-1-bold;
        color: $text-dark;
      }

      &-meta {
        @include body-2;
        color: $text-grey;
      }
    }
  }
}
</style>
