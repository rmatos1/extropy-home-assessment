import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ERROR_MESSAGES } from "../expenses.constants";
import { handler } from "../index";
import { dates, mockedExpense, mockedUpdateExpense } from "./mocks";

const {
  createExpenseMock,
  deleteExpenseMock,
  getAuthenticatedUserIdMock,
  getExpensesMock,
  updateExpenseMock,
} = vi.hoisted(() => ({
  createExpenseMock: vi.fn(),
  deleteExpenseMock: vi.fn(),
  getAuthenticatedUserIdMock: vi.fn(),
  getExpensesMock: vi.fn(),
  updateExpenseMock: vi.fn(),
}));

vi.mock("../expenses.helper", () => ({
  createExpense: createExpenseMock,
  deleteExpense: deleteExpenseMock,
  getExpenses: getExpensesMock,
  updateExpense: updateExpenseMock,
}));

vi.mock("../../auth/auth.helpers", () => ({
  getAuthenticatedUserId: getAuthenticatedUserIdMock,
}));

const createEvent = ({
  routeKey,
  authorization,
  body,
  pathParameters,
  queryStringParameters,
}: {
  routeKey: string;
  authorization?: string;
  body?: unknown;
  pathParameters?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
}): APIGatewayProxyEventV2 =>
  ({
    routeKey,
    headers: authorization
      ? {
          authorization,
        }
      : {},
    body: body === undefined ? undefined : JSON.stringify(body),
    pathParameters,
    queryStringParameters,
  } as unknown as APIGatewayProxyEventV2);

describe("expenses lambda handler", () => {
  const { id, userId, amount, description, categoryId, date } = mockedExpense;

  beforeEach(() => {
    createExpenseMock.mockReset();
    deleteExpenseMock.mockReset();
    getAuthenticatedUserIdMock.mockReset();
    getExpensesMock.mockReset();
    updateExpenseMock.mockReset();

    getAuthenticatedUserIdMock.mockReturnValue(userId);
  });

  describe("authentication", () => {
    it("should return 401 when authentication fails", async () => {
      getAuthenticatedUserIdMock.mockImplementationOnce(() => {
        throw new Error("UNAUTHORIZED");
      });

      const response = await handler(
        createEvent({
          routeKey: "GET /expenses",
          authorization: "Bearer invalid-token",
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 401,
        body: JSON.stringify({
          message: "Unauthorized",
        }),
      });

      expect(getAuthenticatedUserIdMock).toHaveBeenCalledWith(
        "Bearer invalid-token"
      );

      expect(getExpensesMock).not.toHaveBeenCalled();
      expect(createExpenseMock).not.toHaveBeenCalled();
      expect(updateExpenseMock).not.toHaveBeenCalled();
      expect(deleteExpenseMock).not.toHaveBeenCalled();
    });
  });

  describe("GET /expenses", () => {
    it("should return all expenses for the authenticated user", async () => {
      getExpensesMock.mockResolvedValueOnce([mockedExpense]);

      const response = await handler(
        createEvent({
          routeKey: "GET /expenses",
          authorization: "Bearer valid-token",
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 200,
        body: JSON.stringify([mockedExpense]),
      });

      expect(getAuthenticatedUserIdMock).toHaveBeenCalledWith(
        "Bearer valid-token"
      );

      expect(getExpensesMock).toHaveBeenCalledWith({
        userId,
        startDate: undefined,
        endDate: undefined,
        categoryId: undefined,
      });
    });

    it("should pass date and category filters to getExpenses", async () => {
      getExpensesMock.mockResolvedValueOnce([mockedExpense]);

      const response = await handler(
        createEvent({
          routeKey: "GET /expenses",
          authorization: "Bearer valid-token",
          queryStringParameters: {
            startDate: dates.start,
            endDate: dates.end,
            categoryId,
          },
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 200,
        body: JSON.stringify([mockedExpense]),
      });

      expect(getExpensesMock).toHaveBeenCalledWith({
        userId,
        startDate: dates.start,
        endDate: dates.end,
        categoryId,
      });
    });

    it("should return 400 for an invalid date range", async () => {
      getExpensesMock.mockRejectedValueOnce(new Error("INVALID_DATE_RANGE"));

      const response = await handler(
        createEvent({
          routeKey: "GET /expenses",
          authorization: "Bearer valid-token",
          queryStringParameters: {
            startDate: dates.end,
            endDate: dates.start,
          },
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: ERROR_MESSAGES.INVALID_DATE_RANGE,
        }),
      });
    });

    it("should return 500 when getExpenses fails unexpectedly", async () => {
      getExpensesMock.mockRejectedValueOnce(new Error("Unexpected error"));

      const response = await handler(
        createEvent({
          routeKey: "GET /expenses",
          authorization: "Bearer valid-token",
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 500,
        body: JSON.stringify({
          message: "Internal server error",
        }),
      });
    });
  });

  describe("POST /expenses", () => {
    it("should return 201 when the expense is created", async () => {
      const input = {
        amount,
        description,
        categoryId,
        date,
      };

      createExpenseMock.mockResolvedValueOnce(mockedExpense);

      const response = await handler(
        createEvent({
          routeKey: "POST /expenses",
          authorization: "Bearer valid-token",
          body: input,
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 201,
        body: JSON.stringify(mockedExpense),
      });

      expect(getAuthenticatedUserIdMock).toHaveBeenCalledWith(
        "Bearer valid-token"
      );

      expect(createExpenseMock).toHaveBeenCalledWith(userId, input);
    });

    it("should return 400 when the request body is missing", async () => {
      const response = await handler(
        createEvent({
          routeKey: "POST /expenses",
          authorization: "Bearer valid-token",
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: "Request body is required",
        }),
      });

      expect(createExpenseMock).not.toHaveBeenCalled();
    });

    it("should return 400 when the amount is invalid", async () => {
      createExpenseMock.mockRejectedValueOnce(new Error("INVALID_AMOUNT"));

      const response = await handler(
        createEvent({
          routeKey: "POST /expenses",
          authorization: "Bearer valid-token",
          body: {
            amount: 0,
            description,
            categoryId,
            date,
          },
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: ERROR_MESSAGES.INVALID_AMOUNT,
        }),
      });
    });

    it("should return 400 when the description is invalid", async () => {
      createExpenseMock.mockRejectedValueOnce(new Error("INVALID_DESCRIPTION"));

      const response = await handler(
        createEvent({
          routeKey: "POST /expenses",
          authorization: "Bearer valid-token",
          body: {
            amount,
            description: "",
            categoryId,
            date,
          },
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: ERROR_MESSAGES.INVALID_DESCRIPTION,
        }),
      });
    });

    it("should return 400 when the category is invalid", async () => {
      createExpenseMock.mockRejectedValueOnce(new Error("INVALID_CATEGORY"));

      const response = await handler(
        createEvent({
          routeKey: "POST /expenses",
          authorization: "Bearer valid-token",
          body: {
            amount,
            description,
            categoryId: "",
            date,
          },
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: ERROR_MESSAGES.INVALID_CATEGORY,
        }),
      });
    });

    it("should return 400 when the date is invalid", async () => {
      createExpenseMock.mockRejectedValueOnce(new Error("INVALID_DATE"));

      const response = await handler(
        createEvent({
          routeKey: "POST /expenses",
          authorization: "Bearer valid-token",
          body: {
            amount,
            description,
            categoryId,
            date: "invalid-date",
          },
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: ERROR_MESSAGES.INVALID_DATE,
        }),
      });
    });
  });

  describe("PUT /expenses/{id}", () => {
    it("should return 200 when the expense is updated", async () => {
      const input = {
        amount,
        description: mockedUpdateExpense.description,
        categoryId,
        date,
      };

      updateExpenseMock.mockResolvedValueOnce(undefined);

      const response = await handler(
        createEvent({
          routeKey: "PUT /expenses/{id}",
          authorization: "Bearer valid-token",
          pathParameters: {
            id,
          },
          body: input,
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 200,
      });

      expect(updateExpenseMock).toHaveBeenCalledWith({
        userId,
        expenseId: id,
        expense: input,
      });
    });

    it("should return 400 when the request body is missing", async () => {
      const response = await handler(
        createEvent({
          routeKey: "PUT /expenses/{id}",
          authorization: "Bearer valid-token",
          pathParameters: {
            id,
          },
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: "Request body is required",
        }),
      });

      expect(updateExpenseMock).not.toHaveBeenCalled();
    });

    it("should return 400 when the expense id is missing", async () => {
      const response = await handler(
        createEvent({
          routeKey: "PUT /expenses/{id}",
          authorization: "Bearer valid-token",
          body: {
            amount,
            description,
            categoryId,
            date,
          },
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: "Expense ID is required",
        }),
      });

      expect(updateExpenseMock).not.toHaveBeenCalled();
    });

    it("should return 500 when updateExpense fails unexpectedly", async () => {
      updateExpenseMock.mockRejectedValueOnce(new Error("Unexpected error"));

      const response = await handler(
        createEvent({
          routeKey: "PUT /expenses/{id}",
          authorization: "Bearer valid-token",
          pathParameters: {
            id,
          },
          body: {
            amount,
            description,
            categoryId,
            date,
          },
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 500,
        body: JSON.stringify({
          message: "Internal server error",
        }),
      });
    });
  });

  describe("DELETE /expenses/{id}", () => {
    it("should return 204 when the expense is deleted", async () => {
      deleteExpenseMock.mockResolvedValueOnce(undefined);

      const response = await handler(
        createEvent({
          routeKey: "DELETE /expenses/{id}",
          authorization: "Bearer valid-token",
          pathParameters: {
            id,
          },
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 204,
      });

      expect(deleteExpenseMock).toHaveBeenCalledWith(userId, id);
    });

    it("should return 400 when the expense id is missing", async () => {
      const response = await handler(
        createEvent({
          routeKey: "DELETE /expenses/{id}",
          authorization: "Bearer valid-token",
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: "Expense ID is required",
        }),
      });

      expect(deleteExpenseMock).not.toHaveBeenCalled();
    });

    it("should return 500 when deleteExpense fails unexpectedly", async () => {
      deleteExpenseMock.mockRejectedValueOnce(new Error("Unexpected error"));

      const response = await handler(
        createEvent({
          routeKey: "DELETE /expenses/{id}",
          authorization: "Bearer valid-token",
          pathParameters: {
            id,
          },
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 500,
        body: JSON.stringify({
          message: "Internal server error",
        }),
      });
    });
  });

  describe("unknown routes", () => {
    it("should return 404", async () => {
      const response = await handler(
        createEvent({
          routeKey: "GET /expenses/unknown",
          authorization: "Bearer valid-token",
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 404,
        body: JSON.stringify({
          message: "Route not found",
        }),
      });

      expect(getExpensesMock).not.toHaveBeenCalled();
      expect(createExpenseMock).not.toHaveBeenCalled();
      expect(updateExpenseMock).not.toHaveBeenCalled();
      expect(deleteExpenseMock).not.toHaveBeenCalled();
    });
  });
});
