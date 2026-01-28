<template>
  <div class="card">
    <h3 class="card__title">Спорт</h3>
    <div class="card__body">
      <div class="card__item">
        <div class="card__item-value">
          <n-icon size="24" color="#06D6A0">
            <Accessibility />
          </n-icon>
          3
        </div>
      </div>
      <div class="card__item">
        <div class="card__item-value">
          <n-icon size="24" color="#FFD166">
            <Star />
          </n-icon>
          5
        </div>
      </div>
      <div class="card__item">
        <div class="card__item-values">
          <div class="card__item-value">
            <n-icon size="24" color="#06D6A0">
              <Like />
            </n-icon>
            10
          </div>
          <div class="card__item-value">
            <n-icon size="24" color="#EF476F">
              <Dislike />
            </n-icon>
            2
          </div>
        </div>
      </div>
    </div>
    <div class="card__footer">
      <MainButton title="Создать комнату" size="small" color="green"/>
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
  padding: 16px 20px;
  background: $primary-yellow;
  border-radius: $border-radius;
  border: 2px solid $border;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__title {
    color: $text-dark;
  }

  &__body {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  &__item {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &-value {
      display: flex;
      align-items: center;
      gap: 6px;
      color: $text-dark;
      font-weight: 500;
    }

    &-values {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: end;
  }
}
</style>
