import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

import {
  createSessionCookie,
  getCurrentUser,
  login,
  signup,
} from "./auth.helper";
import { ERROR_MESSAGES } from "./auth.constants";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    if (event.routeKey === "GET /auth/me") {
      const user = await getCurrentUser(event.headers.cookie);

      return {
        statusCode: 200,
        body: JSON.stringify(user),
      };
    }

    if (
      event.routeKey === "POST /auth/signup" ||
      event.routeKey === "POST /auth/login"
    ) {
      if (!event.body) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Request body is required",
          }),
        };
      }

      const body = JSON.parse(event.body);

      if (event.routeKey === "POST /auth/signup") {
        const token = await signup(body);

        return {
          statusCode: 201,
          cookies: [createSessionCookie(token)],
        };
      }

      const token = await login(body);

      return {
        statusCode: 200,
        cookies: [createSessionCookie(token)],
      };
    }

    if (event.routeKey === "POST /auth/logout") {
      return {
        statusCode: 204,
        cookies: [createSessionCookie("", 0)],
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
        case "INVALID_EMAIL":
        case "INVALID_PASSWORD":
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: ERROR_MESSAGES[error.message],
            }),
          };

        case "USER_EMAIL_ALREADY_EXISTS":
          return {
            statusCode: 409,
            body: JSON.stringify({
              message: "A user with this email is already registered.",
            }),
          };

        case "INVALID_CREDENTIALS":
        case "UNAUTHORIZED":
          return {
            statusCode: 401,
            body: JSON.stringify({
              message:
                error.message === "UNAUTHORIZED"
                  ? "Unauthorized"
                  : "Invalid email or password.",
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
