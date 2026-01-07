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
  },
  Popover: {
    padding: '0px',
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
  padding: 0 $side-padding;
  min-height: calc(100vh - $header-height - $footer-height);
}

.scrollbar {
  max-height: calc(100vh - $header-height);
}
</style>
