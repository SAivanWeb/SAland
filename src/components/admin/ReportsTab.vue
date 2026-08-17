<template>
  <div class="reports">
    <div class="reports__header">
      <h2>Жалобы</h2>
      <div class="reports__filters">
        <MainSelect
          name="status"
          placeholder="Все статусы"
          v-model="statusFilter"
          :options="statusOptions"
        />
        <MainInput name="search" placeholder="Поиск по нарушителю" v-model="searchQuery" />
      </div>
    </div>

    <MainTable :headers="reportsHeaders" :items="reportsData" :loading="loading" />

    <div class="reports__footer" v-if="pagination">
      <n-pagination
        v-model:page="params.page"
        :page-count="pagination.total_pages"
        :page-size="params.size"
        show-size-picker
        :page-sizes="[10, 20, 50]"
        @update:page="fetchReports"
        @update:page-size="onPageSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NPagination } from 'naive-ui'
import MainInput from '@/components/ui/input/MainInput.vue'
import MainSelect from '@/components/ui/select/MainSelect.vue'
import MainTable from '@/components/ui/table/MainTable.vue'
import type { DataTableColumns } from 'naive-ui'
import {
  type AdminReport,
  type AdminReportsParams,
  type AdminReportsPagination,
  type ReportStatus,
  useApi,
} from '@/api'
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
const reportsData = ref<AdminReport[]>([])
const pagination = ref<AdminReportsPagination | null>(null)

const params = ref<AdminReportsParams>({
  q: '',
  page: 1,
  size: 10,
})

const statusFilter = ref<ReportStatus | null>(null)

const statusOptions = [
  { label: 'Все статусы', value: null },
  { label: 'Ожидает', value: 'pending' },
  { label: 'Решена', value: 'resolved' },
]

const reportsHeaders: DataTableColumns<AdminReport> = [
  { title: 'ID', key: 'id', minWidth: 280, ellipsis: { tooltip: true } },
  {
    title: 'Нарушитель',
    key: 'reported_user',
    minWidth: 180,
    render: (row: AdminReport) => `${row.reported_user.name} (${row.reported_user.email})`,
  },
  {
    title: 'Статус нарушителя',
    key: 'reported_user_status',
    minWidth: 160,
    render: (row: AdminReport) => row.reported_user.status,
  },
  {
    title: 'Жалобщик',
    key: 'reporter',
    minWidth: 180,
    render: (row: AdminReport) => `${row.reporter.name} (${row.reporter.email})`,
  },
  { title: 'Причина', key: 'reason', minWidth: 240, ellipsis: { tooltip: true } },
  { title: 'Статус', key: 'status', minWidth: 120 },
  {
    title: 'Решил',
    key: 'resolver',
    minWidth: 160,
    render: (row: AdminReport) => row.resolver?.name ?? '—',
  },
  {
    title: 'Комментарий',
    key: 'resolved_comment',
    minWidth: 220,
    ellipsis: { tooltip: true },
    render: (row: AdminReport) => row.resolved_comment ?? '—',
  },
  {
    title: 'Решена',
    key: 'resolved_at',
    minWidth: 170,
    render: (row: AdminReport) => formatDate(row.resolved_at),
  },
  {
    title: 'Создана',
    key: 'created_at',
    minWidth: 170,
    render: (row: AdminReport) => formatDate(row.created_at),
  },
]

async function fetchReports() {
  try {
    loading.value = true
    const res = await api.admin.reports.list(params.value)
    reportsData.value = res.reports
    pagination.value = res.pagination
  } catch {
    processingStore.setMessage('error', 'Жалобы', 'Ошибка получения жалоб')
  } finally {
    loading.value = false
  }
}

function onPageSizeChange(size: number) {
  params.value.size = size
  params.value.page = 1
  fetchReports()
}

function onStatusChange(val: ReportStatus | null) {
  params.value.status = val ?? undefined
  params.value.page = 1
  fetchReports()
}

watch(statusFilter, (val) => {
  onStatusChange(val)
})

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    params.value.q = val
    params.value.page = 1
    fetchReports()
  }, 400)
})

fetchReports()
</script>

<style scoped lang="scss">
.reports {
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
  }

  &__filters {
    display: flex;
    align-items: center;
    gap: 12px;

    .select {
      width: 180px;
      flex-shrink: 0;
    }

    .input {
      width: 100%;
      max-width: 280px;
    }
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
