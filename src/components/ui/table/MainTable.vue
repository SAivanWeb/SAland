<template>
  <div class="table">
    <n-scrollbar x-scrollable class="table-scrollbar">
      <n-data-table :columns="columns" :data="items" :bordered="false" :loading="loading">
        <template #empty>
          <div class="table-empty">Нет данных</div>
        </template>
      </n-data-table>
    </n-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { NDataTable, NScrollbar, NIcon, NPopover } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import DeleteIcon from '@/assets/icons/delete.vue'
import DotsIcon from '@/assets/icons/dots.vue'

interface Props {
  headers: DataTableColumns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[]
  loading?: boolean
  actionUsers?: boolean
  itemKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  actionUsers: false,
  itemKey: 'id',
})

const emit = defineEmits<{
  action: [id: string | number, action: 'edit' | 'delete']
}>()

const openPopoverRowId = ref<string | number | null>(null)

const columns = computed<DataTableColumns>(() => {
  const cols = [...props.headers]

  if (props.actionUsers) {
    cols.push({
      title: '',
      key: '_actions',
      width: 60,
      render: (row: any) => {
        const rowId = row[props.itemKey]

        return h(NPopover, {
          trigger: 'manual',
          show: openPopoverRowId.value === rowId,
          placement: 'bottom-end',
          showArrow: false,
          style: 'padding: 8px; min-width: 180px',
          onClickoutside: () => { openPopoverRowId.value = null },
        }, {
          trigger: () => h('div', {
            class: 'table-action-trigger',
            onClick: (e: Event) => {
              e.stopPropagation()
              openPopoverRowId.value = openPopoverRowId.value === rowId ? null : rowId
            },
          }, [h(NIcon, { size: 18 }, { default: () => h(DotsIcon) })]),

          default: () => h('div', { class: 'table-popover' }, [
            h('div', {
              class: 'table-popover__item',
              onClick: (e: Event) => {
                e.stopPropagation()
                openPopoverRowId.value = null
                emit('action', rowId, 'edit')
              },
            }, 'Редактировать'),

            h('div', {
              class: 'table-popover__item table-popover__item--danger',
              onClick: (e: Event) => {
                e.stopPropagation()
                openPopoverRowId.value = null
                emit('action', rowId, 'delete')
              },
            }, [
              'Удалить',
            ]),
          ]),
        })
      },
    } as any)
  }

  return cols
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

.n-data-table-td {
  padding: 10px 20px !important;
  text-align: center !important;

  &:has(.table-action-trigger) {
    padding: 0 !important;
    width: 60px !important;
  }
}

.table-empty {
  padding: 40px 20px;
  text-align: center;
  @include body-1;
}

.table-action-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 100%;
  min-height: 40px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

.table-popover {
  display: flex;
  flex-direction: column;
  gap: 2px;

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s;
    white-space: nowrap;
    @include body-1;

    &:hover {
      background-color: $primary-blue;
    }

    &--danger {

      &:hover {
        background-color: $primary-red;
      }
    }
  }
}
</style>
