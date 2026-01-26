<template>
  <div class="header">
    <div class="header__container">
      <div class="header__logo"></div>
      <MainButton v-if="!isAuth && !isAuthPage" title="войти" size="medium" @click="toAuth" />
      <Menu v-else-if="isAuth || !isAuthPage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MainButton from '@/components/ui/button/MainButton.vue'
import { useUserStore } from '@/stores/useUserStore.ts'
import { computed } from 'vue'
import Menu from '@/components/template/Menu.vue'
import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isAuth = computed(() => {
  return userStore.currentUser !== null
})

const isAuthPage = computed(() => {
  return route.path === '/auth'
})

const toAuth = () => {
  router.push('/auth')
}
</script>

<style lang="scss">
.header {
  width: 100%;
  height: $header-height;
  border-bottom: 1px solid $border;
  display: flex;
  align-items: center;
  padding: 0 $side-padding;
  background: $second-background;

  &__container {
    width: 100%;
    max-width: 1080px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  & .n-popover {
    padding: 0 !important;
  }
}
</style>
