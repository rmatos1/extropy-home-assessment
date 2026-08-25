export type User = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type Expense = {
  id: string;
  userId: string;
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
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

export type ExpenseResponse = Omit<Expense, "userId">;

export type CustomCategoryResponse = Omit<CustomCategory, "userId">;
