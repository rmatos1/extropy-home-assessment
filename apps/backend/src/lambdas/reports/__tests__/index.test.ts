import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAuthenticatedUserId } from "../../auth/auth.helpers";
import { getSpendingReport } from "../reports.services";
import { handler } from "../index";

vi.mock("../../auth/auth.helpers", () => ({
  getAuthenticatedUserId: vi.fn(),
}));

vi.mock("../reports.services", () => ({
  getSpendingReport: vi.fn(),
}));

const getAuthenticatedUserIdMock = vi.mocked(getAuthenticatedUserId);
const getSpendingReportMock = vi.mocked(getSpendingReport);

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

describe("reports handler", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("GET /spending-report", () => {
    it("should return the spending report", async () => {
      const userId = "user-123";

      const report = {
        totalThisMonth: 450.75,
        totalThisYear: 3200.5,
        monthlySpending: [
          {
            month: "2026-08",
            amount: 450.75,
          },
        ],
        spendingByCategory: [
          {
            categoryId: "food",
            categoryName: "Food",
            amount: 200,
          },
        ],
        recentExpenses: [
          {
            id: "expense-1",
            userId,
            amount: 50,
            description: "Lunch",
            categoryId: "food",
            categoryName: "Food",
            date: "2026-08-30",
          },
        ],
      };

      getAuthenticatedUserIdMock.mockResolvedValue(userId);
      getSpendingReportMock.mockResolvedValue(report);

      const event = createEvent({
        routeKey: "GET /spending-report",
        cookies: ["session=token"],
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 200,
        body: JSON.stringify(report),
      });

      expect(getAuthenticatedUserIdMock).toHaveBeenCalledWith([
        "session=token",
      ]);

      expect(getSpendingReportMock).toHaveBeenCalledWith(userId);
    });

    it("should return 401 when authentication fails", async () => {
      getAuthenticatedUserIdMock.mockRejectedValue(new Error("UNAUTHORIZED"));

      const event = createEvent({
        routeKey: "GET /spending-report",
        cookies: ["session=invalid"],
      });

      const result = await handler(event);

      expect(result).toEqual({
        statusCode: 401,
        body: JSON.stringify({
          message: "Unauthorized",
        }),
      });

      expect(getSpendingReportMock).not.toHaveBeenCalled();
    });

    it("should return 500 when generating the report fails unexpectedly", async () => {
      const userId = "user-123";

      getAuthenticatedUserIdMock.mockResolvedValue(userId);
      getSpendingReportMock.mockRejectedValue(new Error("DynamoDB error"));

      const event = createEvent({
        routeKey: "GET /spending-report",
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

      expect(getSpendingReportMock).not.toHaveBeenCalled();
    });
  });
});
