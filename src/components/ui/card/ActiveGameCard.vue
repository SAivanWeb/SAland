<template>
  <div class="card">
    <h3 class="card__title">География России</h3>
    <div class="card__body">
      <n-icon class="card__connect" size="64" color="#3889C5FF">
        <AddCircleOutline />
      </n-icon>
      <n-icon size="36" color="#e5e5e6">
        <swords />
      </n-icon>
      <n-icon class="card__connect" size="64" color="#3889C5FF">
        <AddCircleOutline />
      </n-icon>
      <n-icon size="36" color="#e5e5e6">
        <swords />
      </n-icon>
      <n-icon class="card__connect" size="64" color="#3889C5FF">
        <AddCircleOutline />
      </n-icon>
      <n-icon size="36" color="#e5e5e6">
        <swords />
      </n-icon>
      <n-icon class="card__connect" size="64" color="#3889C5FF">
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
    gap: 12px;
  }

  &__connect {
    cursor: pointer;
  }
}
</style>
