<template>
  <div class="auth">
    <n-tabs class="auth__tabs" default-value="login" size="large" animated>
      <n-tab-pane name="login" tab="Вход">
        <form class="auth__form" @submit.prevent="login">
          <MainInput
            name="email"
            label="Ваша почта"
            placeholder="Введите почту"
            v-model="loginData.email"
            size="large"
          />
          <MainInput
            name="password"
            label="Пароль"
            placeholder="Введите пароль"
            field-type="password"
            v-model="loginData.password"
            size="large"
          />
          <MainButton title="Вход" size="large" attr-type="submit" :disabled="disableLogin" />
        </form>
      </n-tab-pane>
      <n-tab-pane name="signin" tab="Регистрация">
        <form class="auth__form" @submit.prevent="register">
          <MainInput
            name="name"
            label="Имя пользователя"
            placeholder="Введите имя"
            v-model="regData.name"
            size="large"
          />
          <MainInput
            name="email"
            label="Ваша почта"
            placeholder="Введите почту"
            v-model="regData.email"
            size="large"
          />
          <MainInput
            name="password"
            label="Пароль"
            placeholder="Введите пароль"
            field-type="password"
            v-model="regData.password"
            size="large"
          />
          <MainButton title="Регистрация" size="large" attr-type="submit" :disabled="disableReg" />
        </form>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { NTabs, NTabPane } from 'naive-ui'
import MainInput from '@/components/ui/input/MainInput.vue'
import { computed, ref } from 'vue'
import type { LoginRequest, RegisterRequest } from '@/api'
import MainButton from '@/components/ui/button/MainButton.vue'
import { useUserStore } from '@/stores/useUserStore.ts'

const userStore = useUserStore()

const disableReg = computed(() => {
  return !regData.value.email || !regData.value.password || !regData.value.name
})

const disableLogin = computed(() => {
  return !loginData.value.email || !loginData.value.password
})

const regData = ref<RegisterRequest>({
  email: '',
  name: '',
  password: '',
})

const loginData = ref<LoginRequest>({
  email: '',
  password: '',
})

const login = () => {
  userStore.loginUser(loginData.value)
}

const register = () => {
  userStore.registerUser(regData.value)
}
</script>

<style scoped lang="scss">
.auth {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 24px 28px;
  background: #fff;
  border-radius: $border-radius;
  border: 2px solid $border;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 90vw;
  max-width: 450px;
  box-shadow: 4px 6px 0px $border;

  @media (max-width: 900px) {
    padding: 16px;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 4px;
  }
}
</style>
