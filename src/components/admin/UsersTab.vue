<template>
  <div class="users">
    <div class="users__header">
      <h2>Пользователи</h2>
      <MainInput name="search" placeholder="Поиск пользователя" v-model="searchQuery" />
    </div>

    <MainTable
      :headers="usersHeaders"
      :items="usersData"
      :loading="loading"
      action-users
      @action="onAction"
    />

    <div class="users__footer" v-if="pagination">
      <n-pagination
        v-model:page="params.page"
        :page-count="pagination.total_pages"
        :page-size="params.size"
        show-size-picker
        :page-sizes="[10, 20, 50]"
        @update:page="fetchUsers"
        @update:page-size="onPageSizeChange"
      />
    </div>
  </div>

  <AcceptModal
    v-model:show="showUserDelete"
    :user="selectedUser"
    type="admin-delete"
    @action="fetchUsers"
  />
  <EditRowModal
    v-if="selectedUserFull"
    v-model:show="showUserEdit"
    :user="selectedUserFull"
    type="user-edit"
    @action="fetchUsers"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NPagination } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import MainInput from '@/components/ui/input/MainInput.vue'
import MainTable from '@/components/ui/table/MainTable.vue'
import { type AdminUser, type AdminUsersParams, type AdminUsersPagination, useApi } from '@/api'
import AcceptModal from '@/components/modals/AcceptModal.vue'
import EditRowModal from '@/components/modals/EditRowModal.vue'
import { useProcessingStore } from '@/stores/useProcessingStore.ts'

function formatDate(timestamp: number | null): string {
  if (!timestamp) return '—'

  const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ms))
}

const api = useApi()
const processingStore = useProcessingStore()

const searchQuery = ref('')
const loading = ref(false)
const usersData = ref<AdminUser[]>([])
const pagination = ref<AdminUsersPagination | null>(null)
const showUserDelete = ref(false)
const showUserEdit = ref(false)
const selectedUser = ref({
  userId: '',
  name: '',
})
const selectedUserFull = ref<AdminUser | null>(null)

const params = ref<AdminUsersParams>({
  q: '',
  page: 1,
  size: 10,
})

const usersHeaders: DataTableColumns<AdminUser> = [
  { title: 'ID', key: 'id', minWidth: 280, ellipsis: { tooltip: true } },
  { title: 'Email', key: 'email', minWidth: 200, ellipsis: { tooltip: true } },
  { title: 'Имя', key: 'name', minWidth: 140 },
  { title: 'Роль', key: 'role', minWidth: 100 },
  { title: 'Статус', key: 'status', minWidth: 110 },
  { title: 'Жалобы', key: 'reports_count', minWidth: 100 },
  {
    title: 'Заблокирован',
    key: 'blocked_at',
    minWidth: 170,
    render: (row: AdminUser) => formatDate(row.blocked_at),
  },
  { title: 'Причина блока', key: 'block_reason', minWidth: 200, ellipsis: { tooltip: true } },
  {
    title: 'Создан',
    key: 'created_at',
    minWidth: 170,
    render: (row: AdminUser) => formatDate(row.created_at),
  },
]

async function fetchUsers() {
  try {
    loading.value = true
    const res = await api.admin.users.list(params.value)
    usersData.value = res.users
    pagination.value = res.pagination
  } catch {
    processingStore.setMessage('error', 'Пользователи', 'Ошибка получения пользователей')
  } finally {
    loading.value = false
  }
}

function onPageSizeChange(size: number) {
  params.value.size = size
  params.value.page = 1
  fetchUsers()
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    params.value.q = val
    params.value.page = 1
    fetchUsers()
  }, 400)
})

function onAction(id: string | number, action: 'edit' | 'delete') {
  if (action === 'edit') {
    const userToEdit = usersData.value.find((user) => user.id === id)
    if (userToEdit) {
      selectedUserFull.value = userToEdit
      showUserEdit.value = true
    }
  } else if (action === 'delete') {
    const selectedUserData = usersData.value.filter((user) => user.id === id)[0]
    if (selectedUserData) {
      selectedUser.value = {
        userId: selectedUserData.id,
        name: selectedUserData.name,
      }
      showUserDelete.value = true
    }
  }
}

fetchUsers()
</script>

<style scoped lang="scss">
.users {
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
