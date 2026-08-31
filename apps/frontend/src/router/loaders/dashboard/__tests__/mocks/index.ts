export const mockedCategories = [
  {
    id: "food",
    name: "Food",
  },
  {
    id: "transport",
    name: "Transport",
  },
];

export const mockedExpenses = [
  {
    id: "expense-1",
    description: "Lunch",
    amount: 100,
    categoryId: "food",
    categoryName: "Food",
    date: "2026-08-30",
    createdAt: "2026-08-30T10:00:00.000Z",
    updatedAt: "2026-08-30T10:00:00.000Z",
  },
  {
    id: "expense-2",
    description: "Uber",
    amount: 50,
    categoryId: "transport",
    categoryName: "Transport",
    date: "2026-08-29",
    createdAt: "2026-08-29T10:00:00.000Z",
    updatedAt: "2026-08-29T10:00:00.000Z",
  },
];

export const mockedReport = {
  totalThisMonth: 500,
  totalThisYear: 5000,
  monthlySpending: [
    {
      month: "2026-08",
      amount: 500,
    },
  ],
  spendingByCategory: [
    {
      categoryId: "food",
      categoryName: "Food",
      amount: 500,
    },
  ],
  recentExpenses: [],
};

export const emptySummary = {
  totalThisMonth: 0,
  totalThisYear: 0,
  monthlySpending: [],
  spendingByCategory: [],
  recentExpenses: [],
};
