import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

import type { ExpenseResponse } from "@extropy/shared";

import { currencyFormatter, formatDate } from "../../helpers";
import type { ExpenseFormData } from "./expenses.types";
import { dashboardTableFeatures } from "../../components";

const columnHelper = createColumnHelper<
  typeof dashboardTableFeatures,
  ExpenseResponse
>();

export const getColumns = (
  categoryMap: Map<string, string>
): Array<ColumnDef<typeof dashboardTableFeatures, ExpenseResponse>> =>
  columnHelper.columns([
    columnHelper.accessor("date", {
      header: "Date",
      cell: (info) => formatDate(info.getValue()),
    }),

    columnHelper.accessor("description", {
      header: "Description",
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor(
      (expense) => categoryMap.get(expense.categoryId) ?? expense.categoryId,
      {
        id: "category",
        header: "Category",
      }
    ),

    columnHelper.accessor("amount", {
      header: "Amount",
      cell: (info) => currencyFormatter.format(info.getValue()),
    }),
  ]);

export const initialExpenseData: ExpenseFormData = {
  date: new Date().toISOString().slice(0, 10),
  description: "",
  categoryId: "",
  amount: "",
};
