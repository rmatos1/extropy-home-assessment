import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  suggestExpenseCategory,
} from "../";

const { apiMock } = vi.hoisted(() => ({
  apiMock: vi.fn(),
}));

vi.mock("../../api", () => ({
  api: apiMock,
}));

describe("expenses services", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("getExpenses", () => {
    it("should get expenses without filters", async () => {
      const expenses = [
        {
          id: "expense-1",
          userId: "user-1",
          amount: 100,
          description: "Lunch",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-08-30",
        },
      ];

      apiMock.mockResolvedValue(expenses);

      const result = await getExpenses();

      expect(apiMock).toHaveBeenCalledTimes(1);
      expect(apiMock).toHaveBeenCalledWith("/expenses", {
        method: "GET",
      });

      expect(result).toBe(expenses);
    });

    it("should get expenses using the startDate filter", async () => {
      apiMock.mockResolvedValue([]);

      await getExpenses({
        startDate: "2026-08-01",
      });

      expect(apiMock).toHaveBeenCalledWith("/expenses?startDate=2026-08-01", {
        method: "GET",
      });
    });

    it("should get expenses using the endDate filter", async () => {
      apiMock.mockResolvedValue([]);

      await getExpenses({
        endDate: "2026-08-31",
      });

      expect(apiMock).toHaveBeenCalledWith("/expenses?endDate=2026-08-31", {
        method: "GET",
      });
    });

    it("should get expenses using the categoryId filter", async () => {
      apiMock.mockResolvedValue([]);

      await getExpenses({
        categoryId: "food",
      });

      expect(apiMock).toHaveBeenCalledWith("/expenses?categoryId=food", {
        method: "GET",
      });
    });

    it("should include all filters in the query string", async () => {
      apiMock.mockResolvedValue([]);

      await getExpenses({
        startDate: "2026-08-01",
        endDate: "2026-08-31",
        categoryId: "food",
      });

      expect(apiMock).toHaveBeenCalledWith(
        "/expenses?startDate=2026-08-01&endDate=2026-08-31&categoryId=food",
        {
          method: "GET",
        }
      );
    });

    it("should preserve the filter insertion order", async () => {
      apiMock.mockResolvedValue([]);

      await getExpenses({
        categoryId: "food",
        endDate: "2026-08-31",
        startDate: "2026-08-01",
      });

      expect(apiMock).toHaveBeenCalledWith(
        "/expenses?startDate=2026-08-01&endDate=2026-08-31&categoryId=food",
        {
          method: "GET",
        }
      );
    });

    it("should ignore empty filter values", async () => {
      apiMock.mockResolvedValue([]);

      await getExpenses({
        startDate: "",
        endDate: "",
        categoryId: "",
      });

      expect(apiMock).toHaveBeenCalledWith("/expenses", {
        method: "GET",
      });
    });

    it("should use the default empty filters when called with an empty object", async () => {
      apiMock.mockResolvedValue([]);

      await getExpenses({});

      expect(apiMock).toHaveBeenCalledWith("/expenses", {
        method: "GET",
      });
    });

    it("should return the API response", async () => {
      const expenses = [
        {
          id: "expense-1",
          userId: "user-1",
          amount: 125.5,
          description: "Dinner",
          categoryId: "food",
          categoryName: "Food",
          date: "2026-08-30",
        },
      ];

      apiMock.mockResolvedValue(expenses);

      const result = await getExpenses();

      expect(result).toEqual(expenses);
    });

    it("should propagate API errors", async () => {
      const error = new Error("Unable to load expenses");

      apiMock.mockRejectedValue(error);

      await expect(getExpenses()).rejects.toBe(error);
    });

    it("should encode special characters in query parameters", async () => {
      apiMock.mockResolvedValue([]);

      await getExpenses({
        categoryId: "food & drinks",
      });

      expect(apiMock).toHaveBeenCalledWith(
        "/expenses?categoryId=food+%26+drinks",
        {
          method: "GET",
        }
      );
    });
  });

  describe("createExpense", () => {
    const expense = {
      date: "2026-08-30",
      description: "Lunch",
      categoryId: "food",
      amount: 125.5,
    };

    it("should create an expense using POST", async () => {
      const response = {
        id: "expense-1",
        userId: "user-1",
        ...expense,
        categoryName: "Food",
      };

      apiMock.mockResolvedValue(response);

      const result = await createExpense(expense);

      expect(apiMock).toHaveBeenCalledTimes(1);
      expect(apiMock).toHaveBeenCalledWith("/expenses", {
        method: "POST",
        body: JSON.stringify(expense),
      });

      expect(result).toBe(response);
    });

    it("should send the complete expense unchanged", async () => {
      apiMock.mockResolvedValue({});

      await createExpense(expense);

      expect(apiMock).toHaveBeenCalledWith("/expenses", {
        method: "POST",
        body: JSON.stringify(expense),
      });
    });

    it("should propagate API errors", async () => {
      const error = new Error("INVALID_AMOUNT");

      apiMock.mockRejectedValue(error);

      await expect(createExpense(expense)).rejects.toBe(error);
    });
  });

  describe("updateExpense", () => {
    const expense = {
      date: "2026-08-30",
      description: "Dinner",
      categoryId: "food",
      amount: 75.25,
    };

    it("should update an expense using PUT", async () => {
      const response = {
        id: "expense-1",
        userId: "user-1",
        ...expense,
        categoryName: "Food",
      };

      apiMock.mockResolvedValue(response);

      const result = await updateExpense("expense-1", expense);

      expect(apiMock).toHaveBeenCalledTimes(1);
      expect(apiMock).toHaveBeenCalledWith("/expenses/expense-1", {
        method: "PUT",
        body: JSON.stringify(expense),
      });

      expect(result).toBe(response);
    });

    it("should use the provided expense id in the endpoint", async () => {
      apiMock.mockResolvedValue({});

      await updateExpense("abc-123", expense);

      expect(apiMock).toHaveBeenCalledWith("/expenses/abc-123", {
        method: "PUT",
        body: JSON.stringify(expense),
      });
    });

    it("should propagate API errors", async () => {
      const error = new Error("Expense not found");

      apiMock.mockRejectedValue(error);

      await expect(updateExpense("expense-1", expense)).rejects.toBe(error);
    });
  });

  describe("deleteExpense", () => {
    it("should delete an expense using DELETE", async () => {
      apiMock.mockResolvedValue(undefined);

      const result = await deleteExpense("expense-1");

      expect(apiMock).toHaveBeenCalledTimes(1);
      expect(apiMock).toHaveBeenCalledWith("/expenses/expense-1", {
        method: "DELETE",
      });

      expect(result).toBeUndefined();
    });

    it("should use the provided expense id in the endpoint", async () => {
      apiMock.mockResolvedValue(undefined);

      await deleteExpense("abc-123");

      expect(apiMock).toHaveBeenCalledWith("/expenses/abc-123", {
        method: "DELETE",
      });
    });

    it("should propagate API errors", async () => {
      const error = new Error("Unable to delete expense");

      apiMock.mockRejectedValue(error);

      await expect(deleteExpense("expense-1")).rejects.toBe(error);
    });
  });

  describe("suggestExpenseCategory", () => {
    it("should request a category suggestion using POST", async () => {
      const suggestion = {
        categoryId: "food",
        confidence: 0.95,
      };

      apiMock.mockResolvedValue(suggestion);

      const result = await suggestExpenseCategory("Dinner at a restaurant");

      expect(apiMock).toHaveBeenCalledTimes(1);
      expect(apiMock).toHaveBeenCalledWith("/expenses/suggest-category", {
        method: "POST",
        body: JSON.stringify({
          description: "Dinner at a restaurant",
        }),
      });

      expect(result).toBe(suggestion);
    });

    it("should send the description exactly as provided", async () => {
      apiMock.mockResolvedValue({
        categoryId: "food",
        confidence: 0.95,
      });

      await suggestExpenseCategory("  Dinner at a restaurant  ");

      expect(apiMock).toHaveBeenCalledWith("/expenses/suggest-category", {
        method: "POST",
        body: JSON.stringify({
          description: "  Dinner at a restaurant  ",
        }),
      });
    });

    it("should return the API response", async () => {
      const suggestion = {
        categoryId: "transport",
        confidence: 0.87,
      };

      apiMock.mockResolvedValue(suggestion);

      const result = await suggestExpenseCategory("Uber ride");

      expect(result).toEqual(suggestion);
    });

    it("should propagate API errors", async () => {
      const error = new Error("AI service unavailable");

      apiMock.mockRejectedValue(error);

      await expect(suggestExpenseCategory("Dinner")).rejects.toBe(error);
    });
  });
});
