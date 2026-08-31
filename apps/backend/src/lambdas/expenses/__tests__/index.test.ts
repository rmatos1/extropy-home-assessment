import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAuthenticatedUserId } from "../../auth/auth.helpers";
import { getCategories } from "../../categories/categories.services";
import { ERROR_MESSAGES } from "../expenses.constants";
import { suggestExpenseCategory } from "../expenses.ai";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../expenses.services";
import { handler } from "../index";

vi.mock("../../auth/auth.helpers", () => ({
  getAuthenticatedUserId: vi.fn(),
}));

vi.mock("../../categories/categories.services", () => ({
  getCategories: vi.fn(),
}));

vi.mock("../expenses.ai", () => ({
  suggestExpenseCategory: vi.fn(),
}));

vi.mock("../expenses.services", () => ({
  createExpense: vi.fn(),
  deleteExpense: vi.fn(),
  getExpenses: vi.fn(),
  updateExpense: vi.fn(),
}));

const getAuthenticatedUserIdMock = vi.mocked(getAuthenticatedUserId);
const getCategoriesMock = vi.mocked(getCategories);
const suggestExpenseCategoryMock = vi.mocked(suggestExpenseCategory);

const createExpenseMock = vi.mocked(createExpense);
const deleteExpenseMock = vi.mocked(deleteExpense);
const getExpensesMock = vi.mocked(getExpenses);
const updateExpenseMock = vi.mocked(updateExpense);

const createEvent = (
  overrides: Partial<APIGatewayProxyEventV2> = {}
): APIGatewayProxyEventV2 =>
  ({
    version: "2.0",
    routeKey: "$default",
    rawPath: "/",
    rawQueryString: "",
    headers: {},
    requestContext: {} as APIGatewayProxyEventV2["requestContext"],
    isBase64Encoded: false,
    ...overrides,
  } as APIGatewayProxyEventV2);

describe("expenses handler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("authentication", () => {
    it("should return 401 when the user is not authenticated", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue("");

      const event = createEvent({
        routeKey: "GET /expenses",
        cookies: ["session=token"],
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 401,
        body: JSON.stringify({
          message: "Unauthorized",
        }),
      });

      expect(getExpensesMock).not.toHaveBeenCalled();
    });

    it("should return 401 when authentication fails", async () => {
      getAuthenticatedUserIdMock.mockRejectedValue(new Error("UNAUTHORIZED"));

      const event = createEvent({
        routeKey: "GET /expenses",
        cookies: ["session=invalid"],
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 401,
        body: JSON.stringify({
          message: "Unauthorized",
        }),
      });
    });
  });

  describe("GET /expenses", () => {
    it("should return the user's expenses", async () => {
      const userId = "user-123";

      const expenses = [
        {
          id: "expense-1",
          userId,
          amount: 100,
          description: "Food",
          categoryId: "food",
          date: "2026-08-30",
        },
      ];

      getAuthenticatedUserIdMock.mockResolvedValue(userId);
      getExpensesMock.mockResolvedValue(expenses);

      const event = createEvent({
        routeKey: "GET /expenses",
        cookies: ["session=token"],
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 200,
        body: JSON.stringify(expenses),
      });

      expect(getExpensesMock).toHaveBeenCalledWith({
        userId,
        startDate: undefined,
        endDate: undefined,
        categoryId: undefined,
      });
    });

    it("should pass date and category filters to the service", async () => {
      const userId = "user-123";

      getAuthenticatedUserIdMock.mockResolvedValue(userId);
      getExpensesMock.mockResolvedValue([]);

      const event = createEvent({
        routeKey: "GET /expenses",
        cookies: ["session=token"],
        queryStringParameters: {
          startDate: "2026-08-01",
          endDate: "2026-08-31",
          categoryId: "bills",
        },
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 200,
        body: JSON.stringify([]),
      });

      expect(getExpensesMock).toHaveBeenCalledWith({
        userId,
        startDate: "2026-08-01",
        endDate: "2026-08-31",
        categoryId: "bills",
      });
    });

    it("should support missing query parameters", async () => {
      const userId = "user-123";

      getAuthenticatedUserIdMock.mockResolvedValue(userId);
      getExpensesMock.mockResolvedValue([]);

      const event = createEvent({
        routeKey: "GET /expenses",
        cookies: ["session=token"],
        queryStringParameters: undefined,
      });

      await handler(event);

      expect(getExpensesMock).toHaveBeenCalledWith({
        userId,
        startDate: undefined,
        endDate: undefined,
        categoryId: undefined,
      });
    });

    it("should return 500 when getting expenses fails unexpectedly", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue("user-123");
      getExpensesMock.mockRejectedValue(new Error("DynamoDB error"));

      const event = createEvent({
        routeKey: "GET /expenses",
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 500,
        body: JSON.stringify({
          message: "Internal server error",
        }),
      });
    });
  });

  describe("POST /expenses", () => {
    it("should return 400 when the request body is missing", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue("user-123");

      const event = createEvent({
        routeKey: "POST /expenses",
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: "Request body is required",
        }),
      });

      expect(createExpenseMock).not.toHaveBeenCalled();
    });

    it("should create an expense", async () => {
      const userId = "user-123";

      const expenseInput = {
        amount: 142.75,
        description: "Electricity bill",
        categoryId: "bills",
        date: "2026-08-30",
      };

      const createdExpense = {
        id: "expense-123",
        userId,
        ...expenseInput,
      };

      getAuthenticatedUserIdMock.mockResolvedValue(userId);
      createExpenseMock.mockResolvedValue(createdExpense);

      const event = createEvent({
        routeKey: "POST /expenses",
        cookies: ["session=token"],
        body: JSON.stringify(expenseInput),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 201,
        body: JSON.stringify(createdExpense),
      });

      expect(createExpenseMock).toHaveBeenCalledWith(userId, expenseInput);
    });

    it("should return 400 for invalid amount", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue("user-123");
      createExpenseMock.mockRejectedValue(new Error("INVALID_AMOUNT"));

      const event = createEvent({
        routeKey: "POST /expenses",
        body: JSON.stringify({
          amount: -10,
          description: "Invalid",
          categoryId: "food",
          date: "2026-08-30",
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: ERROR_MESSAGES.INVALID_AMOUNT,
        }),
      });
    });

    it("should return 400 for invalid description", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue("user-123");
      createExpenseMock.mockRejectedValue(new Error("INVALID_DESCRIPTION"));

      const event = createEvent({
        routeKey: "POST /expenses",
        body: JSON.stringify({
          amount: 10,
          description: "",
          categoryId: "food",
          date: "2026-08-30",
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: ERROR_MESSAGES.INVALID_DESCRIPTION,
        }),
      });
    });

    it("should return 400 for invalid category", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue("user-123");
      createExpenseMock.mockRejectedValue(new Error("INVALID_CATEGORY"));

      const event = createEvent({
        routeKey: "POST /expenses",
        body: JSON.stringify({
          amount: 10,
          description: "Expense",
          categoryId: "",
          date: "2026-08-30",
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: ERROR_MESSAGES.INVALID_CATEGORY,
        }),
      });
    });

    it("should return 400 for invalid date", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue("user-123");
      createExpenseMock.mockRejectedValue(new Error("INVALID_DATE"));

      const event = createEvent({
        routeKey: "POST /expenses",
        body: JSON.stringify({
          amount: 10,
          description: "Expense",
          categoryId: "food",
          date: "invalid-date",
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: ERROR_MESSAGES.INVALID_DATE,
        }),
      });
    });
  });

  describe("PUT /expenses/{id}", () => {
    it("should return 400 when the request body is missing", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue("user-123");

      const event = createEvent({
        routeKey: "PUT /expenses/{id}",
        pathParameters: {
          id: "expense-123",
        },
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: "Request body is required",
        }),
      });

      expect(updateExpenseMock).not.toHaveBeenCalled();
    });

    it("should return 400 when the expense id is missing", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue("user-123");

      const event = createEvent({
        routeKey: "PUT /expenses/{id}",
        body: JSON.stringify({
          amount: 100,
          description: "Food",
          categoryId: "food",
          date: "2026-08-30",
        }),
        pathParameters: {},
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: "Expense ID is required",
        }),
      });

      expect(updateExpenseMock).not.toHaveBeenCalled();
    });

    it("should update an expense", async () => {
      const userId = "user-123";

      const expense = {
        amount: 150.5,
        description: "Updated expense",
        categoryId: "food",
        date: "2026-08-31",
      };

      getAuthenticatedUserIdMock.mockResolvedValue(userId);
      updateExpenseMock.mockResolvedValue(undefined);

      const event = createEvent({
        routeKey: "PUT /expenses/{id}",
        pathParameters: {
          id: "expense-123",
        },
        body: JSON.stringify(expense),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 200,
      });

      expect(updateExpenseMock).toHaveBeenCalledWith({
        userId,
        expenseId: "expense-123",
        expense,
      });
    });

    it("should return 400 for an invalid date range", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue("user-123");
      updateExpenseMock.mockRejectedValue(new Error("INVALID_DATE_RANGE"));

      const event = createEvent({
        routeKey: "PUT /expenses/{id}",
        pathParameters: {
          id: "expense-123",
        },
        body: JSON.stringify({
          amount: 100,
          description: "Expense",
          categoryId: "food",
          date: "2026-08-30",
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: ERROR_MESSAGES.INVALID_DATE_RANGE,
        }),
      });
    });
  });

  describe("DELETE /expenses/{id}", () => {
    it("should return 400 when the expense id is missing", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue("user-123");

      const event = createEvent({
        routeKey: "DELETE /expenses/{id}",
        pathParameters: {},
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: "Expense ID is required",
        }),
      });

      expect(deleteExpenseMock).not.toHaveBeenCalled();
    });

    it("should delete an expense", async () => {
      const userId = "user-123";

      getAuthenticatedUserIdMock.mockResolvedValue(userId);
      deleteExpenseMock.mockResolvedValue(undefined);

      const event = createEvent({
        routeKey: "DELETE /expenses/{id}",
        pathParameters: {
          id: "expense-123",
        },
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 204,
      });

      expect(deleteExpenseMock).toHaveBeenCalledWith(userId, "expense-123");
    });

    it("should return 500 when deleting fails unexpectedly", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue("user-123");
      deleteExpenseMock.mockRejectedValue(new Error("DynamoDB error"));

      const event = createEvent({
        routeKey: "DELETE /expenses/{id}",
        pathParameters: {
          id: "expense-123",
        },
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 500,
        body: JSON.stringify({
          message: "Internal server error",
        }),
      });
    });
  });

  describe("POST /expenses/suggest-category", () => {
    const userId = "user-123";

    const categories = [
      {
        id: "food",
        name: "Food",
      },
      {
        id: "transport",
        name: "Transport",
      },
    ];

    it("should return 400 when the request body is missing", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue(userId);

      const event = createEvent({
        routeKey: "POST /expenses/suggest-category",
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: "Request body is required",
        }),
      });

      expect(getCategoriesMock).not.toHaveBeenCalled();
      expect(suggestExpenseCategoryMock).not.toHaveBeenCalled();
    });

    it("should return an expense category suggestion", async () => {
      const suggestion = {
        categoryId: "transport",
        confidence: 0.97,
      };

      getAuthenticatedUserIdMock.mockResolvedValue(userId);
      getCategoriesMock.mockResolvedValue(categories);
      suggestExpenseCategoryMock.mockResolvedValue(suggestion);

      const event = createEvent({
        routeKey: "POST /expenses/suggest-category",
        body: JSON.stringify({
          description: "Uber ride from airport",
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 200,
        body: JSON.stringify(suggestion),
      });

      expect(getCategoriesMock).toHaveBeenCalledWith(userId);

      expect(suggestExpenseCategoryMock).toHaveBeenCalledWith({
        description: "Uber ride from airport",
        categories,
      });
    });

    it("should return a null suggestion when the AI category does not exist", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue(userId);
      getCategoriesMock.mockResolvedValue(categories);
      suggestExpenseCategoryMock.mockResolvedValue({
        categoryId: "shopping",
        confidence: 0.98,
      });

      const event = createEvent({
        routeKey: "POST /expenses/suggest-category",
        body: JSON.stringify({
          description: "New headphones",
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 200,
        body: JSON.stringify({
          categoryId: null,
          confidence: 0,
        }),
      });
    });

    it("should return a null category suggestion from the AI", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue(userId);
      getCategoriesMock.mockResolvedValue(categories);

      const suggestion = {
        categoryId: null,
        confidence: 0.2,
      };

      suggestExpenseCategoryMock.mockResolvedValue(suggestion);

      const event = createEvent({
        routeKey: "POST /expenses/suggest-category",
        body: JSON.stringify({
          description: "Unknown expense",
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 200,
        body: JSON.stringify(suggestion),
      });
    });

    it("should return 500 when the AI service fails unexpectedly", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue(userId);
      getCategoriesMock.mockResolvedValue(categories);
      suggestExpenseCategoryMock.mockRejectedValue(
        new Error("OpenAI API error")
      );

      const event = createEvent({
        routeKey: "POST /expenses/suggest-category",
        body: JSON.stringify({
          description: "Uber ride",
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 500,
        body: JSON.stringify({
          message: "Internal server error",
        }),
      });
    });
  });

  describe("unknown routes", () => {
    it("should return 404", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue("user-123");

      const event = createEvent({
        routeKey: "GET /unknown",
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 404,
        body: JSON.stringify({
          message: "Route not found",
        }),
      });
    });
  });
});
