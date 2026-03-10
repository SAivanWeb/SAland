<template>
  <ModalContainer v-model:show="show" modal-width="500px">
    <template #header>
      <h3>Жалоба на игрока {{ user.name }}</h3>
    </template>
    <template #body>
      <MainInput
        name="report"
        placeholder="Укажите причину жалобы"
        v-model="report"
        fieldType="textarea"
        :height="150"
      />
      <MainButton title="Отправить" :disabled="!report" @click="reportUser"/>
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
  user: {
    id: string
    name: string
  }
}

const api = useApi()
const props = defineProps<Props>()
const processingStore = useProcessingStore()
const report = ref<string>('')

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'deleted'): void
}>()
const show = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

async function reportUser() {
  try {
    processingStore.startLoading()
    await api.user.report({
      reported_user_id: props.user.id,
      reason: props.user.name
    })

    processingStore.setMessage('success', 'Жалоба на пользователя', 'Жалоба отправлена')
    processingStore.clearReport()
    emit('update:show', false)
  } catch {
    processingStore.setMessage('error', 'Жалоба на пользователя', 'Ошибка создания жалобы')
  } finally {
    processingStore.stopLoading()
  }
}
</script>

<style scoped lang="scss"></style>
