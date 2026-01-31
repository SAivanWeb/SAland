<template>
  <ModalContainer v-model:show="show" modal-width="500px">
    <template #header>
      <h3>{{ user.name }}</h3>
    </template>
    <template #body>
      <h4>Статистика пользователя</h4>
      <div class="modal__stat">
        <div class="modal__stat-item">
          Всего игр
          <span>{{ user.stats.games_played }}</span>
        </div>
        <div class="modal__stat-item">
          Процент побед
          <span>{{ user.stats.win_rate }}</span>
        </div>
        <div class="modal__stat-item">
          Правильных ответов
          <span>{{ user.stats.total_correct_answers }}</span>
        </div>
        <div class="modal__stat-item">
          Всего ответов
          <span>{{ user.stats.total_questions_answered }}</span>
        </div>
      </div>
      <MainButton title="Удалить" color="red" @click="deleteFriend()"/>
    </template>
  </ModalContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import ModalContainer from '@/components/template/ModalContainer.vue'
import { api, type PublicUserProfile } from '@/api'
import MainButton from '@/components/ui/button/MainButton.vue'

interface Props {
  show: boolean
  user: PublicUserProfile
}

const props = defineProps<Props>()
const processingStore = useProcessingStore()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'deleted' ): void
}>()
const show = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

async function deleteFriend() {
  try {
    processingStore.startLoading()
    await api.friends.remove(props.user.id)
    emit('deleted')
    emit('update:show', false)
  } catch (e) {
    console.error(e)
  } finally {
    processingStore.stopLoading()
  }
}
</script>

<style scoped lang="scss"></style>
