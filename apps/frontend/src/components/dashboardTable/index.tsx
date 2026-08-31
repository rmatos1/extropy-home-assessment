import { Fragment, type ReactNode, type ChangeEvent } from "react";
import {
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";

import { PaginationButton } from "../paginationButton";

const features = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
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
  initialSorting?: {
    id: string;
    desc?: boolean;
  }[];
  pageSize?: number;
  isLoading?: boolean;
  customClasses?: {
    table?: string;
    th?: string;
    tbody?: string;
    td?: string;
  };
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
  initialSorting,
  pageSize = 10,
  isLoading,
  customClasses,
}: TableProps<TData>) {
  const table = useTable({
    key: tableKey,
    features,
    columns,
    data,
    initialState: {
      sorting: initialSorting,
      pagination: {
        pageSize,
        pageIndex: 0,
      },
    },
  });

  return (
    <table
      className={`w-full border-collapse ${customClasses?.table ?? ""}`}
      data-testid="dashboard-table"
    >
      <thead className={`bg-gray-100 ${customClasses?.th ?? ""}`}>
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

      <tbody className={`${customClasses?.tbody ?? ""}`}>
        {isLoading ? (
          <tr>
            <td
              colSpan={columns.length + (renderActions ? 1 : 0)}
              className="px-4 py-3"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                <span className="text-sm text-gray-600">Loading data...</span>
              </div>
            </td>
          </tr>
        ) : (
          <>
            {isAdding && (
              <Fragment key="new-expense">{renderFormRow()}</Fragment>
            )}

            {table.getRowModel().rows.length > 0
              ? table.getRowModel().rows.map((row) => {
                  if (isEditing && editingRowId === row.original.id) {
                    return (
                      <Fragment key={row.original.id}>
                        {renderFormRow()}
                      </Fragment>
                    );
                  }

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      {row.getAllCells().map((cell) => {
                        const header =
                          typeof cell.column.columnDef.header === "string"
                            ? cell.column.columnDef.header
                            : "";

                        return (
                          <td
                            key={cell.id}
                            data-label={header}
                            className={`px-4 py-3 text-sm text-gray-700 ${
                              customClasses?.td ?? ""
                            }`}
                          >
                            <table.FlexRender cell={cell} />
                          </td>
                        );
                      })}

                      {renderActions && (
                        <td
                          data-label="Actions"
                          className={`px-4 py-3 ${customClasses?.td ?? ""}`}
                        >
                          {renderActions(row.original)}
                        </td>
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
          </>
        )}
      </tbody>
      <tfoot>
        <tr>
          <td
            colSpan={columns.length + (renderActions ? 1 : 0)}
            className="border-t border-gray-200 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-4 max-sm:flex-col">
              <div className="flex items-center gap-2 text-sm text-gray-600 max-sm:self-start">
                <span>Rows per page:</span>

                <select
                  value={table.state.pagination.pageSize}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    table.setPageSize(Number(event.target.value))
                  }
                  className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-3 max-sm:self-end">
                <span className="text-sm text-gray-600">
                  Page {table.state.pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </span>

                <div className="flex gap-1">
                  <PaginationButton
                    onClick={() => table.previousPage()}
                    isDisabled={!table.getCanPreviousPage()}
                    text="Previous"
                  />

                  <PaginationButton
                    onClick={() => table.nextPage()}
                    isDisabled={!table.getCanNextPage()}
                    text="Next"
                  />
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
