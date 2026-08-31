import type { Expense } from "@extropy/shared";

export type ExpenseFormData = Omit<Expense, "amount"> & {
  id?: string;
  amount: string;
};
