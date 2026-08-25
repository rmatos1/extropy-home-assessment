export const mockedExpense = {
  id: "expense-123",
  userId: "user-123",
  amount: 4290,
  description: "Lunch",
  categoryId: "food",
  date: "2026-08-22",
  createdAt: "2026-08-22T12:00:00.000Z",
  updatedAt: "2026-08-22T12:00:00.000Z",
};

export const dates = {
  start: "2026-08-01",
  end: "2026-08-31",
};

export const mockedUpdateExpense = {
  ...mockedExpense,
  amount: 5000,
  description: "Updated lunch",
  categoryId: "food",
  date: "2026-08-23",
};
