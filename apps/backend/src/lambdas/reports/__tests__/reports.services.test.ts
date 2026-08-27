import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSpendingReport } from "../reports.services";
import { mockedExpenses, augustReport } from "./mocks";

const { getExpensesMock } = vi.hoisted(() => ({
  getExpensesMock: vi.fn(),
}));

vi.mock("../../expenses/expenses.services", () => ({
  getExpenses: getExpensesMock,
}));

describe("reports.services", () => {
  const userId = mockedExpenses[0].userId;

  beforeEach(() => {
    getExpensesMock.mockReset();
  });

  describe("getSpendingReport", () => {
    it("should return an empty report when the user has no expenses", async () => {
      getExpensesMock.mockResolvedValueOnce([]);

      const result = await getSpendingReport(userId);

      expect(result).toEqual([]);

      expect(getExpensesMock).toHaveBeenCalledTimes(1);
      expect(getExpensesMock).toHaveBeenCalledWith({
        userId,
      });
    });

    it("should calculate total spending by month", async () => {
      getExpensesMock.mockResolvedValueOnce(mockedExpenses);

      const result = await getSpendingReport(userId);

      expect(result).toEqual([
        { ...augustReport },
        {
          month: "2026-07",
          total: 5000,
          categories: [
            {
              categoryId: "food",
              total: 3000,
            },
            {
              categoryId: "transport",
              total: 2000,
            },
          ],
        },
        {
          month: "2026-06",
          total: 5000,
          categories: [
            {
              categoryId: "entertainment",
              total: 5000,
            },
          ],
        },
      ]);

      expect(getExpensesMock).toHaveBeenCalledWith({
        userId,
      });
    });

    it("should group expenses by category within each month", async () => {
      getExpensesMock.mockResolvedValueOnce(mockedExpenses);

      const result = await getSpendingReport(userId);

      const august = result.find(({ month }) => month === "2026-08");

      expect(august).toEqual({
        ...augustReport,
      });
    });

    it("should sum multiple expenses from the same category in the same month", async () => {
      const expenses = [
        ...mockedExpenses,
        {
          ...mockedExpenses[0],
          id: "expense-007",
          amount: 1000,
          description: "Breakfast",
        },
      ];

      getExpensesMock.mockResolvedValueOnce(expenses);

      const result = await getSpendingReport(userId);

      const august = result.find(({ month }) => month === "2026-08");

      expect(august).toEqual({
        month: "2026-08",
        total: 9290,
        categories: [
          {
            categoryId: "food",
            total: 5290,
          },
          {
            categoryId: "transport",
            total: 1500,
          },
          {
            categoryId: "entertainment",
            total: 2500,
          },
        ],
      });
    });

    it("should sort months from most recent to oldest", async () => {
      getExpensesMock.mockResolvedValueOnce(mockedExpenses);

      const result = await getSpendingReport(userId);

      expect(result.map(({ month }) => month)).toEqual([
        "2026-08",
        "2026-07",
        "2026-06",
      ]);
    });

    it("should propagate errors from getExpenses", async () => {
      getExpensesMock.mockRejectedValueOnce(new Error("DynamoDB error"));

      await expect(getSpendingReport(userId)).rejects.toThrow("DynamoDB error");
    });
  });
});
