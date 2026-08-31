import type { ColumnDef } from "@tanstack/react-table";
import type { ExpenseResponse } from "@extropy/shared";

import { currencyFormatter, formatDate } from "../../helpers";

export const getColumns = (
  categoryMap: Map<string, string>
): Array<ColumnDef<ExpenseResponse>> => [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ getValue }) => {
      const value = getValue<string>();

      return formatDate(value);
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: (info) => info.getValue<string>(),
  },
  {
    id: "category",
    header: "Category",
    accessorFn: (expense) =>
      categoryMap.get(expense.categoryId) ?? expense.categoryId,
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: (info) => {
      const amount = info.getValue<number>();

      return currencyFormatter.format(amount);
    },
  },
];

export const initialExpenseData: Expense = {
  date: new Date().toISOString().slice(0, 10),
  description: "",
  categoryId: "",
  amount: "",
};
