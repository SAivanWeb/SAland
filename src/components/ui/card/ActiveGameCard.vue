<template>
  <div class="card">
    <h3 class="card__title">География России</h3>
    <div class="card__body">
      <n-icon class="card__connect" size="64" color="#FFD166">
        <AddCircleOutline />
      </n-icon>
      <n-icon size="36" color="#666666">
        <swords />
      </n-icon>
      <n-icon class="card__connect" size="64" color="#FFD166">
        <AddCircleOutline />
      </n-icon>
      <n-icon size="36" color="#666666">
        <swords />
      </n-icon>
      <n-icon class="card__connect" size="64" color="#FFD166">
        <AddCircleOutline />
      </n-icon>
      <n-icon size="36" color="#666666">
        <swords />
      </n-icon>
      <n-icon class="card__connect" size="64" color="#FFD166">
        <AddCircleOutline />
      </n-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AddCircleOutline } from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
import Swords from '@/assets/icons/swords.vue'
</script>

<style scoped lang="scss">
.card {
  padding: 16px 20px;
  background: $second-background;
  border-radius: $border-radius;
  border: 1px solid $border;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: $border-accent;
    background: $third-background;
  }

  &__title {
    color: $text-primary;
  }

  &__body {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__connect {
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.1);
      filter: brightness(1.2);
    }
  }
}
</style>
