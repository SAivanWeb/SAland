<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-modal-provider>
      <HeaderBar v-if="!isGame" />
      <n-scrollbar class="scrollbar">
        <div class="main" :class="{ main_game: isGame }">
          <router-view />
        </div>
        <FooterBar v-if="!isGame" />
      </n-scrollbar>
      <Preloader v-show="showPreloader" class="preloader" />
    </n-modal-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NScrollbar, NModalProvider, darkTheme } from 'naive-ui'
import HeaderBar from '@/components/template/HeaderBar.vue'
import FooterBar from '@/components/template/FooterBar.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import Preloader from '@/components/template/Preloader.vue'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'

const themeOverrides = {
  common: {
    fontSize: '16px',
  },
  Menu: {
    color: '#fff',
    borderRadius: '8px'
  },
  Card: {
    borderRadius: '8px',
  }
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
</style>
