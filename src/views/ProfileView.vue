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
            <h3>Статистика</h3>
            <div class="profile__stats-items">
              <div class="profile__stats-item">
                <h4 class="profile__stats-item-name">Сражений</h4>
                <div class="profile__stats-item-value">20</div>
              </div>
              <div class="profile__stats-item">
                <h4 class="profile__stats-item-name">Выиграно</h4>
                <div class="profile__stats-item-value">10</div>
              </div>
            </div>
          </div>
          <div class="profile__friends">
            <div class="profile__friends-header">
              <h3>Друзья</h3>
              <MainButton title="Добавить" size="small" />
            </div>
            <div class="profile__friends-invite">
              <h4>Приглашения в друзья:</h4>
              <div class="profile__friends-none">Нет активных пришлашений</div>
            </div>
            <div class="profile__friends-invite">
              <h4>Активные:</h4>
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
    gap: 12px;
  }

  &__user {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid $border;

    &-avatar {
      color: $primary;
      width: 80%;
      margin: 0 auto;
    }

    &-name {
      margin: 0 auto;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__stats {
    padding: 12px 16px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid $border;
    display: flex;
    flex-direction: column;
    gap: 12px;
    &-items {
      display: flex;
      justify-content: space-around;
      gap: 12px;
    }

    &-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;

      &-value {
        font-size: 2rem;
        font-weight: 500;
      }
    }
  }

  &__friends {
    padding: 12px 16px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid $border;
    display: flex;
    flex-direction: column;
    gap: 12px;

    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    &-invite {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    &-none {
      margin: 0 auto;
    }
  }
}
</style>
