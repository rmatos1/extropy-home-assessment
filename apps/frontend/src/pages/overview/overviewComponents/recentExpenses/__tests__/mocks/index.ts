import type { ExpenseData } from "@extropy/shared";

export const mockedExpenses: ExpenseData[] = [
  {
    id: "expense-1",
    amount: 125.5,
    description: "Grocery shopping",
    categoryId: "food",
    categoryName: "Food",
    date: "2026-08-30",
    createdAt: "2026-08-30T12:00:00.000Z",
    updatedAt: "2026-08-30T12:00:00.000Z",
  },
  {
    id: "expense-2",
    amount: 50,
    description: "Uber ride",
    categoryId: "transport",
    categoryName: "Transport",
    date: "2026-08-29",
    createdAt: "2026-08-29T12:00:00.000Z",
    updatedAt: "2026-08-29T12:00:00.000Z",
  },
];
