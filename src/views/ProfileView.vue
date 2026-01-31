<template>
  <div class="profile">
    <div v-if="profile" class="profile__container">
      <h1>Профиль</h1>
      <div class="profile__content">
        <div class="profile__user">
          <PersonCircle class="profile__user-avatar" />
          <h2 class="profile__user-name">{{ profile.name }}</h2>
          <MainButton title="Редактировать" size="large" color="green" />
        </div>
        <div class="profile__info">
          <div class="profile__stats">
            <h2>Статистика</h2>
            <div class="profile__stats-items">
              <div class="profile__stats-item">
                <span class="profile__stats-item-name">Сыграно</span>
                <div class="profile__stats-item-value">{{ profile.stats.games_played }}</div>
              </div>
              <div class="profile__stats-item">
                <span class="profile__stats-item-name">Побед</span>
                <div class="profile__stats-item-value">{{ profile.stats.games_won }}</div>
              </div>
              <div class="profile__stats-item">
                <span class="profile__stats-item-name">Правильных ответов</span>
                <div class="profile__stats-item-value">
                  {{ profile.stats.total_correct_answers }}
                </div>
              </div>
            </div>
          </div>
          <div class="profile__friends">
            <div class="profile__friends-header">
              <h2>Друзья</h2>
              <MainButton
                title="Добавить"
                size="small"
                @click="showSearch = !showSearch"
                color="green"
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
                  <PlayerIcon :name="item.name" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <SearchPlayerModal v-model:show="showSearch" />
  <UserProfileModal v-if="selectedUser" v-model:show="showProfile" :user="selectedUser" @deleted="fetchFriends" />
</template>

<script setup lang="ts">
import { PersonCircle } from '@vicons/ionicons5'
import MainButton from '@/components/ui/button/MainButton.vue'
import { api, type Friend, type PublicUserProfile, type UserProfile } from '@/api'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { onMounted, onUnmounted, ref } from 'vue'
import SearchPlayerModal from '@/components/modals/SearchPlayerModal.vue'
import PlayerIcon from '@/components/games/PlayerIcon.vue'
import UserProfileModal from '@/components/modals/UserProfileModal.vue'
import { useWebSocket } from '@/api'

const ws = useWebSocket()
const processingStore = useProcessingStore()
const profile = ref<UserProfile>()
const friends = ref<Friend[]>([])
const showSearch = ref<boolean>(false)
const showProfile = ref<boolean>(false)
const selectedUser = ref<PublicUserProfile>()

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
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 16px;
  }

  &__user {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    background: $primary-yellow;
    border-radius: $border-radius;
    border: 2px solid $border;
    transition: all 0.2s ease;
    box-shadow: 4px 6px 0px $border;

    &-avatar {
      color: $text-dark;
      width: 80%;
      margin: 0 auto;
    }

    &-name {
      margin: 0 auto;
      color: $text-dark;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__stats {
    padding: 20px;
    background: $primary-yellow;
    border-radius: $border-radius;
    border: 2px solid $border;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 4px 6px 0px $border;

    &-items {
      display: flex;
      justify-content: space-around;
      gap: 12px;
    }

    &-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      background: $primary-yellow;
      border: 1px solid $border;
      padding: 12px;
      border-radius: $border-radius;
      transition: all 0.2s ease;

      &-name {
        @include body-1;
      }

      &-value {
        text-align: center;
        font-size: 2rem;
        font-weight: 700;
        color: $primary-red;
      }
    }
  }

  &__friends {
    padding: 20px;
    background: $primary-yellow;
    border-radius: $border-radius;
    border: 2px solid $border;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 140px;
    box-shadow: 4px 6px 0px $border;

    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: auto 0;
    }

    &-none {
      margin: 0 auto;
      font-style: italic;
      color: $text-grey;
    }
  }
}
</style>
