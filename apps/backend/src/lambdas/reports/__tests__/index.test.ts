import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handler } from "../index";
import { mockedExpenses, augustReport } from "./mocks";

const { getAuthenticatedUserIdMock, getSpendingReportMock } = vi.hoisted(
  () => ({
    getAuthenticatedUserIdMock: vi.fn(),
    getSpendingReportMock: vi.fn(),
  })
);

vi.mock("../../auth/auth.helpers", () => ({
  getAuthenticatedUserId: getAuthenticatedUserIdMock,
}));

vi.mock("../reports.helper", () => ({
  getSpendingReport: getSpendingReportMock,
}));

const createEvent = ({
  routeKey,
  authorization,
}: {
  routeKey: string;
  authorization?: string;
}): APIGatewayProxyEventV2 =>
  ({
    routeKey,
    headers: authorization
      ? {
          authorization,
        }
      : {},
  } as unknown as APIGatewayProxyEventV2);

describe("reports lambda handler", () => {
  const userId = mockedExpenses[0].userId;

  beforeEach(() => {
    getAuthenticatedUserIdMock.mockReset();
    getSpendingReportMock.mockReset();

    getAuthenticatedUserIdMock.mockReturnValue(userId);
  });

  describe("authentication", () => {
    it("should return 401 when authentication fails", async () => {
      getAuthenticatedUserIdMock.mockImplementationOnce(() => {
        throw new Error("UNAUTHORIZED");
      });

      const response = await handler(
        createEvent({
          routeKey: "GET /spending-report",
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

      expect(getSpendingReportMock).not.toHaveBeenCalled();
    });
  });

  describe("GET /spending-report", () => {
    it("should return the spending report", async () => {
      const report = [augustReport];

      getSpendingReportMock.mockResolvedValueOnce(report);

      const response = await handler(
        createEvent({
          routeKey: "GET /spending-report",
          authorization: "Bearer valid-token",
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 200,
        body: JSON.stringify(report),
      });

      expect(getAuthenticatedUserIdMock).toHaveBeenCalledWith(
        "Bearer valid-token"
      );

      expect(getSpendingReportMock).toHaveBeenCalledWith(userId);
    });

    it("should return an empty report when there are no expenses", async () => {
      getSpendingReportMock.mockResolvedValueOnce([]);

      const response = await handler(
        createEvent({
          routeKey: "GET /spending-report",
          authorization: "Bearer valid-token",
        }),
        {} as never,
        () => undefined
      );

      expect(response).toEqual({
        statusCode: 200,
        body: JSON.stringify([]),
      });

      expect(getSpendingReportMock).toHaveBeenCalledWith(userId);
    });

    it("should return 500 when getSpendingReport fails unexpectedly", async () => {
      getSpendingReportMock.mockRejectedValueOnce(
        new Error("Unexpected error")
      );

      const response = await handler(
        createEvent({
          routeKey: "GET /spending-report",
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

      expect(getSpendingReportMock).toHaveBeenCalledWith(userId);
    });
  });

  describe("unknown routes", () => {
    it("should return 404", async () => {
      const response = await handler(
        createEvent({
          routeKey: "GET /spending-report/unknown",
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

      expect(getSpendingReportMock).not.toHaveBeenCalled();
    });
  });
});
