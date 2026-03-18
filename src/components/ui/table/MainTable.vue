<template>
  <div class="table">
    <n-scrollbar x-scrollable class="table-scrollbar">
      <n-data-table :columns="headers" :data="items" :bordered="false" :loading="loading">
        <template #empty>
          <div class="table-empty">Нет данных</div>
        </template>
      </n-data-table>
    </n-scrollbar>
  </div>
</template>


<script setup lang="ts">
import { NDataTable, NScrollbar } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

interface Props {
  headers: DataTableColumns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[]
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
})
</script>

<style lang="scss">
.table {
  border: 2px solid $border;
  border-radius: 8px;
  overflow: hidden;
}

.table-scrollbar {
  width: 100%;
  min-width: 0;
  padding-bottom: 32px;

  .n-scrollbar-rail--horizontal {
    bottom: 12px !important;
    height: 8px !important;
    left: 20px !important;
    right: 20px !important;

    .n-scrollbar-rail__scrollbar {
      height: 8px !important;
      background-color: $border !important;
      border-radius: 4px;
    }
  }

  .n-scrollbar-rail--vertical {
    display: none;
  }
}

.n-data-table-th {
  @include body-1-bold;
  padding: 10px 20px !important;
  text-align: center !important;

  &__title {
    white-space: nowrap;
  }
}

.table-empty {
  padding: 40px 20px;
  text-align: center;
  @include body-1;
}

.n-data-table-td {
  text-align: center !important;
}
</style>
