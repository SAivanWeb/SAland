<template>
  <ModalContainer v-model:show="show" modalWidth="500px">
    <template #header>
      <h3>Подтвердите удаление</h3>
    </template>
    <template #body>
      <p>При подтверждении удаления аккаунта доступ к нему станет невозможным, а так же удалится вся статистика. Вы уверены что хотите удалить свой аккаунт? </p>
      <MainButton title="Подтвердить" color="red" @click="deleteAccount"/>
    </template>
  </ModalContainer>
</template>

<script setup lang="ts">
import ModalContainer from '@/components/template/ModalContainer.vue'
import { useApi } from '@/api'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { computed } from 'vue'
import MainButton from '@/components/ui/button/MainButton.vue'
import { useUserStore } from '@/stores/useUserStore.ts'

interface Props {
  show: boolean
  userId: string
}

const api = useApi()
const props = defineProps<Props>()
const processingStore = useProcessingStore()
const userStore = useUserStore()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'deleted'): void
}>()
const show = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

async function deleteAccount() {
  try {
    processingStore.startLoading()
    await api.user.deleteAccount()
    await userStore.logout()
  } catch {
    processingStore.setMessage('error', 'Удаление аккаунта', 'Ошибка удаления аккаунта')
  } finally {
    processingStore.stopLoading()
  }
}
</script>

<style scoped lang="scss"></style>
