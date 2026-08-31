import { beforeEach, describe, expect, it, vi } from "vitest";

import { expenseActions } from "../";

const { createExpenseMock, updateExpenseMock, deleteExpenseMock } = vi.hoisted(
  () => ({
    createExpenseMock: vi.fn(),
    updateExpenseMock: vi.fn(),
    deleteExpenseMock: vi.fn(),
  })
);

vi.mock("../../../../services", () => ({
  createExpense: createExpenseMock,
  updateExpense: updateExpenseMock,
  deleteExpense: deleteExpenseMock,
}));

describe("expenseActions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const createRequest = (fields: Record<string, string>) => {
    const formData = new FormData();

    Object.entries(fields).forEach(([key, value]) => {
      formData.set(key, value);
    });

    return new Request("http://localhost", {
      method: "POST",
      body: formData,
    });
  };

  describe("create", () => {
    it("should create an expense and return a success response", async () => {
      createExpenseMock.mockResolvedValue({
        id: "expense-123",
        userId: "user-123",
        amount: 125.5,
        description: "Lunch",
        categoryId: "food",
        categoryName: "Food",
        date: "2026-08-30",
      });

      const result = await expenseActions({
        request: createRequest({
          intent: "create",
          amount: "125.50",
          description: "Lunch",
          categoryId: "food",
          date: "2026-08-30",
        }),
      } as never);

      expect(createExpenseMock).toHaveBeenCalledTimes(1);
      expect(createExpenseMock).toHaveBeenCalledWith({
        amount: 125.5,
        description: "Lunch",
        categoryId: "food",
        date: "2026-08-30",
      });

      expect(result).toEqual({
        success: true,
        operation: "create",
        message: "Expense added successfully!",
      });
    });

    it("should convert a comma decimal separator to a dot", async () => {
      createExpenseMock.mockResolvedValue({
        id: "expense-123",
        userId: "user-123",
        amount: 125.5,
        description: "Lunch",
        categoryId: "food",
        categoryName: "Food",
        date: "2026-08-30",
      });

      await expenseActions({
        request: createRequest({
          intent: "create",
          amount: "125,50",
          description: "Lunch",
          categoryId: "food",
          date: "2026-08-30",
        }),
      } as never);

      expect(createExpenseMock).toHaveBeenCalledWith({
        amount: 125.5,
        description: "Lunch",
        categoryId: "food",
        date: "2026-08-30",
      });
    });

    it("should use an empty string when optional form values are missing", async () => {
      createExpenseMock.mockResolvedValue({
        id: "expense-123",
        userId: "user-123",
        amount: 0,
        description: "",
        categoryId: "",
        categoryName: "",
        date: "",
      });

      await expenseActions({
        request: createRequest({
          intent: "create",
        }),
      } as never);

      expect(createExpenseMock).toHaveBeenCalledWith({
        amount: 0,
        description: "",
        categoryId: "",
        date: "",
      });
    });

    it("should return the service error when creating an expense fails", async () => {
      createExpenseMock.mockRejectedValue(new Error("INVALID_AMOUNT"));

      const result = await expenseActions({
        request: createRequest({
          intent: "create",
          amount: "0",
          description: "Lunch",
          categoryId: "food",
          date: "2026-08-30",
        }),
      } as never);

      expect(result).toEqual({
        error: "INVALID_AMOUNT",
      });
    });

    it("should return a fallback error for non-Error failures", async () => {
      createExpenseMock.mockRejectedValue("unexpected failure");

      const result = await expenseActions({
        request: createRequest({
          intent: "create",
          amount: "100",
          description: "Lunch",
          categoryId: "food",
          date: "2026-08-30",
        }),
      } as never);

      expect(result).toEqual({
        error: "An unexpected error occurred.",
      });
    });
  });

  describe("update", () => {
    it("should update an expense and return a success response", async () => {
      updateExpenseMock.mockResolvedValue(undefined);

      const result = await expenseActions({
        request: createRequest({
          intent: "update",
          expenseId: "expense-123",
          amount: "75.25",
          description: "Dinner",
          categoryId: "food",
          date: "2026-08-30",
        }),
      } as never);

      expect(updateExpenseMock).toHaveBeenCalledTimes(1);
      expect(updateExpenseMock).toHaveBeenCalledWith("expense-123", {
        amount: 75.25,
        description: "Dinner",
        categoryId: "food",
        date: "2026-08-30",
      });

      expect(result).toEqual({
        success: true,
        operation: "update",
        message: "Expense updated successfully!",
      });
    });

    it("should return an error when the expense id is missing", async () => {
      const result = await expenseActions({
        request: createRequest({
          intent: "update",
          amount: "75.25",
          description: "Dinner",
          categoryId: "food",
          date: "2026-08-30",
        }),
      } as never);

      expect(result).toEqual({
        error: "Expense ID is required.",
      });

      expect(updateExpenseMock).not.toHaveBeenCalled();
    });

    it("should return an error when the expense id is empty", async () => {
      const result = await expenseActions({
        request: createRequest({
          intent: "update",
          expenseId: "",
          amount: "75.25",
          description: "Dinner",
          categoryId: "food",
          date: "2026-08-30",
        }),
      } as never);

      expect(result).toEqual({
        error: "Expense ID is required.",
      });

      expect(updateExpenseMock).not.toHaveBeenCalled();
    });

    it("should convert a comma decimal separator when updating", async () => {
      updateExpenseMock.mockResolvedValue(undefined);

      await expenseActions({
        request: createRequest({
          intent: "update",
          expenseId: "expense-123",
          amount: "75,25",
          description: "Dinner",
          categoryId: "food",
          date: "2026-08-30",
        }),
      } as never);

      expect(updateExpenseMock).toHaveBeenCalledWith("expense-123", {
        amount: 75.25,
        description: "Dinner",
        categoryId: "food",
        date: "2026-08-30",
      });
    });

    it("should return the service error when updating an expense fails", async () => {
      updateExpenseMock.mockRejectedValue(new Error("Expense not found"));

      const result = await expenseActions({
        request: createRequest({
          intent: "update",
          expenseId: "expense-123",
          amount: "75.25",
          description: "Dinner",
          categoryId: "food",
          date: "2026-08-30",
        }),
      } as never);

      expect(result).toEqual({
        error: "Expense not found",
      });
    });
  });

  describe("delete", () => {
    it("should delete an expense and return a success response", async () => {
      deleteExpenseMock.mockResolvedValue(undefined);

      const result = await expenseActions({
        request: createRequest({
          intent: "delete",
          expenseId: "expense-123",
        }),
      } as never);

      expect(deleteExpenseMock).toHaveBeenCalledTimes(1);
      expect(deleteExpenseMock).toHaveBeenCalledWith("expense-123");

      expect(result).toEqual({
        success: true,
        operation: "delete",
        message: "Expense deleted successfully!",
      });
    });

    it("should return an error when deleting without an expense id", async () => {
      const result = await expenseActions({
        request: createRequest({
          intent: "delete",
        }),
      } as never);

      expect(result).toEqual({
        error: "Expense ID is required.",
      });

      expect(deleteExpenseMock).not.toHaveBeenCalled();
    });

    it("should return an error when the expense id is empty", async () => {
      const result = await expenseActions({
        request: createRequest({
          intent: "delete",
          expenseId: "",
        }),
      } as never);

      expect(result).toEqual({
        error: "Expense ID is required.",
      });

      expect(deleteExpenseMock).not.toHaveBeenCalled();
    });

    it("should return the service error when deletion fails", async () => {
      deleteExpenseMock.mockRejectedValue(new Error("UNAUTHORIZED"));

      const result = await expenseActions({
        request: createRequest({
          intent: "delete",
          expenseId: "expense-123",
        }),
      } as never);

      expect(result).toEqual({
        error: "UNAUTHORIZED",
      });
    });
  });

  describe("invalid intent", () => {
    it("should return an error when intent is missing", async () => {
      const result = await expenseActions({
        request: createRequest({
          amount: "100",
          description: "Lunch",
          categoryId: "food",
          date: "2026-08-30",
        }),
      } as never);

      expect(result).toEqual({
        error: "Invalid action.",
      });

      expect(createExpenseMock).not.toHaveBeenCalled();
      expect(updateExpenseMock).not.toHaveBeenCalled();
      expect(deleteExpenseMock).not.toHaveBeenCalled();
    });

    it("should return an error for an unsupported intent", async () => {
      const result = await expenseActions({
        request: createRequest({
          intent: "something-else",
        }),
      } as never);

      expect(result).toEqual({
        error: "Invalid action.",
      });

      expect(createExpenseMock).not.toHaveBeenCalled();
      expect(updateExpenseMock).not.toHaveBeenCalled();
      expect(deleteExpenseMock).not.toHaveBeenCalled();
    });
  });
});
