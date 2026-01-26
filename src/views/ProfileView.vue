<template>
  <div class="profile">
    <div class="profile__container">
      <h1>Профиль</h1>
      <div class="profile__content">
        <div class="profile__user">
          <PersonCircle class="profile__user-avatar" />
          <h2 class="profile__user-name">MC_TRAHER</h2>
          <MainButton title="Редактировать" size="medium" />
        </div>
        <div class="profile__info">
          <div class="profile__stats">
            <h2>Статистика</h2>
            <div v-if="profile" class="profile__stats-items">
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
              <MainButton title="Добавить" size="small" />
            </div>
            <div class="profile__friends-content">
              <div class="profile__friends-none">Нет друзей</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PersonCircle } from '@vicons/ionicons5'
import MainButton from '@/components/ui/button/MainButton.vue'
import { api, type Friend, type UserProfile } from '@/api'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { onMounted, ref } from 'vue'

const processingStore = useProcessingStore()
const profile = ref<UserProfile>()
const friends = ref<Friend[]>([])

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
    const res = await api.friends.list()
    friends.value = res.friends
  } catch (error) {
    console.log(error)
  } finally {
    processingStore.stopLoading()
  }
}

onMounted(() => {
  fetchProfile()
  fetchFriends()
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

  h1 {
    color: $text-primary;
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
    background: $second-background;
    border-radius: $border-radius;
    border: 1px solid $border;
    transition: all 0.2s ease;

    &:hover {
      border-color: $border-accent;
    }

    &-avatar {
      color: $primary;
      width: 80%;
      margin: 0 auto;
      filter: drop-shadow(0 0 10px $primary-glow);
    }

    &-name {
      margin: 0 auto;
      color: $text-primary;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__stats {
    padding: 20px;
    background: $second-background;
    border-radius: $border-radius;
    border: 1px solid $border;
    display: flex;
    flex-direction: column;
    gap: 16px;
    transition: all 0.2s ease;

    &:hover {
      border-color: $border-accent;
    }

    h2 {
      color: $text-primary;
    }

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
      background: $third-background;
      border: 1px solid $border;
      padding: 12px;
      border-radius: $border-radius;
      transition: all 0.2s ease;

      &:hover {
        border-color: $primary;
        box-shadow: 0 0 15px $primary-muted;
      }

      &-name {
        @include body-1;
        color: $text-secondary;
      }

      &-value {
        text-align: center;
        font-size: 2rem;
        font-weight: 700;
        color: $primary;
        text-shadow: 0 0 15px $primary-glow;
      }
    }
  }

  &__friends {
    padding: 20px;
    background: $second-background;
    border-radius: $border-radius;
    border: 1px solid $border;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 140px;
    transition: all 0.2s ease;

    &:hover {
      border-color: $border-accent;
    }

    h2 {
      color: $text-primary;
    }

    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    &-none {
      margin: 0 auto;
      color: $text-muted;
      font-style: italic;
    }
  }
}
</style>
