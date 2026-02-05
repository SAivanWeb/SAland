<template>
  <ModalContainer v-model:show="show" modal-width="700px">
    <template #header>
      <h3>Инструкция</h3>
    </template>
    <template #body>
      <div class="modal__instruction">
        <span>
          Вы можете сами составить вопросы для игры,
          либо можете лично сгенерировать вопросы, с помощью своей ИИ модели.
          Для старта игры необходимо 80 вопросов на тему. В случае использования всех вопросов
          будет необходимо добавить новые. Во время игры будет выделена возможность для этого.
        </span>
        <div class="modal__instruction-divider"></div>
        <span>
          Для генерации вопросов через свою ИИ модель необходимо указать название для темы и скачать
          шаблон запроса, по которому ваша модель сможет сформировать вопросы. Для избежания ошибок
          при генерации придерживайтесь, указанного в инструции, порядка. На этапах генерации
          убеитесь, что генерируется 20 вопросов за 1 итерацию.
        </span>
        <span class="modal__instruction-additional">
          <i>
            Примечание: для более качественной и быстрой генерации процесс генерации происходит в несколько итераций:
            по 20 вопросов. В шаблоне запроса к ИИ модели уже указаны все параметры.
          </i>
        </span>
        <span>
          Для первой итерации введите название темы, по которому ИИ моедль сможет сформировать вопросы:
        </span>
        <div class="modal__instruction-fields">
          <MainInput name="themeName" placeholder="Название темы" v-model="themeName" size="large"/>
          <MainButton title="Шаблон" color="green"/>
        </div>
        <span>
          Скопируйте вопросы и нажмите на кнопку для получения шаблона.
          Система сама возмет сгенерированные вопросы
          и вставит их в новый шаблон для избежания повторения вопросов
        </span>
        <MainButton title="Получить следующий шаблон" color="green" size="medium"/>
        <span>
          Скопируйте вопросы и нажмите на кнопку для получения шаблона.
          Система сама возмет сгенерированные вопросы
          и вставит их в новый шаблон для избежания повторения вопросов
        </span>
        <MainButton title="Получить следующий шаблон" color="green" size="medium"/>
        <span>
          Скопируйте вопросы и нажмите на кнопку для получения шаблона.
          Система сама возмет сгенерированные вопросы
          и вставит их в новый шаблон для избежания повторения вопросов
        </span>
        <MainButton title="Получить следующий шаблон" color="green" size="medium"/>
        <span>По завершению генерации вопросов нажмите на кнопку для продолжения.</span>
        <MainButton title="Сохранить" color="green" class="modal__instruction-save"/>
        <div class="modal__instruction-divider"></div>
        <span>
          Для ручной генерации
        </span>
      </div>
    </template>
  </ModalContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ModalContainer from '@/components/template/ModalContainer.vue'
import MainInput from '@/components/ui/input/MainInput.vue'
import MainButton from '@/components/ui/button/MainButton.vue'

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()
const show = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

const themeName = ref<string>('')

</script>

<style scoped lang="scss"></style>
