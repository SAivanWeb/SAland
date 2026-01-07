<template>
  <n-popover trigger="click" placement="bottom">
    <template #trigger>
      <n-icon size="36" color="#3cade6">
        <Menu />
      </n-icon>
    </template>
    <n-menu :options="menuOptions" @update:value="logout" />
  </n-popover>
</template>

<script setup lang="ts">
import { NPopover, NIcon, NMenu } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import { Menu, GameController, Person, Exit } from '@vicons/ionicons5'
import type { Component } from 'vue'
import { h } from 'vue'
import { RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore.ts'

const userStore = useUserStore()

function renderIcon(icon: Component) {
  return () => h(NIcon, { size: 24, color: '#3cade6' }, { default: () => h(icon) })
}

const menuOptions: MenuOption[] = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            path: '/games',
          },
        },
        { default: () => 'Игры' },
      ),
    key: 'toGames',
    icon: renderIcon(GameController),
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            path: '/profile',
          },
        },
        { default: () => 'Профиль' },
      ),
    key: 'toProfile',
    icon: renderIcon(Person),
  },
  {
    label: 'Выход',
    key: 'logout',
    icon: renderIcon(Exit),
  },
]

function logout(key: string) {
  if (key === 'logout') userStore.logout()
}
</script>

<style scoped></style>
