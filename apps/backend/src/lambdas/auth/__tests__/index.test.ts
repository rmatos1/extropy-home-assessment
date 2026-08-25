import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "../index";
import { ERROR_MESSAGES } from "../auth.constants";
import { mockedUser } from "./mocks";

const { signupMock, loginMock } = vi.hoisted(() => ({
  signupMock: vi.fn(),
  loginMock: vi.fn(),
}));

vi.mock("../auth.helpers", () => ({
  signup: signupMock,
  login: loginMock,
}));

const createEvent = (
  routeKey: string,
  body?: unknown
): APIGatewayProxyEventV2 =>
  ({
    routeKey,
    body: body === undefined ? undefined : JSON.stringify(body),
  } as APIGatewayProxyEventV2);

describe("auth lambda handler", () => {
  const { id, email, password } = mockedUser;

  beforeEach(() => {
    signupMock.mockReset();
    loginMock.mockReset();
  });

  describe("POST /auth/signup", () => {
    it("should return 201 when signup succeeds", async () => {
      const input = {
        email,
        password,
      };

      const result = {
        token: "signup-token",
      };

      signupMock.mockResolvedValueOnce(result);

      const response = await handler(
        createEvent("POST /auth/signup", input),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 201,
        body: JSON.stringify(result),
      });

      expect(signupMock).toHaveBeenCalledWith(input);
      expect(loginMock).not.toHaveBeenCalled();
    });

    it("should return 400 when the request body is missing", async () => {
      const response = await handler(
        createEvent("POST /auth/signup"),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: "Request body is required",
        }),
      });

      expect(signupMock).not.toHaveBeenCalled();
      expect(loginMock).not.toHaveBeenCalled();
    });

    it("should return 500 when the request body is invalid JSON", async () => {
      const event = {
        routeKey: "POST /auth/signup",
        body: "{invalid-json",
      } as APIGatewayProxyEventV2;

      const response = await handler(event, {} as never, () => undefined);

      expect(response).toEqual({
        statusCode: 500,
        body: JSON.stringify({
          message: "Internal server error",
        }),
      });

      expect(signupMock).not.toHaveBeenCalled();
      expect(loginMock).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid email", async () => {
      signupMock.mockRejectedValueOnce(new Error("INVALID_EMAIL"));

      const response = await handler(
        createEvent("POST /auth/signup", {
          email: "invalid",
          password,
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: ERROR_MESSAGES["INVALID_EMAIL"],
        }),
      });
    });

    it("should return 400 for invalid password", async () => {
      signupMock.mockRejectedValueOnce(new Error("INVALID_PASSWORD"));

      const response = await handler(
        createEvent("POST /auth/signup", {
          email,
          password: "short",
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: ERROR_MESSAGES["INVALID_PASSWORD"],
        }),
      });
    });

    it("should return 409 when the email is already registered", async () => {
      signupMock.mockRejectedValueOnce(new Error("USER_EMAIL_ALREADY_EXISTS"));

      const response = await handler(
        createEvent("POST /auth/signup", {
          email,
          password,
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 409,
        body: JSON.stringify({
          message: "A user with this email is already registered.",
        }),
      });
    });
  });

  describe("POST /auth/login", () => {
    it("should return 200 when login succeeds", async () => {
      const input = {
        email,
        password,
      };

      const result = {
        token: "login-token",
      };

      loginMock.mockResolvedValueOnce(result);

      const response = await handler(
        createEvent("POST /auth/login", input),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 200,
        body: JSON.stringify(result),
      });

      expect(loginMock).toHaveBeenCalledWith(input);
      expect(signupMock).not.toHaveBeenCalled();
    });

    it("should return 401 when credentials are invalid", async () => {
      loginMock.mockRejectedValueOnce(new Error("INVALID_CREDENTIALS"));

      const response = await handler(
        createEvent("POST /auth/login", {
          email,
          password: "wrong-password",
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 401,
        body: JSON.stringify({
          message: "Invalid email or password.",
        }),
      });
    });

    it("should return 400 for invalid email", async () => {
      loginMock.mockRejectedValueOnce(new Error("INVALID_EMAIL"));

      const response = await handler(
        createEvent("POST /auth/login", {
          email: "invalid",
          password,
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: ERROR_MESSAGES["INVALID_EMAIL"],
        }),
      });
    });
  });

  describe("unknown routes", () => {
    it("should return 404", async () => {
      const response = await handler(
        createEvent("GET /auth/unknown", {}),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 404,
        body: JSON.stringify({
          message: "Route not found",
        }),
      });

      expect(signupMock).not.toHaveBeenCalled();
      expect(loginMock).not.toHaveBeenCalled();
    });
  });

  describe("unexpected errors", () => {
    it("should return 500 when signup fails unexpectedly", async () => {
      signupMock.mockRejectedValueOnce(new Error("Unexpected error"));

      const response = await handler(
        createEvent("POST /auth/signup", {
          email,
          password,
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
});
