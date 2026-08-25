import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { getSpendingReport } from "./reports.helper";
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

    if (event.routeKey === "GET /spending-report") {
      const report = await getSpendingReport(userId);

      return {
        statusCode: 200,
        body: JSON.stringify(report),
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
      if (error.message === "UNAUTHORIZED") {
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
