<template>
  <n-popover
    style="padding: 0; top: 12px; right: 50px"
    trigger="click"
    placement="bottom"
    :show-arrow="false"
  >
    <template #trigger>
      <n-icon size="36" color="#151515" class="menu__button">
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
  return () => h(NIcon, { size: 24, color: '#151515' }, { default: () => h(icon) })
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

<style lang="scss">
.menu__button {
  cursor: pointer;
  transition: all 0.2s ease;
}

.n-menu {
  border-radius: $border-radius;
}

.n-menu .n-menu-item-content .n-menu-item-content-header a,
.n-menu .n-menu-item-content .n-menu-item-content-header {
  color: $text-dark;
}

.n-menu
  .n-menu-item-content:not(.n-menu-item-content--disabled):hover
  .n-menu-item-content-header
  a,
.n-menu .n-menu-item-content:not(.n-menu-item-content--disabled):hover .n-menu-item-content-header {
  color: $text-dark;
}

.n-menu .n-menu-item-content:not(.n-menu-item-content--disabled):hover::before {
  background-color: $primary-red;
}

.n-menu .n-menu-item-content.n-menu-item-content--selected .n-menu-item-content-header a,
.n-menu
  .n-menu-item-content:not(.n-menu-item-content--disabled).n-menu-item-content--selected:hover
  .n-menu-item-content-header a {
  color: $text-dark;
}

.n-menu .n-menu-item-content.n-menu-item-content--selected::before,
.n-menu
  .n-menu-item-content:not(
    .n-menu-item-content--disabled
  ).n-menu-item-content--selected:hover::before {
  background-color: $primary-red;
}
</style>
