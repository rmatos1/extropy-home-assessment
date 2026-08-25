import type { Expense, ExpenseResponse } from "@extropy/shared";

import {
  createExpenseRecord,
  deleteExpenseRecord,
  getExpensesByUserId,
  updateExpenseRecord,
} from "./expenses.repository";

import type {
  ExpenseInput,
  GetExpensesInput,
  UpdateExpenseInput,
} from "./expenses.types";

function validateAmount(amount: number): void {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("INVALID_AMOUNT");
  }
}

function validateDate(date: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("INVALID_DATE");
  }
}

function validateDescription(description: string): void {
  if (!description) {
    throw new Error("INVALID_DESCRIPTION");
  }
}

function validateCategoryId(categoryId: string): void {
  if (!categoryId) {
    throw new Error("INVALID_CATEGORY");
  }
}

export async function createExpense(
  userId: string,
  input: ExpenseInput
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
}: GetExpensesInput): Promise<Expense[]> {
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

  return expenses;
}
