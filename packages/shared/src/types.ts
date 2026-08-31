export type User = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type Expense = {
  amount: number;
  description: string;
  categoryId: string;
  date: string;
};

export type ExpenseRecord = Expense & {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type GetExpensesInput = {
  userId: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
};

export type DeleteExpenseInput = {
  expenseId: string;
  userId: string;
};

export type UpdateExpenseInput = DeleteExpenseInput & {
  expense: Expense;
};

export type SuggestCategoryInput = {
  description: string;
  categories: {
    id: string;
    name: string;
  }[];
};

export type SuggestCategoryResponse = {
  categoryId: string | null;
  confidence: number;
};

export type Category = {
  id: string;
  name: string;
};

export type CustomCategory = Category & {
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type SpendingReportResponse = {
  totalThisMonth: number;
  totalThisYear: number;

  monthlySpending: {
    month: string;
    amount: number;
  }[];

  spendingByCategory: {
    categoryId: string;
    amount: number;
  }[];

  recentExpenses: ExpenseResponse[];
};

export type ProfileUpdateInput = {
  email?: string;
  password?: string;
};

export type ExpenseResponse = Omit<ExpenseRecord, "userId">;

export type CustomCategoryResponse = Omit<CustomCategory, "userId">;

export type GetExpensesParams = Omit<GetExpensesInput, "userId">;
export type UpdateExpenseParams = Omit<UpdateExpenseInput, "userId">;
