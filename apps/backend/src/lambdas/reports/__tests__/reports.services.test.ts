import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getExpenses } from "../../expenses/expenses.services";
import { getSpendingReport } from "../reports.services";
import type { SpendingReport } from "../reports.types";

vi.mock("../../expenses/expenses.services", () => ({
  getExpenses: vi.fn(),
}));

const getExpensesMock = vi.mocked(getExpenses);

describe("reports.services", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-30T12:00:00.000Z"));

    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getSpendingReport", () => {
    it("should return empty report when there are no expenses", async () => {
      getExpensesMock.mockResolvedValue([]);

      const result = await getSpendingReport("user-123");

      expect(result).toEqual<SpendingReport>({
        totalThisMonth: 0,
        totalThisYear: 0,
        monthlySpending: [],
        spendingByCategory: [],
        recentExpenses: [],
      });

      expect(getExpensesMock).toHaveBeenCalledWith({
        userId: "user-123",
      });
    });

    it("should calculate total spending for the current month", async () => {
      getExpensesMock.mockResolvedValue([
        {
          id: "expense-1",
          userId: "user-123",
          amount: 100,
          description: "Food",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-08-10",
        },
        {
          id: "expense-2",
          userId: "user-123",
          amount: 50.5,
          description: "Transport",
          categoryId: "transport",
          categoryName: "Transport",
          date: "2026-08-20",
        },
        {
          id: "expense-3",
          userId: "user-123",
          amount: 200,
          description: "Bills",
          categoryId: "bills",
          categoryName: "Bills",
          date: "2026-07-15",
        },
      ]);

      const result = await getSpendingReport("user-123");

      expect(result.totalThisMonth).toBe(150.5);
    });

    it("should calculate total spending for the current year", async () => {
      getExpensesMock.mockResolvedValue([
        {
          id: "expense-1",
          userId: "user-123",
          amount: 100,
          description: "Food",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-08-10",
        },
        {
          id: "expense-2",
          userId: "user-123",
          amount: 50.5,
          description: "Transport",
          categoryId: "transport",
          categoryName: "Transport",
          date: "2026-03-20",
        },
        {
          id: "expense-3",
          userId: "user-123",
          amount: 200,
          description: "Bills",
          categoryId: "bills",
          categoryName: "Bills",
          date: "2025-12-15",
        },
      ]);

      const result = await getSpendingReport("user-123");

      expect(result.totalThisYear).toBe(150.5);
    });

    it("should group spending by month", async () => {
      getExpensesMock.mockResolvedValue([
        {
          id: "expense-1",
          userId: "user-123",
          amount: 100,
          description: "Food",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-08-10",
        },
        {
          id: "expense-2",
          userId: "user-123",
          amount: 50,
          description: "Transport",
          categoryId: "transport",
          categoryName: "Transport",
          date: "2026-08-20",
        },
        {
          id: "expense-3",
          userId: "user-123",
          amount: 200,
          description: "Bills",
          categoryId: "bills",
          categoryName: "Bills",
          date: "2026-07-15",
        },
      ]);

      const result = await getSpendingReport("user-123");

      expect(result.monthlySpending).toEqual([
        {
          month: "2026-08",
          amount: 150,
        },
        {
          month: "2026-07",
          amount: 200,
        },
      ]);
    });

    it("should sort monthly spending in descending order", async () => {
      getExpensesMock.mockResolvedValue([
        {
          id: "expense-1",
          userId: "user-123",
          amount: 100,
          description: "Food",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-06-10",
        },
        {
          id: "expense-2",
          userId: "user-123",
          amount: 50,
          description: "Transport",
          categoryId: "transport",
          categoryName: "Transport",
          date: "2026-08-20",
        },
        {
          id: "expense-3",
          userId: "user-123",
          amount: 75,
          description: "Bills",
          categoryId: "bills",
          categoryName: "Bills",
          date: "2026-07-15",
        },
      ]);

      const result = await getSpendingReport("user-123");

      expect(result.monthlySpending.map((item) => item.month)).toEqual([
        "2026-08",
        "2026-07",
        "2026-06",
      ]);
    });

    it("should group spending by category", async () => {
      getExpensesMock.mockResolvedValue([
        {
          id: "expense-1",
          userId: "user-123",
          amount: 100,
          description: "Lunch",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-08-10",
        },
        {
          id: "expense-2",
          userId: "user-123",
          amount: 50.5,
          description: "Dinner",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-08-20",
        },
        {
          id: "expense-3",
          userId: "user-123",
          amount: 200,
          description: "Electricity",
          categoryId: "bills",
          categoryName: "Bills",
          date: "2026-07-15",
        },
      ]);

      const result = await getSpendingReport("user-123");

      expect(result.spendingByCategory).toEqual([
        {
          categoryId: "food",
          categoryName: "Food",
          amount: 150.5,
        },
        {
          categoryId: "bills",
          categoryName: "Bills",
          amount: 200,
        },
      ]);
    });

    it("should preserve category names when grouping by category", async () => {
      getExpensesMock.mockResolvedValue([
        {
          id: "expense-1",
          userId: "user-123",
          amount: 100,
          description: "Subscription",
          categoryId: "entertainment",
          categoryName: "Entertainment",
          date: "2026-08-10",
        },
        {
          id: "expense-2",
          userId: "user-123",
          amount: 50,
          description: "Movie",
          categoryId: "entertainment",
          categoryName: "Entertainment",
          date: "2026-08-20",
        },
      ]);

      const result = await getSpendingReport("user-123");

      expect(result.spendingByCategory).toEqual([
        {
          categoryId: "entertainment",
          categoryName: "Entertainment",
          amount: 150,
        },
      ]);
    });

    it("should return the five most recent expenses sorted by date", async () => {
      getExpensesMock.mockResolvedValue([
        {
          id: "expense-1",
          userId: "user-123",
          amount: 10,
          description: "Expense 1",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-08-01",
        },
        {
          id: "expense-2",
          userId: "user-123",
          amount: 20,
          description: "Expense 2",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-08-10",
        },
        {
          id: "expense-3",
          userId: "user-123",
          amount: 30,
          description: "Expense 3",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-08-15",
        },
        {
          id: "expense-4",
          userId: "user-123",
          amount: 40,
          description: "Expense 4",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-08-20",
        },
        {
          id: "expense-5",
          userId: "user-123",
          amount: 50,
          description: "Expense 5",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-08-25",
        },
        {
          id: "expense-6",
          userId: "user-123",
          amount: 60,
          description: "Expense 6",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-08-28",
        },
      ]);

      const result = await getSpendingReport("user-123");

      expect(result.recentExpenses).toHaveLength(5);

      expect(result.recentExpenses.map((expense) => expense.id)).toEqual([
        "expense-6",
        "expense-5",
        "expense-4",
        "expense-3",
        "expense-2",
      ]);
    });

    it("should keep totals independent from the recent expenses limit", async () => {
      getExpensesMock.mockResolvedValue([
        {
          id: "expense-1",
          userId: "user-123",
          amount: 100,
          description: "Expense 1",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-08-01",
        },
        {
          id: "expense-2",
          userId: "user-123",
          amount: 100,
          description: "Expense 2",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-08-02",
        },
        {
          id: "expense-3",
          userId: "user-123",
          amount: 100,
          description: "Expense 3",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-08-03",
        },
        {
          id: "expense-4",
          userId: "user-123",
          amount: 100,
          description: "Expense 4",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-08-04",
        },
        {
          id: "expense-5",
          userId: "user-123",
          amount: 100,
          description: "Expense 5",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-08-05",
        },
        {
          id: "expense-6",
          userId: "user-123",
          amount: 100,
          description: "Expense 6",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-08-06",
        },
      ]);

      const result = await getSpendingReport("user-123");

      expect(result.totalThisMonth).toBe(600);
      expect(result.totalThisYear).toBe(600);
      expect(result.recentExpenses).toHaveLength(5);
    });

    it("should propagate errors from getExpenses", async () => {
      getExpensesMock.mockRejectedValue(new Error("DynamoDB error"));

      await expect(getSpendingReport("user-123")).rejects.toThrow(
        "DynamoDB error"
      );
    });
  });
});
