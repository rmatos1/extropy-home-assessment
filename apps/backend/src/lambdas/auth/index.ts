import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { login, signup } from "./auth.helper";
import { ERROR_MESSAGES } from "./auth.constants";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
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
      const result = await signup(body);

      return {
        statusCode: 201,
        body: JSON.stringify(result),
      };
    }

    if (event.routeKey === "POST /auth/login") {
      const result = await login(body);

      return {
        statusCode: 200,
        body: JSON.stringify(result),
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
          return {
            statusCode: 401,
            body: JSON.stringify({
              message: "Invalid email or password.",
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
