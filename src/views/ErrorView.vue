<template>
  <div class="error">
    <div class="error__content">
      <n-icon class="error__content-ico" size="64">
        <Error />
      </n-icon>
      <h2>Возникла непредвиденная ошибка</h2>
      <p>Перезагрузите страницу или вернитесь на главную</p>
      <MainButton title="На главную" @click="toGames" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { NIcon } from 'naive-ui'
import Error from '@/assets/icons/Error.vue'
import MainButton from '@/components/ui/button/MainButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const toGames = () => {
  router.push('/')
}
</script>

<style scoped lang="scss">
.error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    &-ico {
      color: $primary-red;
    }

    & h2 {
      margin-bottom: 12px;
    }

    & p{
      margin-bottom: 24px;
    }
  }
}
</style>
