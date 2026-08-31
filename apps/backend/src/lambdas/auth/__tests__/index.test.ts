import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSessionCookie, getAuthenticatedUserId } from "../auth.helpers";
import { ERROR_MESSAGES, SESSION_COOKIE_NAME } from "../auth.constants";
import { getCurrentUser, login, signup, updateProfile } from "../auth.services";
import { handler } from "../index";

vi.mock("../auth.services", () => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  signup: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock("../auth.helpers", () => ({
  createSessionCookie: vi.fn(),
  getAuthenticatedUserId: vi.fn(),
}));

const getCurrentUserMock = vi.mocked(getCurrentUser);
const loginMock = vi.mocked(login);
const signupMock = vi.mocked(signup);
const updateProfileMock = vi.mocked(updateProfile);

const createSessionCookieMock = vi.mocked(createSessionCookie);
const getAuthenticatedUserIdMock = vi.mocked(getAuthenticatedUserId);

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

describe("auth handler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("GET /auth/me", () => {
    it("should return the current user", async () => {
      const user = {
        id: "user-123",
        email: "john@example.com",
      };

      getCurrentUserMock.mockResolvedValue(user);

      const event = createEvent({
        routeKey: "GET /auth/me",
        cookies: ["session=token"],
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 200,
        body: JSON.stringify(user),
      });

      expect(getCurrentUserMock).toHaveBeenCalledWith(["session=token"]);
    });

    it("should return 401 when the user is unauthorized", async () => {
      getCurrentUserMock.mockRejectedValue(new Error("UNAUTHORIZED"));

      const event = createEvent({
        routeKey: "GET /auth/me",
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

    it("should return 500 for an unexpected error", async () => {
      getCurrentUserMock.mockRejectedValue(new Error("Unexpected error"));

      const event = createEvent({
        routeKey: "GET /auth/me",
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

  describe("PATCH /auth/me", () => {
    it("should return 400 when the request body is missing", async () => {
      const event = createEvent({
        routeKey: "PATCH /auth/me",
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: "Request body is required",
        }),
      });

      expect(getAuthenticatedUserIdMock).not.toHaveBeenCalled();
      expect(updateProfileMock).not.toHaveBeenCalled();
    });

    it("should return 400 when the request body contains invalid JSON", async () => {
      const event = createEvent({
        routeKey: "PATCH /auth/me",
        body: "{invalid-json",
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid JSON body",
        }),
      });

      expect(getAuthenticatedUserIdMock).not.toHaveBeenCalled();
      expect(updateProfileMock).not.toHaveBeenCalled();
    });

    it("should update the profile", async () => {
      const cookies = ["session=token"];
      const body = {
        email: "new@example.com",
        password: "new-password",
      };

      getAuthenticatedUserIdMock.mockResolvedValue("user-123");
      updateProfileMock.mockResolvedValue(["email", "password"]);

      const event = createEvent({
        routeKey: "PATCH /auth/me",
        cookies,
        body: JSON.stringify(body),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 200,
        body: JSON.stringify(["email", "password"]),
      });

      expect(getAuthenticatedUserIdMock).toHaveBeenCalledWith(cookies);
      expect(updateProfileMock).toHaveBeenCalledWith("user-123", body);
    });

    it("should return 401 when authentication fails", async () => {
      getAuthenticatedUserIdMock.mockRejectedValue(new Error("UNAUTHORIZED"));

      const event = createEvent({
        routeKey: "PATCH /auth/me",
        cookies: ["session=invalid"],
        body: JSON.stringify({
          email: "new@example.com",
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 401,
        body: JSON.stringify({
          message: "Unauthorized",
        }),
      });

      expect(updateProfileMock).not.toHaveBeenCalled();
    });

    it("should return 400 for invalid email", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue("user-123");
      updateProfileMock.mockRejectedValue(new Error("INVALID_EMAIL"));

      const event = createEvent({
        routeKey: "PATCH /auth/me",
        body: JSON.stringify({
          email: "invalid-email",
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: ERROR_MESSAGES.INVALID_EMAIL,
        }),
      });
    });

    it("should return 400 for invalid password", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue("user-123");
      updateProfileMock.mockRejectedValue(new Error("INVALID_PASSWORD"));

      const event = createEvent({
        routeKey: "PATCH /auth/me",
        body: JSON.stringify({
          password: "short",
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: ERROR_MESSAGES.INVALID_PASSWORD,
        }),
      });
    });

    it("should return 409 when the email already exists", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue("user-123");
      updateProfileMock.mockRejectedValue(
        new Error("USER_EMAIL_ALREADY_EXISTS")
      );

      const event = createEvent({
        routeKey: "PATCH /auth/me",
        body: JSON.stringify({
          email: "existing@example.com",
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 409,
        body: JSON.stringify({
          message: "A user with this email is already registered.",
        }),
      });
    });
  });

  describe("POST /auth/signup", () => {
    it("should return 400 when the request body is missing", async () => {
      const event = createEvent({
        routeKey: "POST /auth/signup",
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: "Request body is required",
        }),
      });

      expect(signupMock).not.toHaveBeenCalled();
    });

    it("should create a user and return a session cookie", async () => {
      const body = {
        email: "john@example.com",
        password: "password123",
      };

      const token = "signup-token";
      const cookie = `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure`;

      signupMock.mockResolvedValue(token);
      createSessionCookieMock.mockReturnValue(cookie);

      const event = createEvent({
        routeKey: "POST /auth/signup",
        body: JSON.stringify(body),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 201,
        cookies: [cookie],
      });

      expect(signupMock).toHaveBeenCalledWith(body);
      expect(createSessionCookieMock).toHaveBeenCalledWith(token);
    });

    it("should return 400 for invalid email", async () => {
      signupMock.mockRejectedValue(new Error("INVALID_EMAIL"));

      const event = createEvent({
        routeKey: "POST /auth/signup",
        body: JSON.stringify({
          email: "invalid",
          password: "password123",
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: ERROR_MESSAGES.INVALID_EMAIL,
        }),
      });
    });

    it("should return 400 for invalid password", async () => {
      signupMock.mockRejectedValue(new Error("INVALID_PASSWORD"));

      const event = createEvent({
        routeKey: "POST /auth/signup",
        body: JSON.stringify({
          email: "john@example.com",
          password: "short",
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: ERROR_MESSAGES.INVALID_PASSWORD,
        }),
      });
    });

    it("should return 409 when the email already exists", async () => {
      signupMock.mockRejectedValue(new Error("USER_EMAIL_ALREADY_EXISTS"));

      const event = createEvent({
        routeKey: "POST /auth/signup",
        body: JSON.stringify({
          email: "john@example.com",
          password: "password123",
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 409,
        body: JSON.stringify({
          message: "A user with this email is already registered.",
        }),
      });
    });
  });

  describe("POST /auth/login", () => {
    it("should return 400 when the request body is missing", async () => {
      const event = createEvent({
        routeKey: "POST /auth/login",
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: "Request body is required",
        }),
      });

      expect(loginMock).not.toHaveBeenCalled();
    });

    it("should login the user and return a session cookie", async () => {
      const body = {
        email: "john@example.com",
        password: "password123",
      };

      const token = "login-token";
      const cookie = `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure`;

      loginMock.mockResolvedValue(token);
      createSessionCookieMock.mockReturnValue(cookie);

      const event = createEvent({
        routeKey: "POST /auth/login",
        body: JSON.stringify(body),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 200,
        cookies: [cookie],
      });

      expect(loginMock).toHaveBeenCalledWith(body);
      expect(createSessionCookieMock).toHaveBeenCalledWith(token);
    });

    it("should return 401 for invalid credentials", async () => {
      loginMock.mockRejectedValue(new Error("INVALID_CREDENTIALS"));

      const event = createEvent({
        routeKey: "POST /auth/login",
        body: JSON.stringify({
          email: "john@example.com",
          password: "wrong-password",
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 401,
        body: JSON.stringify({
          message: "Invalid email or password.",
        }),
      });
    });

    it("should return 400 for invalid email", async () => {
      loginMock.mockRejectedValue(new Error("INVALID_EMAIL"));

      const event = createEvent({
        routeKey: "POST /auth/login",
        body: JSON.stringify({
          email: "invalid-email",
          password: "password123",
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: ERROR_MESSAGES.INVALID_EMAIL,
        }),
      });
    });
  });

  describe("POST /auth/logout", () => {
    it("should return 204 and expire the session cookie", async () => {
      const cookie = `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; Max-Age=0`;

      createSessionCookieMock.mockReturnValue(cookie);

      const event = createEvent({
        routeKey: "POST /auth/logout",
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 204,
        cookies: [cookie],
      });

      expect(createSessionCookieMock).toHaveBeenCalledWith("", 0);
    });
  });

  describe("unknown routes", () => {
    it("should return 404", async () => {
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

  describe("unexpected errors", () => {
    it("should return 500 for an unhandled service error", async () => {
      loginMock.mockRejectedValue(new Error("Unexpected error"));

      const event = createEvent({
        routeKey: "POST /auth/login",
        body: JSON.stringify({
          email: "john@example.com",
          password: "password123",
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
});
