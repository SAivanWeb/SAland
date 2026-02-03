<template>
  <div class="card">
    <div class="card__header">
      <h3 class="card__title">Спорт</h3>
      <div class="card__rating">
        <n-icon size="20" color="#FFD166">
          <Star />
        </n-icon>
        <span>5.0</span>
      </div>
    </div>
    <div class="card__stats">
      <div class="card__stat card__stat--like">
        <n-icon size="18">
          <Like />
        </n-icon>
        <span>10</span>
      </div>
      <div class="card__stat card__stat--dislike">
        <n-icon size="18">
          <Dislike />
        </n-icon>
        <span>2</span>
      </div>
    </div>
    <div class="card__footer">
      <MainButton title="Играть" size="small" color="yellow" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MainButton from '@/components/ui/button/MainButton.vue'
import { NIcon } from 'naive-ui'
import { Accessibility, Star } from '@vicons/ionicons5'
import Like from '@/assets/icons/like.vue'
import Dislike from '@/assets/icons/dislike.vue'
</script>

<style scoped lang="scss">
.card {
  padding: 16px;
  background: $primary-blue;
  border-radius: $border-radius;
  border: 2px solid $border;
  box-shadow: $box-shadow;
  min-width: 220px;
  max-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 2px 6px 0px $border;
  }

  &:active {
    transform: translateY(-2px);
    box-shadow: 1px 3px 0px $border;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  &__title {
    color: $text-dark;
    @include body-1-bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__rating {
    display: flex;
    align-items: center;
    gap: 4px;
    background: $primary-yellow;
    padding: 4px 8px;
    border-radius: 6px;
    border: 2px solid $border;

    & span {
      @include body-2-bold;
      color: $text-dark;
    }
  }

  &__stats {
    display: flex;
    gap: 8px;
  }

  &__stat {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    border-radius: 6px;
    border: 2px solid $border;
    flex: 1;

    & span {
      @include body-2-bold;
      color: $text-dark;
    }

    &--like {
      background: $primary-green;
    }

    &--dislike {
      background: $primary-red;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: stretch;

    & button {
      width: 100%;
    }
  }
}
</style>
