import type {
  Expense,
  ExpenseResponse,
  GetExpensesInput,
  UpdateExpenseInput,
} from "@extropy/shared";

import {
  createExpenseRecord,
  deleteExpenseRecord,
  getExpensesByUserId,
  updateExpenseRecord,
} from "./expenses.repository";
import {
  validateAmount,
  validateDescription,
  validateCategoryId,
  validateDate,
} from "./expenses.helpers";

export async function createExpense(
  userId: string,
  input: Expense
): Promise<ExpenseResponse> {
  const description = input.description.trim();
  const categoryId = input.categoryId.trim();

  validateAmount(input.amount);
  validateDescription(description);
  validateCategoryId(categoryId);
  validateDate(input.date);

  const now = new Date().toISOString();

  const expense: ExpenseResponse = {
    id: crypto.randomUUID(),
    amount: input.amount,
    description,
    categoryId,
    date: input.date,
    createdAt: now,
    updatedAt: now,
  };

  await createExpenseRecord({ ...expense, userId });

  return expense;
}

export async function updateExpense({
  userId,
  expenseId,
  expense,
}: UpdateExpenseInput): Promise<void> {
  const description = expense.description.trim();
  const categoryId = expense.categoryId.trim();

  validateAmount(expense.amount);
  validateDescription(description);
  validateCategoryId(categoryId);
  validateDate(expense.date);

  await updateExpenseRecord({
    expenseId,
    userId,
    expense: { ...expense, description, categoryId },
  });
}

export async function deleteExpense(
  userId: string,
  expenseId: string
): Promise<void> {
  await deleteExpenseRecord({
    expenseId,
    userId,
  });
}

export async function getExpenses({
  userId,
  startDate,
  endDate,
  categoryId,
}: GetExpensesInput): Promise<ExpenseResponse[]> {
  if (startDate) {
    validateDate(startDate);
  }

  if (endDate) {
    validateDate(endDate);
  }

  if (startDate && endDate && startDate > endDate) {
    throw new Error("INVALID_DATE_RANGE");
  }

  const normalizedCategoryId = categoryId?.trim();

  if (normalizedCategoryId) {
    validateCategoryId(normalizedCategoryId);
  }

  let expenses = await getExpensesByUserId({ userId, startDate, endDate });

  if (normalizedCategoryId) {
    expenses = expenses.filter(
      (expense) => expense.categoryId === normalizedCategoryId
    );
  }

  return expenses.map(({ userId: _userId, ...expense }) => expense);
}
