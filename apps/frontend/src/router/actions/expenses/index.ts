import type { Expense } from "@extropy/shared";

import { createExpense, updateExpense } from "../../../services";

export async function createExpenseAction(expense: Expense) {
  try {
    return await createExpense(expense);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    };
  }
}

export async function updateExpenseAction(expenseId: string, expense: Expense) {
  try {
    return await updateExpense(expenseId, expense);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    };
  }
}
