<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
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
    // Primary (золотой желтый)
    primaryColor: '#FFD166',
    primaryColorHover: '#FFBE0B',
    primaryColorPressed: '#E6B85E',
    primaryColorSuppl: '#FFD166',
    // Info (бирюзовый)
    infoColor: '#06D6A0',
    infoColorHover: '#05B384',
    infoColorPressed: '#049A72',
    infoColorSuppl: '#06D6A0',
    // Success
    successColor: '#06D6A0',
    successColorHover: '#05B384',
    successColorPressed: '#049A72',
    successColorSuppl: '#06D6A0',
    // Warning (желтый)
    warningColor: '#FFD166',
    warningColorHover: '#FFBE0B',
    warningColorPressed: '#E6B85E',
    warningColorSuppl: '#FFD166',
    // Error
    errorColor: '#EF476F',
    errorColorHover: '#D63D5F',
    errorColorPressed: '#BD3450',
    errorColorSuppl: '#EF476F',
    // Backgrounds
    bodyColor: '#0D0D0D',
    cardColor: '#1A1A1A',
    modalColor: '#1A1A1A',
    popoverColor: '#1A1A1A',
    tableColor: '#1A1A1A',
    inputColor: '#242424',
    actionColor: '#242424',
    hoverColor: 'rgba(255, 209, 102, 0.1)',
    // Text
    textColorBase: '#FFFFFF',
    textColor1: '#FFFFFF',
    textColor2: '#A0A0A0',
    textColor3: '#666666',
    // Borders
    borderColor: 'rgba(255, 255, 255, 0.1)',
    dividerColor: 'rgba(255, 255, 255, 0.1)',
    // Border radius
    borderRadius: '8px',
    borderRadiusSmall: '6px',
  },
  Button: {
    fontSizeMedium: '16px',
    fontWeightStrong: '600',
    // Warning button (primary style)
    textColorWarning: '#0D0D0D',
    textColorHoverWarning: '#0D0D0D',
    textColorPressedWarning: '#0D0D0D',
    textColorFocusWarning: '#0D0D0D',
  },
  Card: {
    color: '#1A1A1A',
    colorModal: '#1A1A1A',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    titleTextColor: '#FFFFFF',
    textColor: '#A0A0A0',
  },
  Input: {
    color: '#242424',
    colorFocus: '#242424',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderHover: '1px solid rgba(255, 209, 102, 0.3)',
    borderFocus: '1px solid #FFD166',
    boxShadowFocus: '0 0 0 3px rgba(255, 209, 102, 0.2)',
    textColor: '#FFFFFF',
    placeholderColor: '#666666',
    caretColor: '#FFD166',
  },
  Drawer: {
    bodyPadding: '12px',
    color: '#1A1A1A',
    textColor: '#FFFFFF',
    titleTextColor: '#FFFFFF',
  },
  Modal: {
    color: '#1A1A1A',
    textColor: '#FFFFFF',
  },
  Divider: {
    color: 'rgba(255, 255, 255, 0.1)',
  },
  Progress: {
    railColor: '#242424',
  },
  Scrollbar: {
    color: '#242424',
    colorHover: '#666666',
  },
  Popover: {
    color: '#1A1A1A',
    textColor: '#FFFFFF',
  },
  Menu: {
    color: '#1A1A1A',
    itemTextColor: '#A0A0A0',
    itemTextColorHover: '#FFFFFF',
    itemTextColorActive: '#FFD166',
    itemIconColor: '#A0A0A0',
    itemIconColorHover: '#FFFFFF',
    itemIconColorActive: '#FFD166',
  },
  Badge: {
    color: '#EF476F',
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
