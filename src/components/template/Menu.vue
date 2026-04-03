<template>
  <n-popover
    style="padding: 0; top: 12px;"
    trigger="click"
    placement="bottom-end"
    :show-arrow="false"
    v-model:show="showMenu"
  >
    <template #trigger>
      <div class="menu__button">
        <n-icon size="20" color="#151515" class="menu__button-icon">
          <Menu />
        </n-icon>
      </div>
    </template>
    <n-menu :options="menuOptions" @update:value="logout" />
  </n-popover>
</template>

<script setup lang="ts">
import { NPopover, NIcon, NMenu } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import { Menu, GameController, Person, Exit, Shield } from '@vicons/ionicons5'
import type { Component } from 'vue'
import { h, computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/useUserStore.ts'

const userStore = useUserStore()

function renderIcon(icon: Component) {
  return () => h(NIcon, { size: 24, color: '#151515' }, { default: () => h(icon) })
}

const showMenu = ref<boolean>(false)

const menuOptions = computed(() => {
  if (userStore.currentUser) {
    const options: MenuOption[] = [
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

    if (userStore.currentUser.user.role === 'admin') {
      options.unshift(
        {
          label: () =>
            h(
              RouterLink,
              {
                to: {
                  path: '/admin',
                },
              },
              { default: () => 'Администрирование' },
            ),
          key: 'toAdmin',
          icon: renderIcon(Shield),
        }
      )
    }

    return options
  }
  return []
})

function logout(key: string) {
  showMenu.value = false
  if (key === 'logout') userStore.logout()
}
</script>

<style lang="scss">
.menu__button {
  cursor: pointer;
  background-color: $primary-green;
  border-radius: 50%;
  border: 2px solid $border;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $box-shadow;
  cursor: pointer;
  position: relative;
  &:active {
    -webkit-box-shadow: 0px 0px 0px $border;
    -moz-box-shadow: 0px 0px 0px $border;
    box-shadow: 0px 0px 0px $border;
    transform: translate(1px, 2px);
  }
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
  .n-menu-item-content-header
  a {
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
