import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "./expenses.services";
import { suggestExpenseCategory } from "./expenses.ai";
import { ERROR_MESSAGES } from "./expenses.constants";
import { getAuthenticatedUserId } from "../auth/auth.helpers";
import { getCategories } from "../categories/categories.services";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const userId = await getAuthenticatedUserId(event.cookies);

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: "Unauthorized",
        }),
      };
    }

    if (event.routeKey === "GET /expenses") {
      const { startDate, endDate, categoryId } =
        event.queryStringParameters ?? {};

      const expenses = await getExpenses({
        userId,
        startDate,
        endDate,
        categoryId,
      });

      return {
        statusCode: 200,
        body: JSON.stringify(expenses),
      };
    }

    if (event.routeKey === "POST /expenses") {
      if (!event.body) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Request body is required",
          }),
        };
      }

      const expense = await createExpense(userId, JSON.parse(event.body));

      return {
        statusCode: 201,
        body: JSON.stringify(expense),
      };
    }

    if (event.routeKey === "PUT /expenses/{id}") {
      if (!event.body) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Request body is required",
          }),
        };
      }

      const expenseId = event.pathParameters?.id;

      if (!expenseId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Expense ID is required",
          }),
        };
      }

      await updateExpense({
        userId,
        expenseId,
        expense: JSON.parse(event.body),
      });

      return {
        statusCode: 200,
      };
    }

    if (event.routeKey === "DELETE /expenses/{id}") {
      const expenseId = event.pathParameters?.id;

      if (!expenseId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Expense ID is required",
          }),
        };
      }

      await deleteExpense(userId, expenseId);

      return {
        statusCode: 204,
      };
    }

    if (event.routeKey === "POST /expenses/suggest-category") {
      if (!event.body) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Request body is required",
          }),
        };
      }

      const { description } = JSON.parse(event.body);

      const categories = await getCategories(userId);

      const suggestion = await suggestExpenseCategory({
        description,
        categories,
      });

      if (
        suggestion.categoryId !== null &&
        !categories.some((category) => category.id === suggestion.categoryId)
      ) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            categoryId: null,
            confidence: 0,
          }),
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(suggestion),
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "Route not found",
      }),
    };
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      switch (error.message) {
        case "INVALID_AMOUNT":
        case "INVALID_DESCRIPTION":
        case "INVALID_CATEGORY":
        case "INVALID_DATE":
        case "INVALID_DATE_RANGE":
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: ERROR_MESSAGES[error.message],
            }),
          };

        case "UNAUTHORIZED":
          return {
            statusCode: 401,
            body: JSON.stringify({
              message: "Unauthorized",
            }),
          };
      }
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
      }),
    };
  }
};
