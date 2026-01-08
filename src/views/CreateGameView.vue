<template>
  <div class="create">
    <div class="create__container">
      <h1>Создание игры</h1>
      <GameWaiting v-if="0" role="admin"/>
      <div class="create__card">
        <h3 class="create__card-title">Параметры</h3>
        <div class="create__card-content">
          <div class="create__card-param">
            <n-select
              :options="playersOption"
              v-model:value="gamePlayers"
              placeholder="Количество игроков"
            />
            <n-select
              :options="timeOption"
              v-model:value="answerTime"
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
            <MainButton title="Сформировать" size="medium" />
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
import { ref } from 'vue'
import { NSelect } from 'naive-ui'
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

  &__card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
    background-color: #fff;
    border-radius: 4px;
    border: 1px solid $border;

    &-param {
      display: flex;
      gap: 12px;
    }
  }
}
</style>
