<template>
  <div class="create">
    <div class="create__container">
      <h1>Создание игры</h1>
      <GameWaiting v-if="0" role="admin"/>
      <div class="create__card">
        <h3 class="create__card-title">Параметры</h3>
        <div class="create__card-content">
          <div class="create__card-param">
            <MainSelect
              name="players"
              :options="playersOption"
              v-model="gamePlayers"
              placeholder="Количество игроков"
            />
            <MainSelect
              name="time"
              :options="timeOption"
              v-model="answerTime"
              placeholder="Время для ответа"
            />
          </div>
        </div>
      </div>
      <div class="create__card">
        <h3 class="create__card-title">Вопросы</h3>
        <div class="create__card-content">
          <div class="create__card-param">
            <MainInput name="theme" placeholder="Укажите тему" v-model="gameTheme" size="medium" />
            <MainButton title="Сформировать" size="large" />
          </div>
          <div class="create__list">
            <div class="create__answer">

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MainInput from '@/components/ui/input/MainInput.vue'
import MainSelect from '@/components/ui/select/MainSelect.vue'
import { ref } from 'vue'
import MainButton from '@/components/ui/button/MainButton.vue'
import GameWaiting from '@/components/games/GameWaiting.vue'

const gameTheme = ref<string>('')
const answerTime = ref<number>()
const gamePlayers = ref<number>()
const playersOption = [
  {
    label: '2 игрока',
    value: 2,
  },
  {
    label: '3 игрока',
    value: 3,
  },
  {
    label: '4 игрока',
    value: 4,
  },
]
const timeOption = [
  {
    label: '10 секунд',
    value: 10,
  },
  {
    label: '20 секунд',
    value: 20,
  },
  {
    label: '30 секунд',
    value: 30,
  },
]
</script>

<style scoped lang="scss">
.create {
  padding: 24px $side-padding 64px $side-padding;

  &__container {
    max-width: 1080px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  h1 {
    color: $text-dark;
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px 24px;
    background: #fff;
    border-radius: $border-radius;
    border: 2px solid $border;
    transition: all 0.2s ease;

    &-title {
      color: $text-dark;
    }

    &-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    &-param {
      display: flex;
      gap: 12px;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

}
</style>
