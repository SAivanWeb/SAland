<template>
  <div class="header">
    <div class="header__container">
      <div class="header__logo" @click="toMain"></div>
      <div class="header__nav">
        <MainButton
          v-if="!isAuth && !isAuthPage"
          title="войти"
          size="small"
          color="green"
          @click="toAuth"
        />
        <Notification v-if="show" />
        <Menu v-if="show" />
      </div>
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
import Notification from '@/components/system/Notification.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isAuth = computed(() => {
  return userStore.currentUser !== null
})

const isAuthPage = computed(() => {
  return route.path === '/auth'
})

const show = computed(() => {
  return !(
    route.path === '/auth' ||
    route.path === '/' ||
    route.path === '/instruction' ||
    route.path === '/user-politic'
  )
})

const toAuth = () => {
  router.push('/auth')
}

const toMain = () => {
  router.push('/')
}
</script>

<style lang="scss">
.header {
  width: 100%;
  min-height: calc(#{$header-height} + env(safe-area-inset-top));
  border-bottom: 2px solid $border;
  display: flex;
  align-items: center;
  padding: env(safe-area-inset-top) $side-padding 0;
  background: $primary-yellow;

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

  &__nav {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  &__logo {
    width: 34px;
    height: 34px;
    cursor: pointer;
    background: $text-dark;
    border-radius: 50%;
  }
}
</style>
