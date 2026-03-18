<template>
  <div class="admin">
    <div class="admin__container">
      <h1>Администрирование</h1>
      <div class="admin__content">
        <n-tabs default-value="users" type="segment" size="medium" justify-content="space-evenly">
          <n-tab-pane name="users" tab="Пользователи">
            <MainTable :headers="usersHeaders" :items="userData" itemKey="id"/>
          </n-tab-pane>
          <n-tab-pane name="themes" tab="Темы"></n-tab-pane>
          <n-tab-pane name="games" tab="Игры"></n-tab-pane>
          <n-tab-pane name="reports" tab="Жалобы"></n-tab-pane>
        </n-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NTabs, NTabPane } from 'naive-ui'
import MainTable from '@/components/ui/table/MainTable.vue'

const usersHeaders = [
  {
    display_name: 'ID',
    value: 'id',
  },
  {
    display_name: 'Имя',
    value: 'name',
  },
  {
    display_name: 'Создан',
    value: 'created_at',
  },
  {
    display_name: 'Статус',
    value: 'status',
  }
]

const userData = [
  {
    id: 1,
    name: 'user1',
    created_at: '2021-05-01',
    status: 'active'
  }
]
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
