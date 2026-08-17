<template>
  <div class="themes">
    <div class="themes__header">
      <h2>Темы</h2>
      <MainInput name="search" placeholder="Поиск тем" v-model="searchQuery" />
    </div>

    <MainTable
      :headers="themesHeaders"
      :items="themesData"
      :loading="loading"
      action-themes
      @action="onAction"
      @click="onRowClick"
    />

    <div class="themes__footer" v-if="pagination">
      <n-pagination
        v-model:page="params.page"
        :page-count="pagination.total_pages"
        :page-size="params.size"
        show-size-picker
        :page-sizes="[10, 20, 50]"
        @update:page="fetchThemes"
        @update:page-size="onPageSizeChange"
      />
    </div>
  </div>

  <AcceptModal
    v-model:show="showThemeDelete"
    :theme-id="selectedThemeId"
    type="theme-delete"
    @action="fetchThemes"
  />
  <ThemeViewModal
    v-model:show="showThemeView"
    :theme-id="selectedThemeId?.toString() ?? null"
    :checked="selectedThemeChecked"
    @check-updated="fetchThemes"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NPagination } from 'naive-ui'
import MainInput from '@/components/ui/input/MainInput.vue'
import MainTable from '@/components/ui/table/MainTable.vue'
import type { TableColumns } from '@/components/ui/table/types'
import { type AdminThemesPagination, useApi, type AdminThemesParams, type AdminTheme } from '@/api'
import AcceptModal from '@/components/modals/AcceptModal.vue'
import ThemeViewModal from '@/components/modals/ThemeViewModal.vue'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'

const api = useApi()
const processingStore = useProcessingStore()

const searchQuery = ref('')
const loading = ref(false)
const themesData = ref<AdminTheme[]>([])
const pagination = ref<AdminThemesPagination | null>(null)
const showThemeDelete = ref(false)
const showThemeView = ref(false)
const selectedThemeId = ref<string | number>()
const selectedThemeChecked = ref(false)

const params = ref<AdminThemesParams>({
  q: '',
  page: 1,
  size: 10,
})

const themesHeaders: TableColumns<AdminTheme> = [
  { title: 'ID', key: 'id', minWidth: 280, ellipsis: { tooltip: true } },
  { title: 'Название', key: 'name', minWidth: 280, ellipsis: { tooltip: true }, clickable: true },
  { title: 'Кол-во вопросов', key: 'questions_count' },
  { title: 'Проверена', key: 'check', render: (row: AdminTheme) => (row.check ? 'Да' : 'Нет') },
]

async function fetchThemes() {
  try {
    loading.value = true
    const res = await api.admin.themes.list(params.value)
    themesData.value = res.themes
    pagination.value = res.pagination
  } catch {
    processingStore.setMessage('error', 'Темы', 'Ошибка получения тем')
  } finally {
    loading.value = false
  }
}

function onPageSizeChange(size: number) {
  params.value.size = size
  params.value.page = 1
  fetchThemes()
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    params.value.q = val
    params.value.page = 1
    fetchThemes()
  }, 400)
})

function onAction(id: string | number) {
  if (id) {
    selectedThemeId.value = id
    showThemeDelete.value = true
  }
}

function onRowClick(id: string | number) {
  const theme = themesData.value.find((t) => t.id === id)
  if (theme) {
    selectedThemeId.value = id
    selectedThemeChecked.value = theme.check
    showThemeView.value = true
  }
}

fetchThemes()
</script>

<style scoped lang="scss">
.themes {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background-color: #fff;
  border: 2px solid $border;
  border-radius: $border-radius;
  box-shadow: $box-shadow;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .input {
      width: 100%;
      max-width: 320px;
      margin-left: auto;
    }
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
