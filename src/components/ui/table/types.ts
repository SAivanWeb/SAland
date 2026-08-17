import type { DataTableColumns } from 'naive-ui'

/**
 * A MainTable column adds an optional `clickable` flag on top of naive-ui's
 * column definition — cells in such a column render as a clickable link
 * that emits `click` with the row id.
 */
export type TableColumn<T = Record<string, unknown>> = DataTableColumns<T>[number] & {
  clickable?: boolean
}

export type TableColumns<T = Record<string, unknown>> = TableColumn<T>[]
