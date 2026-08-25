export type ExpenseUserIdDatesInput = {
  userId: string;
  startDate?: string;
  endDate?: string;
};

export type ExpenseInput = {
  amount: number;
  description: string;
  categoryId: string;
  date: string;
};

export type GetExpensesInput = ExpenseUserIdDatesInput & {
  categoryId?: string;
};

export type UpdateExpenseInput = {
  expenseId: string;
  userId: string;
  expense: ExpenseInput;
};
