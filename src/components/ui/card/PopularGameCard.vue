<template>
  <div class="card">
    <h3 class="card__title">Спорт</h3>
    <div class="card__body">
      <div class="card__item">
        <div class="card__item-value">
          <n-icon size="24" color="#3cade6">
            <Accessibility />
          </n-icon>
          3
        </div>
      </div>
      <div class="card__item">
        <div class="card__item-value">
          <n-icon size="24" color="#ffba00">
            <Star />
          </n-icon>
          5
        </div>
      </div>
      <div class="card__item">
        <div class="card__item-values">
          <div class="card__item-value">
            <n-icon size="24" color="#008a00">
              <Like />
            </n-icon>
            10
          </div>
          <div class="card__item-value">
            <n-icon size="24" color="#e00501">
              <Dislike />
            </n-icon>
            2
          </div>
        </div>
      </div>
    </div>
    <div class="card__footer">
      <MainButton title="Создать комнату" size="small" />
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
  padding: 12px 16px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid $border;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;

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
