import type {
  Expense,
  ExpenseResponse,
  GetExpensesParams,
} from "@extropy/shared";

import { api } from "../api";

export function getExpenses({
  startDate,
  endDate,
  categoryId,
}: GetExpensesParams = {}): Promise<ExpenseResponse[]> {
  const params = new URLSearchParams();

  if (startDate) {
    params.set("startDate", startDate);
  }

  if (endDate) {
    params.set("endDate", endDate);
  }

  if (categoryId) {
    params.set("categoryId", categoryId);
  }

  const queryString = params.toString();
  const endpoint = queryString ? `/expenses?${queryString}` : "/expenses";

  return api<ExpenseResponse[]>(endpoint, {
    method: "GET",
  });
}

export function createExpense(data: Expense): Promise<ExpenseResponse> {
  return api<ExpenseResponse>("/expenses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateExpense(
  expenseId: string,
  expense: Expense
): Promise<ExpenseResponse> {
  return api<ExpenseResponse>(`/expenses/${expenseId}`, {
    method: "PUT",
    body: JSON.stringify(expense),
  });
}

export function deleteExpense(expenseId: string): Promise<void> {
  return api<void>(`/expenses/${expenseId}`, {
    method: "DELETE",
  });
}
