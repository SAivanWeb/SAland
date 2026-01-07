<template>
  <div class="header">
    <div class="header__container">
      <MainButton v-if="isAuth" title="ВОЙТИ" size="medium" />
      <Menu v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import MainButton from '@/components/ui/button/MainButton.vue'
import { useUserStore } from '@/stores/useUserStore.ts'
import { computed } from 'vue'
import Menu from '@/components/template/Menu.vue'

const userStore = useUserStore()

const isAuth = computed(() => {
  return userStore.currentUser !== null
})
</script>

<style scoped lang="scss">
.header {
  width: 100%;
  border-bottom: 1px solid $border;
  height: $header-height;
  display: flex;
  align-items: center;
  padding: 0 $side-padding;
  background: #fff;

  &__container {
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
