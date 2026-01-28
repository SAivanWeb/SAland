<template>
  <div class="header">
    <div class="header__container">
      <div class="header__logo"></div>
      <div class="header__nav">
        <MainButton
          v-if="!isAuth && !isAuthPage"
          title="войти"
          size="small"
          color="green"
          @click="toAuth"
        />
        <template v-if="currentUser">
          <div
            v-if="isAuth || !isAuthPage"
            class="header__notification"
            :class="{ header__notification_has: currentUser.pending_requests_count > 0 }"
          >
            <n-icon size="20">
              <notification />
            </n-icon>
          </div>
        </template>
        <Menu v-if="isAuth || !isAuthPage" />
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
import { NIcon } from 'naive-ui'
import Notification from '@/assets/icons/notification.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isAuth = computed(() => {
  return userStore.currentUser !== null
})

const currentUser = computed(() => {
  return userStore.currentUser
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
  border-bottom: 2px solid $border;
  display: flex;
  align-items: center;
  padding: 0 $side-padding;
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

  &__notification {
    background-color: $primary-green;
    border-radius: 50%;
    border: 2px solid $border;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-box-shadow: 2px 4px 0px $border;
    -moz-box-shadow: 2px 4px 0px $border;
    box-shadow: 1px 2px 0px $border;
    cursor: pointer;
    position: relative;

    &_has {
      &::before {
        position: absolute;
        top: -2px;
        left: 22px;
        content: '';
        width: 10px;
        height: 10px;
        background: $text-dark;
        border-radius: 50%;
        z-index: 10;
      }
    }

    &:active {
      -webkit-box-shadow: 0px 0px 0px $border;
      -moz-box-shadow: 0px 0px 0px $border;
      box-shadow: 0px 0px 0px $border;
      transform: translate(1px, 2px);
    }
  }
}
</style>
