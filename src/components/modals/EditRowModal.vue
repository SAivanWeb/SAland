<template>
  <ModalContainer v-model:show="show" modalWidth="500px">
    <template #header>
      <h3 v-if="type === 'user-edit'">Редактирование пользователя</h3>
      <h3 v-if="type === 'profile-edit'">Редактировать профиль</h3>
    </template>
    <template #body>
      <template v-if="type === 'user-edit'">
        <MainInput name="username" placeholder="Имя пользователя" v-model="nameValue" />
        <MainSelect
          name="status"
          placeholder="Статус"
          :options="statusOptions"
          v-model="statusValue"
        />
        <MainButton title="Сохранить" @click="saveUser" />
      </template>
      <template v-if="type === 'profile-edit'">
        <MainInput name="name" placeholder="Введите новое имя" v-model="nameValue" />
        <MainButton title="Сохранить" :disabled="!nameValue" @click="saveProfile" />
      </template>
    </template>
  </ModalContainer>
</template>

<script setup lang="ts">
import ModalContainer from '@/components/template/ModalContainer.vue'
import { type AdminUser, useApi } from '@/api'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { computed, ref, watch } from 'vue'
import MainInput from '@/components/ui/input/MainInput.vue'
import MainButton from '@/components/ui/button/MainButton.vue'
import MainSelect from '@/components/ui/select/MainSelect.vue'

interface Props {
  show: boolean
  user?: AdminUser
  type: string
}

const api = useApi()
const props = defineProps<Props>()
const processingStore = useProcessingStore()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'action'): void
}>()

const show = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

const nameValue = ref(props.user?.name ?? '')
const statusValue = ref(props.user?.status ?? '')

watch(
  () => props.user,
  (user) => {
    nameValue.value = user?.name ?? ''
    statusValue.value = user?.status ?? ''
  },
)

watch(
  () => props.show,
  (value) => {
    if (value && props.type === 'profile-edit') {
      nameValue.value = ''
    }
  },
)

const statusOptions = [
  { label: 'Активен', value: 'active' },
  { label: 'Заблокирован', value: 'blocked' },
]

async function saveUser() {
  try {
    processingStore.startLoading()
    await Promise.all([
      api.admin.users.edit(props.user.id, { name: nameValue.value }),
      api.admin.users.setStatus(props.user.id, { status: statusValue.value }),
    ])
    emit('action')
    emit('update:show', false)
    processingStore.setMessage('success', 'Редактирование пользователя', 'Данные сохранены')
  } catch {
    processingStore.setMessage('error', 'Редактирование пользователя', 'Ошибка сохранения')
  } finally {
    processingStore.stopLoading()
  }
}

async function saveProfile() {
  try {
    processingStore.startLoading()
    await api.user.updateProfile({ name: nameValue.value })
    processingStore.setMessage('success', 'Редактирование профиля', 'Профиль обновлён')
    emit('action')
    emit('update:show', false)
    nameValue.value = ''
  } catch {
    processingStore.setMessage('error', 'Редактирование профиля', 'Ошибка обновления профиля')
  } finally {
    processingStore.stopLoading()
  }
}
</script>
