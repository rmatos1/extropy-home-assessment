import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAuthenticatedUserId } from "../../auth/auth.helpers";
import { createCategory, getCategories } from "../categories.services";
import { handler } from "../index";

vi.mock("../../auth/auth.helpers", () => ({
  getAuthenticatedUserId: vi.fn(),
}));

vi.mock("../categories.services", () => ({
  createCategory: vi.fn(),
  getCategories: vi.fn(),
}));

const getAuthenticatedUserIdMock = vi.mocked(getAuthenticatedUserId);
const createCategoryMock = vi.mocked(createCategory);
const getCategoriesMock = vi.mocked(getCategories);

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

describe("categories handler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("authentication", () => {
    it("should return 401 when the user is not authenticated", async () => {
      getAuthenticatedUserIdMock.mockResolvedValue("");

      const event = createEvent({
        routeKey: "GET /categories",
        cookies: ["session=token"],
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 401,
        body: JSON.stringify({
          message: "Unauthorized",
        }),
      });

      expect(getCategoriesMock).not.toHaveBeenCalled();
      expect(createCategoryMock).not.toHaveBeenCalled();
    });

    it("should return 401 when authentication fails", async () => {
      getAuthenticatedUserIdMock.mockRejectedValue(new Error("UNAUTHORIZED"));

      const event = createEvent({
        routeKey: "GET /categories",
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

  describe("GET /categories", () => {
    it("should return the user's categories", async () => {
      const userId = "user-123";

      const categories = [
        {
          id: "food",
          userId,
          name: "Food",
        },
        {
          id: "bills",
          userId,
          name: "Bills",
        },
      ];

      getAuthenticatedUserIdMock.mockResolvedValue(userId);
      getCategoriesMock.mockResolvedValue(categories);

      const event = createEvent({
        routeKey: "GET /categories",
        cookies: ["session=token"],
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 200,
        body: JSON.stringify(categories),
      });

      expect(getAuthenticatedUserIdMock).toHaveBeenCalledWith([
        "session=token",
      ]);
      expect(getCategoriesMock).toHaveBeenCalledWith(userId);
    });

    it("should return an empty list when the user has no categories", async () => {
      const userId = "user-123";

      getAuthenticatedUserIdMock.mockResolvedValue(userId);
      getCategoriesMock.mockResolvedValue([]);

      const event = createEvent({
        routeKey: "GET /categories",
        cookies: ["session=token"],
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 200,
        body: JSON.stringify([]),
      });
    });
  });

  describe("POST /categories", () => {
    it("should return 400 when the request body is missing", async () => {
      const userId = "user-123";

      getAuthenticatedUserIdMock.mockResolvedValue(userId);

      const event = createEvent({
        routeKey: "POST /categories",
        cookies: ["session=token"],
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: "Request body is required",
        }),
      });

      expect(createCategoryMock).not.toHaveBeenCalled();
    });

    it("should create a category", async () => {
      const userId = "user-123";

      const categoryName = "Food";

      const category = {
        id: "food",
        userId,
        name: categoryName,
      };

      getAuthenticatedUserIdMock.mockResolvedValue(userId);
      createCategoryMock.mockResolvedValue(category);

      const event = createEvent({
        routeKey: "POST /categories",
        cookies: ["session=token"],
        body: JSON.stringify({
          categoryName,
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 201,
        body: JSON.stringify(category),
      });

      expect(getAuthenticatedUserIdMock).toHaveBeenCalledWith([
        "session=token",
      ]);
      expect(createCategoryMock).toHaveBeenCalledWith(userId, categoryName);
    });

    it("should return 400 for an invalid category name", async () => {
      const userId = "user-123";

      getAuthenticatedUserIdMock.mockResolvedValue(userId);
      createCategoryMock.mockRejectedValue(new Error("INVALID_CATEGORY_NAME"));

      const event = createEvent({
        routeKey: "POST /categories",
        cookies: ["session=token"],
        body: JSON.stringify({
          categoryName: "",
        }),
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid category name",
        }),
      });
    });

    it("should return 500 for an unexpected service error", async () => {
      const userId = "user-123";

      getAuthenticatedUserIdMock.mockResolvedValue(userId);
      getCategoriesMock.mockRejectedValue(new Error("DynamoDB error"));

      const event = createEvent({
        routeKey: "GET /categories",
        cookies: ["session=token"],
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 500,
        body: JSON.stringify({
          message: "Internal server error",
        }),
      });
    });

    it("should return 500 when category creation fails unexpectedly", async () => {
      const userId = "user-123";

      getAuthenticatedUserIdMock.mockResolvedValue(userId);
      createCategoryMock.mockRejectedValue(new Error("Unexpected error"));

      const event = createEvent({
        routeKey: "POST /categories",
        cookies: ["session=token"],
        body: JSON.stringify({
          categoryName: "Food",
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
    it("should return 404 for an unknown route", async () => {
      const userId = "user-123";

      getAuthenticatedUserIdMock.mockResolvedValue(userId);

      const event = createEvent({
        routeKey: "GET /unknown",
        cookies: ["session=token"],
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
