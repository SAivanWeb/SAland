<template>
  <div class="table">
    <n-scrollbar x-scrollable class="table-scrollbar">
      <n-data-table
        :columns="columns"
        :data="items as Record<string, unknown>[]"
        :bordered="false"
        :loading="loading"
      >
        <template #empty>
          <div class="table-empty">Нет данных</div>
        </template>
      </n-data-table>
    </n-scrollbar>
  </div>
</template>

<script setup lang="ts" generic="T = Record<string, unknown>">
import { computed, h, ref, type VNodeChild } from 'vue'
import { NDataTable, NScrollbar, NIcon, NPopover } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import DotsIcon from '@/assets/icons/dots.vue'
import type { TableColumn, TableColumns } from './types'

interface Props {
  headers: TableColumns<T>
  items: T[]
  loading?: boolean
  actionUsers?: boolean
  itemKey?: string
  actionGames?: boolean
  actionThemes?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  actionUsers: false,
  itemKey: 'id',
  actionGames: false,
  actionThemes: false,
})

const emit = defineEmits<{
  action: [id: string | number, action: 'edit' | 'delete']
  click: [id: string | number]
}>()

const openPopoverRowId = ref<string | number | null>(null)

function rowId(row: T): string | number {
  return (row as Record<string, unknown>)[props.itemKey] as string | number
}

function createActionsColumn(showEdit: boolean): TableColumn<T> {
  return {
    title: '',
    key: '_actions',
    width: 60,
    render: (row: T) => {
      const id = rowId(row)

      return h(
        NPopover,
        {
          trigger: 'manual',
          show: openPopoverRowId.value === id,
          placement: 'bottom-end',
          showArrow: false,
          style: 'padding: 8px; min-width: 180px',
          onClickoutside: () => {
            openPopoverRowId.value = null
          },
        },
        {
          trigger: () =>
            h(
              'div',
              {
                class: 'table-action-trigger',
                onClick: (e: Event) => {
                  e.stopPropagation()
                  openPopoverRowId.value = openPopoverRowId.value === id ? null : id
                },
              },
              [h(NIcon, { size: 18 }, { default: () => h(DotsIcon) })],
            ),

          default: () =>
            h('div', { class: 'table-popover' }, [
              showEdit &&
                h(
                  'div',
                  {
                    class: 'table-popover__item',
                    onClick: (e: Event) => {
                      e.stopPropagation()
                      openPopoverRowId.value = null
                      emit('action', id, 'edit')
                    },
                  },
                  'Редактировать',
                ),

              h(
                'div',
                {
                  class: 'table-popover__item table-popover__item--danger',
                  onClick: (e: Event) => {
                    e.stopPropagation()
                    openPopoverRowId.value = null
                    emit('action', id, 'delete')
                  },
                },
                'Удалить',
              ),
            ]),
        },
      )
    },
  }
}

const columns = computed<DataTableColumns<T>>(() => {
  const cols: TableColumns<T> = [...props.headers]

  if (props.actionUsers) cols.push(createActionsColumn(true))
  if (props.actionGames) cols.push(createActionsColumn(false))
  if (props.actionThemes) cols.push(createActionsColumn(false))

  return cols.map((col) => {
    if (!col.clickable) return col

    const originalRender = 'render' in col ? col.render : undefined
    const key = 'key' in col ? col.key : undefined

    return {
      ...col,
      render: (row: T, index: number) => {
        const content = (
          originalRender
            ? originalRender(row, index)
            : (row as Record<string, unknown>)[key as string]
        ) as VNodeChild
        return h(
          'div',
          {
            class: 'table-cell-clickable',
            onClick: () => emit('click', rowId(row)),
          },
          [content],
        )
      },
    }
  })
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

.table-cell-clickable {
  cursor: pointer;
  color: $primary-purple;
  font-weight: 600;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }
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
