<template>
  <div class="card">
    <div class="card__info">
      <h3 class="card__title">География России</h3>
      <div class="card__meta">
        <div class="card__players-count">
          <n-icon size="18">
            <People />
          </n-icon>
          <span>2/4</span>
        </div>
      </div>
    </div>
    <div class="card__players">
      <div class="card__player card__player--filled">
        <PlayerIcon name="Иван" />
      </div>
      <div class="card__player card__player--filled">
        <PlayerIcon name="Мария" />
      </div>
      <div class="card__player card__player--empty">
        <n-icon size="24" color="#858585">
          <AddCircle />
        </n-icon>
      </div>
      <div class="card__player card__player--empty">
        <n-icon size="24" color="#858585">
          <AddCircle />
        </n-icon>
      </div>
    </div>
    <div class="card__action">
      <MainButton title="Войти" size="medium" color="yellow" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { People, AddCircle } from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
import PlayerIcon from '@/components/games/PlayerIcon.vue'
import MainButton from '@/components/ui/button/MainButton.vue'
</script>

<style scoped lang="scss">
.card {
  padding: 16px 20px;
  background: $primary-green;
  border-radius: $border-radius;
  border: 2px solid $border;
  box-shadow: $box-shadow;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.2s ease;

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  &__title {
    color: $text-dark;
    @include body-1-bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__players-count {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: $primary-yellow;
    border: 2px solid $border;
    border-radius: 6px;

    & span {
      @include body-2-bold;
      color: $text-dark;
    }
  }

  &__players {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__player {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    transition: all 0.2s ease;

    &--empty {
      border-radius: 50%;
      border: 2px solid $border;
      background: $background;
      cursor: pointer;

      &:hover {
        background: $primary-yellow;
        transform: scale(1.1);
      }
    }
  }

  &__action {
    margin-left: auto;
  }
}
</style>
