import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "../index";
import { mockedCategory } from "./mocks";

const { createCategoryMock, getAuthenticatedUserIdMock, getCategoriesMock } =
  vi.hoisted(() => ({
    createCategoryMock: vi.fn(),
    getAuthenticatedUserIdMock: vi.fn(),
    getCategoriesMock: vi.fn(),
  }));

vi.mock("../categories.services", () => ({
  createCategory: createCategoryMock,
  getCategories: getCategoriesMock,
}));

vi.mock("../../auth/auth.helpers", () => ({
  getAuthenticatedUserId: getAuthenticatedUserIdMock,
}));

const createEvent = ({
  routeKey,
  authorization,
  body,
}: {
  routeKey: string;
  authorization?: string;
  body?: unknown;
}): APIGatewayProxyEventV2 =>
  ({
    routeKey,
    headers: authorization
      ? {
          authorization,
        }
      : {},
    body: body === undefined ? undefined : JSON.stringify(body),
  } as unknown as APIGatewayProxyEventV2);

describe("categories lambda handler", () => {
  const { id, userId, name, createdAt, updatedAt } = mockedCategory;

  beforeEach(() => {
    createCategoryMock.mockReset();
    getAuthenticatedUserIdMock.mockReset();
    getCategoriesMock.mockReset();

    getAuthenticatedUserIdMock.mockReturnValue(userId);
  });

  describe("authentication", () => {
    it("should return 401 when authentication fails", async () => {
      getAuthenticatedUserIdMock.mockImplementationOnce(() => {
        throw new Error("UNAUTHORIZED");
      });

      const response = await handler(
        createEvent({
          routeKey: "GET /categories",
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

      expect(getCategoriesMock).not.toHaveBeenCalled();
      expect(createCategoryMock).not.toHaveBeenCalled();
    });
  });

  describe("GET /categories", () => {
    it("should return categories for the authenticated user", async () => {
      const categories = [mockedCategory];

      getCategoriesMock.mockResolvedValueOnce(categories);

      const response = await handler(
        createEvent({
          routeKey: "GET /categories",
          authorization: "Bearer valid-token",
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 200,
        body: JSON.stringify(categories),
      });

      expect(getAuthenticatedUserIdMock).toHaveBeenCalledWith(
        "Bearer valid-token"
      );

      expect(getCategoriesMock).toHaveBeenCalledWith(userId);
      expect(createCategoryMock).not.toHaveBeenCalled();
    });

    it("should return 500 when getCategories fails unexpectedly", async () => {
      getCategoriesMock.mockRejectedValueOnce(new Error("Unexpected error"));

      const response = await handler(
        createEvent({
          routeKey: "GET /categories",
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

  describe("POST /categories", () => {
    it("should return 201 when the category is created", async () => {
      const categoryResponse = {
        id,
        name,
        createdAt,
        updatedAt,
      };

      createCategoryMock.mockResolvedValueOnce(categoryResponse);

      const response = await handler(
        createEvent({
          routeKey: "POST /categories",
          authorization: "Bearer valid-token",
          body: name,
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 201,
        body: JSON.stringify(categoryResponse),
      });

      expect(getAuthenticatedUserIdMock).toHaveBeenCalledWith(
        "Bearer valid-token"
      );

      expect(createCategoryMock).toHaveBeenCalledWith(userId, name);

      expect(getCategoriesMock).not.toHaveBeenCalled();
    });

    it("should return 400 when the request body is missing", async () => {
      const response = await handler(
        createEvent({
          routeKey: "POST /categories",
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

      expect(createCategoryMock).not.toHaveBeenCalled();
    });

    it("should return 400 when the category name is invalid", async () => {
      createCategoryMock.mockRejectedValueOnce(
        new Error("INVALID_CATEGORY_NAME")
      );

      const response = await handler(
        createEvent({
          routeKey: "POST /categories",
          authorization: "Bearer valid-token",
          body: "   ",
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid category name",
        }),
      });
    });

    it("should return 500 when createCategory fails unexpectedly", async () => {
      createCategoryMock.mockRejectedValueOnce(new Error("Unexpected error"));

      const response = await handler(
        createEvent({
          routeKey: "POST /categories",
          authorization: "Bearer valid-token",
          body: name,
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
          routeKey: "GET /categories/unknown",
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

      expect(getCategoriesMock).not.toHaveBeenCalled();
      expect(createCategoryMock).not.toHaveBeenCalled();
    });
  });
});
