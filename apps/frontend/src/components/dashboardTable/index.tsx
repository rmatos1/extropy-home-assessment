import { Fragment, type ReactNode } from "react";
import {
  createSortedRowModel,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
});

type TableProps<TData> = {
  tableKey: string;
  columns: ColumnDef<typeof features, TData>[];
  data: TData[];
  isAdding: boolean;
  isEditing?: boolen;
  editingRowId?: string | null;
  renderFormRow: (row?: TData) => ReactNode;
  renderActions?: (row: TData) => ReactNode;
  emptyMsg?: string;
};

export function DashboardTable<TData>({
  tableKey,
  columns,
  data,
  isAdding,
  isEditing,
  editingRowId,
  renderFormRow,
  renderActions,
  emptyMsg,
}: TableProps<TData>) {
  const table = useTable({
    key: tableKey,
    features,
    columns,
    data,
  });

  return (
    <table className="w-full border-collapse">
      <thead className="bg-gray-100">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-600"
              >
                {header.isPlaceholder ? null : (
                  <button
                    type="button"
                    className="flex items-center gap-1"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <table.FlexRender header={header} />

                    {header.column.getIsSorted() === "asc" && " ↑"}
                    {header.column.getIsSorted() === "desc" && " ↓"}
                  </button>
                )}
              </th>
            ))}

            {renderActions && (
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Actions
              </th>
            )}
          </tr>
        ))}
      </thead>

      <tbody>
        {isAdding && <Fragment key="new-expense">{renderFormRow()}</Fragment>}

        {table.getRowModel().rows.length > 0
          ? table.getRowModel().rows.map((row) => {
              if (isEditing && editingRowId === row.id) {
                return <Fragment key={row.id}>{renderFormRow()}</Fragment>;
              }

              return (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  {row.getAllCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-gray-700"
                    >
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}

                  {renderActions && (
                    <td className="px-4 py-3">{renderActions(row.original)}</td>
                  )}
                </tr>
              );
            })
          : !isAdding && (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  className="px-4 py-3 text-center text-sm text-gray-500"
                >
                  {emptyMsg ?? "No data available."}
                </td>
              </tr>
            )}
      </tbody>
    </table>
  );
}
