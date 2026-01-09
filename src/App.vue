<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <HeaderBar />
    <n-scrollbar class="scrollbar">
      <div class="main">
        <router-view />
      </div>
      <FooterBar />
    </n-scrollbar>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NScrollbar } from 'naive-ui'
import HeaderBar from '@/components/template/HeaderBar.vue'
import FooterBar from '@/components/template/FooterBar.vue'

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
}
</script>

<style lang="scss">
.main {
  width: 100%;
  min-height: calc(100vh - $header-height - $footer-height);
  position: relative;
}

.scrollbar {
  max-height: calc(100vh - $header-height);
}
</style>
