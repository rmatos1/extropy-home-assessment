import type { ColumnDef } from "@tanstack/react-table";

import type { Expense } from "@extropy/shared";

import { currencyFormatter } from "../../helpers";

export const columns: Array<ColumnDef<typeof features, Expense>> = [
  {
    accessorKey: "date",
    header: "Date",
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: (info) => info.getValue<string>(),
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
