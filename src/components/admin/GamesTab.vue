<template>
  <div class="games">
    <div class="games__header">
      <h2>Пользователи</h2>
      <MainInput name="search" placeholder="Поиск игр" v-model="searchQuery" />
    </div>

    <MainTable
      :headers="gamesHeaders"
      :items="gamesData"
      :loading="loading"
      action-games
      @action="onAction"
    />

    <div class="games__footer" v-if="pagination">
      <n-pagination
        v-model:page="params.page"
        :page-count="pagination.total_pages"
        :page-size="params.size"
        show-size-picker
        :page-sizes="[10, 20, 50]"
        @update:page="fetchGames"
        @update:page-size="onPageSizeChange"
      />
    </div>
  </div>

  <AcceptModal
    v-model:show="showGameDelete"
    :game-id="selectedGameId"
    type="game-delete"
    @action="fetchGames"
  />
</template>

<script setup lang="ts">
import { type AdminGame, type AdminGamesParams, type AdminGamesPagination, useApi } from '@/api'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'
import { onMounted, ref, watch } from 'vue'
import MainInput from '@/components/ui/input/MainInput.vue'
import MainTable from '@/components/ui/table/MainTable.vue'
import { NPagination } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import AcceptModal from '@/components/modals/AcceptModal.vue'

const api = useApi()
const processingStore = useProcessingStore()

const gamesData = ref<AdminGame[]>([])
const searchQuery = ref('')
const loading = ref(false)
const params = ref<AdminGamesParams>({
  q: '',
  page: 1,
  size: 10,
})
const pagination = ref<AdminGamesPagination | null>(null)
const showGameDelete = ref<boolean>(false)
const selectedGameId = ref<string | number>()

const gamesHeaders: DataTableColumns<AdminGame> = [
  { title: 'ID', key: 'id', minWidth: 280, ellipsis: { tooltip: true } },
  { title: 'Название', key: 'theme_name', minWidth: 280 },
  { title: 'Кол-во игроков', key: 'players_count' },
]

function onAction(id: string | number) {
  if (id) {
    selectedGameId.value = id
    showGameDelete.value = true
  }
}

async function fetchGames() {
  try {
    loading.value = true
    const res = await api.admin.games.list(params.value)
    gamesData.value = res.games
    pagination.value = res.pagination
  } catch {
    processingStore.setMessage('error', 'Активные игры', 'Ошибка получения игр')
  } finally {
    loading.value = false
  }
}

function onPageSizeChange(size: number) {
  params.value.size = size
  params.value.page = 1
  fetchGames()
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    params.value.q = val
    params.value.page = 1
    fetchGames()
  }, 400)
})

onMounted(() => {
  fetchGames()
})
</script>

<style scoped lang="scss">
.games {
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
