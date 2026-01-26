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

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password: string): boolean => {
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const countSymbols = password.length >= 8
  return hasUppercase && hasLowercase && hasNumber && countSymbols
}

const isEmailValid = computed(() => validateEmail(regData.value.email))
const isPasswordValid = computed(() => validatePassword(regData.value.password))
const isLoginEmailValid = computed(() => validateEmail(loginData.value.email))

const disableReg = computed(() => {
  return !regData.value.name || !isEmailValid.value || !isPasswordValid.value
})

const disableLogin = computed(() => {
  return !isLoginEmailValid.value || !loginData.value.password
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
  background: $second-background;
  border-radius: $border-radius-lg;
  border: 1px solid $border;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 450px;
  box-shadow:
    0 8px 40px rgba(0, 0, 0, 0.4),
    0 0 60px $primary-muted;

  &__form {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  :deep(.n-tabs-wrapper) {
    margin: 0 auto;
  }

  :deep(.n-tabs .n-tabs-bar) {
    display: none;
  }

  :deep(.n-tabs-tab--active .n-tabs-tab__label) {
    color: $primary !important;
  }

  :deep(.n-tabs-tab__label) {
    font-size: 28px;
    font-style: normal;
    font-weight: 800;
    line-height: 36px;
  }
}
</style>
