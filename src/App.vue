<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <div class="main">
      <HeaderBar />
      <router-view />
    </div>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider } from 'naive-ui'
import HeaderBar from '@/components/template/HeaderBar.vue'

const themeOverrides = {
  common: {
    fontSize: '16px',
    borderRadius: '12px',
  },
}

</script>

<style scoped lang="scss"></style>
