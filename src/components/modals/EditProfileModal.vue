<template>
  <ModalContainer v-model:show="show" modal-width="500px">
    <template #header>
      <h3>Редактировать профиль</h3>
    </template>
    <template #body>
      <MainInput
        name="name"
        placeholder="Введите новое имя"
        v-model="name"
      />
      <MainButton title="Сохранить" :disabled="!name" @click="saveProfile" />
    </template>
  </ModalContainer>
</template>

<script setup lang="ts">
import ModalContainer from '@/components/template/ModalContainer.vue'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { computed, ref } from 'vue'
import MainInput from '@/components/ui/input/MainInput.vue'
import { useApi } from '@/api'
import MainButton from '@/components/ui/button/MainButton.vue'

interface Props {
  show: boolean
}

const api = useApi()
const props = defineProps<Props>()
const processingStore = useProcessingStore()
const name = ref<string>('')

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'updated'): void
}>()

const show = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

async function saveProfile() {
  try {
    processingStore.startLoading()
    await api.user.updateProfile({ name: name.value })
    processingStore.setMessage('success', 'Редактирование профиля', 'Профиль обновлён')
    emit('updated')
    emit('update:show', false)
    name.value = ''
  } catch {
    processingStore.setMessage('error', 'Редактирование профиля', 'Ошибка обновления профиля')
  } finally {
    processingStore.stopLoading()
  }
}
</script>

<style scoped lang="scss"></style>
