<template>
  <div class="table">
    <n-scrollbar x-scrollable class="table-scrollbar">
      <n-data-table :columns="columns" :data="items" :bordered="false" >
        <template #empty>
          <div class="table-empty">Нет данных</div>
        </template>
      </n-data-table>
    </n-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NDataTable, NScrollbar } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

interface TableHeader {
  display_name: string
  value: string
}

interface Props {
  headers: TableHeader[]
  items: any[]
  itemKey?: string
  extraActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  itemKey: 'id',
})
// const emit = defineEmits<{
//   extraAction: [row: any, action: string]
// }>()

function renderHeaderTitle(header: TableHeader) {
  return header.display_name
}

const columns = computed<DataTableColumns>(() => {
  console.log(props)
  const cols = props.headers.map((header) => ({
    title: renderHeaderTitle(header),
    key: header.value,
  }))

  // if (props.extraActions) {
  //   cols.push({
  //     title: '',
  //     key: '_extra_actions',
  //     render: (row: any) => {
  //       const rowId = row[props.itemKey]
  //       const isBlocked = row.approved === 'Заблокирован'
  //
  //       return h('div', { class: 'table-actions table-actions--row' }, [
  //         // Карандаш
  //         h(
  //           'div',
  //           {
  //             style: 'cursor: pointer',
  //             onClick: (e: Event) => {
  //               e.stopPropagation()
  //               emit('extraEdit', row)
  //             },
  //           },
  //           [h(NIcon, { size: 18 }, { default: () => h(EditIcon) })],
  //         ),
  //
  //         // Вертикальное многоточие с попоповером
  //         h(
  //           NPopover,
  //           {
  //             trigger: 'manual',
  //             show: openPopoverRowId.value === rowId,
  //             placement: 'bottom-end',
  //             showArrow: false,
  //             style: 'padding: 12px; min-width: 226px',
  //             onClickoutside: () => {
  //               openPopoverRowId.value = null
  //             },
  //           },
  //           {
  //             trigger: () =>
  //               h(
  //                 'div',
  //                 {
  //                   style: 'cursor: pointer',
  //                   onClick: (e: Event) => {
  //                     e.stopPropagation()
  //                     openPopoverRowId.value = openPopoverRowId.value === rowId ? null : rowId
  //                   },
  //                 },
  //                 [h(NIcon, { size: 18 }, { default: () => h(EllipsisVertical) })],
  //               ),
  //
  //             default: () =>
  //               h('div', { class: 'extra-actions-popover' }, [
  //                 // Сбросить пароль
  //                 h(
  //                   'div',
  //                   {
  //                     class: 'extra-actions-popover__item',
  //                     onClick: (e: Event) => {
  //                       e.stopPropagation()
  //                       openPopoverRowId.value = null
  //                       emit('extraAction', row, 'reset-password')
  //                     },
  //                   },
  //                   [h(NIcon, { size: 20 }, { default: () => h(Password) }), 'Сбросить пароль'],
  //                 ),
  //
  //                 // Заблокировать / Разблокировать
  //                 h(
  //                   'div',
  //                   {
  //                     class: 'extra-actions-popover__item',
  //                     onClick: (e: Event) => {
  //                       e.stopPropagation()
  //                       openPopoverRowId.value = null
  //                       emit('extraAction', row, isBlocked ? 'unlock' : 'lock')
  //                     },
  //                   },
  //                   [
  //                     h(NIcon, { size: 20 }, { default: () => (isBlocked ? h(Unlock) : h(Lock)) }),
  //                     isBlocked ? 'Разблокировать' : 'Заблокировать',
  //                   ],
  //                 ),
  //
  //                 // Удалить пользователя
  //                 h(
  //                   'div',
  //                   {
  //                     class: 'extra-actions-popover__item',
  //                     onClick: (e: Event) => {
  //                       e.stopPropagation()
  //                       openPopoverRowId.value = null
  //                       emit('extraAction', row, 'delete')
  //                     },
  //                   },
  //                   [h(NIcon, { size: 20 }, { default: () => h(Delete) }), 'Удалить'],
  //                 ),
  //               ]),
  //           },
  //         ),
  //       ])
  //     },
  //   } as any)
  // }

  return cols
})
</script>

<style lang="scss">
.table {
  border: 1px solid var(--border-default);
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
      background-color: var(--border-default) !important;
      border-radius: 4px;
    }
  }

  .n-scrollbar-rail--vertical {
    display: none;
  }
}

.n-data-table-th {
  @include body-2;
  color: var(--brand-secondary) !important;
  background-color: var(--brand-secondary-10) !important;
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
