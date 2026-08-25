import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Expense } from "@extropy/shared";

import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../expenses.helper";
import { mockedExpense, dates } from "./mocks";

const {
  createExpenseRecordMock,
  deleteExpenseRecordMock,
  getExpensesByUserIdMock,
  updateExpenseRecordMock,
} = vi.hoisted(() => ({
  createExpenseRecordMock: vi.fn(),
  deleteExpenseRecordMock: vi.fn(),
  getExpensesByUserIdMock: vi.fn(),
  updateExpenseRecordMock: vi.fn(),
}));

vi.mock("../expenses.repository", () => ({
  createExpenseRecord: createExpenseRecordMock,
  deleteExpenseRecord: deleteExpenseRecordMock,
  getExpensesByUserId: getExpensesByUserIdMock,
  updateExpenseRecord: updateExpenseRecordMock,
}));

describe("expenses.helper", () => {
  const { id, userId, amount, description, categoryId, date } = mockedExpense;

  beforeEach(() => {
    createExpenseRecordMock.mockReset();
    deleteExpenseRecordMock.mockReset();
    getExpensesByUserIdMock.mockReset();
    updateExpenseRecordMock.mockReset();
  });

  describe("createExpense", () => {
    it("should create an expense", async () => {
      createExpenseRecordMock.mockResolvedValueOnce(undefined);

      const result = await createExpense(userId, {
        amount: mockedExpense.amount,
        description: ` ${description} `,
        categoryId: ` ${categoryId} `,
        date,
      });

      expect(result).toMatchObject({
        id: expect.any(String),
        amount,
        description,
        categoryId,
        date,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      expect(createExpenseRecordMock).toHaveBeenCalledTimes(1);

      expect(createExpenseRecordMock).toHaveBeenCalledWith({
        ...result,
        userId,
      });
    });

    it("should reject an invalid amount", async () => {
      await expect(
        createExpense(userId, {
          amount: 0,
          description,
          categoryId,
          date,
        })
      ).rejects.toThrow("INVALID_AMOUNT");

      expect(createExpenseRecordMock).not.toHaveBeenCalled();
    });

    it("should reject an empty description", async () => {
      await expect(
        createExpense(userId, {
          amount,
          description: "   ",
          categoryId,
          date,
        })
      ).rejects.toThrow("INVALID_DESCRIPTION");

      expect(createExpenseRecordMock).not.toHaveBeenCalled();
    });

    it("should reject an empty category", async () => {
      await expect(
        createExpense(userId, {
          amount,
          description,
          categoryId: "   ",
          date,
        })
      ).rejects.toThrow("INVALID_CATEGORY");

      expect(createExpenseRecordMock).not.toHaveBeenCalled();
    });

    it("should reject an invalid date", async () => {
      await expect(
        createExpense(userId, {
          amount,
          description,
          categoryId,
          date: "2026/08/22",
        })
      ).rejects.toThrow("INVALID_DATE");

      expect(createExpenseRecordMock).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
      createExpenseRecordMock.mockRejectedValueOnce(
        new Error("DynamoDB error")
      );

      await expect(
        createExpense(userId, {
          amount,
          description,
          categoryId,
          date,
        })
      ).rejects.toThrow("DynamoDB error");
    });
  });

  describe("updateExpense", () => {
    it("should update an expense", async () => {
      updateExpenseRecordMock.mockResolvedValueOnce(undefined);

      const input = {
        userId,
        expenseId: id,
        expense: {
          amount: amount + 100,
          description: ` ${description} `,
          categoryId: ` ${categoryId} `,
          date,
        },
      };

      await updateExpense(input);

      expect(updateExpenseRecordMock).toHaveBeenCalledTimes(1);

      expect(updateExpenseRecordMock).toHaveBeenCalledWith({
        expenseId: id,
        userId,
        expense: {
          ...input.expense,
          description,
          categoryId,
        },
      });
    });

    it("should reject an invalid amount", async () => {
      await expect(
        updateExpense({
          userId,
          expenseId: id,
          expense: {
            amount: 0,
            description,
            categoryId,
            date,
          },
        })
      ).rejects.toThrow("INVALID_AMOUNT");

      expect(updateExpenseRecordMock).not.toHaveBeenCalled();
    });

    it("should reject an empty description", async () => {
      await expect(
        updateExpense({
          userId,
          expenseId: id,
          expense: {
            amount,
            description: "   ",
            categoryId,
            date,
          },
        })
      ).rejects.toThrow("INVALID_DESCRIPTION");

      expect(updateExpenseRecordMock).not.toHaveBeenCalled();
    });

    it("should reject an empty category", async () => {
      await expect(
        updateExpense({
          userId,
          expenseId: id,
          expense: {
            amount,
            description,
            categoryId: "   ",
            date,
          },
        })
      ).rejects.toThrow("INVALID_CATEGORY");

      expect(updateExpenseRecordMock).not.toHaveBeenCalled();
    });

    it("should reject an invalid date", async () => {
      await expect(
        updateExpense({
          userId,
          expenseId: id,
          expense: {
            amount,
            description,
            categoryId,
            date: "22-08-2026",
          },
        })
      ).rejects.toThrow("INVALID_DATE");

      expect(updateExpenseRecordMock).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
      updateExpenseRecordMock.mockRejectedValueOnce(
        new Error("DynamoDB error")
      );

      await expect(
        updateExpense({
          userId,
          expenseId: id,
          expense: {
            amount,
            description,
            categoryId,
            date,
          },
        })
      ).rejects.toThrow("DynamoDB error");
    });
  });

  describe("deleteExpense", () => {
    it("should delete an expense", async () => {
      deleteExpenseRecordMock.mockResolvedValueOnce(undefined);

      await deleteExpense(userId, id);

      expect(deleteExpenseRecordMock).toHaveBeenCalledTimes(1);

      expect(deleteExpenseRecordMock).toHaveBeenCalledWith({
        expenseId: id,
        userId,
      });
    });

    it("should propagate repository errors", async () => {
      deleteExpenseRecordMock.mockRejectedValueOnce(
        new Error("DynamoDB error")
      );

      await expect(deleteExpense(userId, id)).rejects.toThrow("DynamoDB error");
    });
  });

  describe("getExpenses", () => {
    it("should return all expenses for the user", async () => {
      getExpensesByUserIdMock.mockResolvedValueOnce([mockedExpense]);

      const result = await getExpenses({
        userId,
      });

      expect(result).toEqual([mockedExpense]);

      expect(getExpensesByUserIdMock).toHaveBeenCalledWith({
        userId,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it("should return expenses within a date range", async () => {
      getExpensesByUserIdMock.mockResolvedValueOnce([mockedExpense]);

      const result = await getExpenses({
        userId,
        startDate: dates.start,
        endDate: dates.end,
      });

      expect(result).toEqual([mockedExpense]);

      expect(getExpensesByUserIdMock).toHaveBeenCalledWith({
        userId,
        startDate: dates.start,
        endDate: dates.end,
      });
    });

    it("should return expenses from a start date onwards", async () => {
      getExpensesByUserIdMock.mockResolvedValueOnce([mockedExpense]);

      const result = await getExpenses({
        userId,
        startDate: dates.start,
      });

      expect(result).toEqual([mockedExpense]);

      expect(getExpensesByUserIdMock).toHaveBeenCalledWith({
        userId,
        startDate: dates.start,
        endDate: undefined,
      });
    });

    it("should return expenses up to an end date", async () => {
      getExpensesByUserIdMock.mockResolvedValueOnce([mockedExpense]);

      const result = await getExpenses({
        userId,
        endDate: dates.end,
      });

      expect(result).toEqual([mockedExpense]);

      expect(getExpensesByUserIdMock).toHaveBeenCalledWith({
        userId,
        startDate: undefined,
        endDate: dates.end,
      });
    });

    it("should filter expenses by category", async () => {
      const otherExpense: Expense = {
        ...mockedExpense,
        id: "expense-456",
        categoryId: "transport",
      };

      getExpensesByUserIdMock.mockResolvedValueOnce([
        mockedExpense,
        otherExpense,
      ]);

      const result = await getExpenses({
        userId,
        categoryId: ` ${categoryId} `,
      });

      expect(result).toEqual([mockedExpense]);

      expect(getExpensesByUserIdMock).toHaveBeenCalledWith({
        userId,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it("should combine date range and category filters", async () => {
      const matchingExpense: Expense = {
        ...mockedExpense,
        date: "2026-08-20",
        categoryId: "food",
      };

      const otherCategory: Expense = {
        ...mockedExpense,
        id: "expense-456",
        date: "2026-08-21",
        categoryId: "transport",
      };

      getExpensesByUserIdMock.mockResolvedValueOnce([
        matchingExpense,
        otherCategory,
      ]);

      const result = await getExpenses({
        userId,
        startDate: dates.start,
        endDate: dates.end,
        categoryId,
      });

      expect(result).toEqual([matchingExpense]);

      expect(getExpensesByUserIdMock).toHaveBeenCalledWith({
        userId,
        startDate: dates.start,
        endDate: dates.end,
      });
    });

    it("should reject an invalid start date", async () => {
      await expect(
        getExpenses({
          userId,
          startDate: "2026/08/01",
        })
      ).rejects.toThrow("INVALID_DATE");

      expect(getExpensesByUserIdMock).not.toHaveBeenCalled();
    });

    it("should reject an invalid end date", async () => {
      await expect(
        getExpenses({
          userId,
          endDate: "2026/08/31T00:00:00",
        })
      ).rejects.toThrow("INVALID_DATE");

      expect(getExpensesByUserIdMock).not.toHaveBeenCalled();
    });

    it("should reject an invalid date range", async () => {
      await expect(
        getExpenses({
          userId,
          startDate: dates.end,
          endDate: dates.start,
        })
      ).rejects.toThrow("INVALID_DATE_RANGE");

      expect(getExpensesByUserIdMock).not.toHaveBeenCalled();
    });

    it("should return all expenses when categoryId is whitespace", async () => {
      getExpensesByUserIdMock.mockResolvedValueOnce([mockedExpense]);

      const result = await getExpenses({
        userId,
        categoryId: "   ",
      });

      expect(result).toEqual([mockedExpense]);

      expect(getExpensesByUserIdMock).toHaveBeenCalledWith({
        userId,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it("should propagate repository errors", async () => {
      getExpensesByUserIdMock.mockRejectedValueOnce(
        new Error("DynamoDB error")
      );

      await expect(
        getExpenses({
          userId,
        })
      ).rejects.toThrow("DynamoDB error");
    });
  });
});
