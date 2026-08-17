<template>
  <div class="admin">
    <div class="admin__container">
      <h1>Администрирование</h1>
      <div class="admin__content">
        <n-tabs default-value="users" type="segment" size="medium" justify-content="space-evenly">
          <n-tab-pane name="users" tab="Пользователи">
            <UsersTab />
          </n-tab-pane>
          <n-tab-pane name="themes" tab="Темы">
            <ThemesTab />
          </n-tab-pane>
          <n-tab-pane name="games" tab="Игры">
            <GamesTab />
          </n-tab-pane>
          <n-tab-pane name="reports" tab="Жалобы">
            <ReportsTab />
          </n-tab-pane>
        </n-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NTabs, NTabPane } from 'naive-ui'
import UsersTab from '@/components/admin/UsersTab.vue'
import ReportsTab from '@/components/admin/ReportsTab.vue'
import GamesTab from '@/components/admin/GamesTab.vue'
import ThemesTab from '@/components/admin/ThemesTab.vue'
</script>

<style scoped lang="scss">
.admin {
  padding: 24px $side-padding 64px $side-padding;

  &__container {
    max-width: 1440px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
}

:deep(.n-tabs-tab__label) {
  @include body-1-bold;
}
</style>
