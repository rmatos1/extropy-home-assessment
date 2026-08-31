import type { Category, ExpenseData } from "@extropy/shared";

export const mockedCategories: Category[] = [
  {
    id: "food",
    name: "Food",
  },
  {
    id: "transport",
    name: "Transport",
  },
  {
    id: "bills",
    name: "Bills",
  },
];

export const mockedExpenses: ExpenseData[] = [
  {
    id: "expense-1",
    amount: 100,
    description: "Lunch",
    categoryId: "food",
    categoryName: "Food",
    date: "2026-08-20",
    createdAt: "2026-08-20T10:00:00.000Z",
    updatedAt: "2026-08-20T10:00:00.000Z",
  },
  {
    id: "expense-2",
    amount: 50.5,
    description: "Uber",
    categoryId: "transport",
    categoryName: "Transport",
    date: "2026-08-25",
    createdAt: "2026-08-25T10:00:00.000Z",
    updatedAt: "2026-08-25T10:00:00.000Z",
  },
];

export const expenseFormData = {
  date: "2026-08-30",
  description: "",
  categoryId: "",
  amount: "",
};

export const columns = [
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
];
