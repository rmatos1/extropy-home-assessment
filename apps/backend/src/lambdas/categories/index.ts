import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { createCategory, getCategories } from "./categories.helper";
import { getAuthenticatedUserId } from "../auth/auth.helper";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const userId = getAuthenticatedUserId(event.headers.authorization);

    if (!userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: "Unauthorized",
        }),
      };
    }

    if (event.routeKey === "GET /categories") {
      const categories = await getCategories(userId);

      return {
        statusCode: 200,
        body: JSON.stringify(categories),
      };
    }

    if (event.routeKey === "POST /categories") {
      if (!event.body) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Request body is required",
          }),
        };
      }

      const category = await createCategory(userId, JSON.parse(event.body));

      return {
        statusCode: 201,
        body: JSON.stringify(category),
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
        case "INVALID_CATEGORY_NAME":
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Invalid category name",
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
