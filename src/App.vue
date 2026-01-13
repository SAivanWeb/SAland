<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <HeaderBar v-if="!isGame" />
    <n-scrollbar class="scrollbar">
      <div class="main" :class="{ main_game: isGame }">
        <router-view />
      </div>
      <FooterBar v-if="!isGame" />
    </n-scrollbar>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NScrollbar } from 'naive-ui'
import HeaderBar from '@/components/template/HeaderBar.vue'
import FooterBar from '@/components/template/FooterBar.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const themeOverrides = {
  common: {
    fontSize: '16px',
    primaryColor: '#3cade6',
    primaryColorHover: '#4098FCFF',
    primaryColorPressed: '#1060C9FF',
    primaryColorSuppl: '#4098FCFF',
  },
  Divider: {
    color: '#dfdfe4',
  },
  Button: {
    fontSizeMedium: '16px',
  },
  Drawer: {
    bodyPadding: '12px',
  },
}

const route = useRoute()

const isGame = computed(() => {
  return route.path.includes('/game/')
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
</style>
