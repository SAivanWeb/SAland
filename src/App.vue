<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-notification-provider>
      <n-modal-provider>
        <div class="sota">
          <HeaderBar v-if="!isGame" />
          <n-scrollbar class="scrollbar">
            <div class="main" :class="{ main_game: isGame }">
              <router-view />
            </div>
            <FooterBar v-if="!isGame" />
          </n-scrollbar>
        </div>
        <div class="decorations">
          <div class="decorations__hex decorations__hex--1"></div>
          <div class="decorations__hex decorations__hex--2"></div>
          <div class="decorations__hex decorations__hex--3"></div>
          <div class="decorations__hex decorations__hex--4"></div>
        </div>
        <Preloader v-show="showPreloader" class="preloader" />
        <NotifyHost />
      </n-modal-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NScrollbar, NModalProvider, NNotificationProvider } from 'naive-ui'
import HeaderBar from '@/components/template/HeaderBar.vue'
import FooterBar from '@/components/template/FooterBar.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import Preloader from '@/components/system/Preloader.vue'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import NotifyHost from '@/components/system/NotifyHost.vue'

const themeOverrides = {
  common: {
    fontSize: '16px',
  },
  Menu: {
    color: '#fff',
    borderRadius: '8px',
  },
  Card: {
    borderRadius: '8px',
  },
}

const route = useRoute()
const processingStore = useProcessingStore()

const isGame = computed(() => {
  return route.path.includes('/game/')
})

const showPreloader = computed(() => {
  return processingStore.loading
})
</script>

<style lang="scss">
.sota{
  position: relative;
  z-index: 2;
}

.main {
  width: 100%;
  min-height: calc(100vh - $header-height - $footer-height);
  position: relative;

  &_game {
    min-height: 100vh;
  }
}

.scrollbar {
  max-height: calc(100vh - $header-height);

  &:has(.main_game) {
    max-height: 100vh;
  }
}

.preloader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
}

.decorations {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;

  &__hex {
    position: fixed;
    filter: drop-shadow(2px 2px 0px rgba($border, 0.3));

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      border-left: solid transparent;
      border-right: solid transparent;
      border-bottom: solid;
      transform: translateY(-100%);
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      border-left: solid transparent;
      border-right: solid transparent;
      border-top: solid;
      transform: translateY(100%);
    }

    // Большой шестиугольник слева вверху
    &--1 {
      top: 10%;
      left: -50px;
      width: 120px;
      height: 70px;
      background: rgba($primary-purple, 0.25);

      &::before {
        border-left-width: 60px;
        border-right-width: 60px;
        border-bottom-width: 35px;
        border-bottom-color: rgba($primary-purple, 0.25);
      }

      &::after {
        border-left-width: 60px;
        border-right-width: 60px;
        border-top-width: 35px;
        border-top-color: rgba($primary-purple, 0.25);
      }
    }

    // Средний шестиугольник справа вверху
    &--2 {
      top: 20%;
      right: -40px;
      width: 90px;
      height: 50px;
      background: rgba($primary-yellow, 0.22);
      filter: drop-shadow(1px 1px 0px rgba($border, 0.3));

      &::before {
        border-left-width: 45px;
        border-right-width: 45px;
        border-bottom-width: 25px;
        border-bottom-color: rgba($primary-yellow, 0.22);
      }

      &::after {
        border-left-width: 45px;
        border-right-width: 45px;
        border-top-width: 25px;
        border-top-color: rgba($primary-yellow, 0.22);
      }
    }

    // Маленький шестиугольник слева внизу
    &--3 {
      bottom: 20%;
      left: 10%;
      width: 70px;
      height: 40px;
      background: rgba($primary-green, 0.2);
      filter: drop-shadow(1px 1px 0px rgba($border, 0.25));

      &::before {
        border-left-width: 35px;
        border-right-width: 35px;
        border-bottom-width: 20px;
        border-bottom-color: rgba($primary-green, 0.2);
      }

      &::after {
        border-left-width: 35px;
        border-right-width: 35px;
        border-top-width: 20px;
        border-top-color: rgba($primary-green, 0.2);
      }
    }

    // Большой шестиугольник справа внизу
    &--4 {
      bottom: 8%;
      right: 30px;
      width: 110px;
      height: 65px;
      background: rgba($primary-orange, 0.25);

      &::before {
        border-left-width: 55px;
        border-right-width: 55px;
        border-bottom-width: 32px;
        border-bottom-color: rgba($primary-orange, 0.25);
      }

      &::after {
        border-left-width: 55px;
        border-right-width: 55px;
        border-top-width: 32px;
        border-top-color: rgba($primary-orange, 0.25);
      }
    }
  }
}
</style>
