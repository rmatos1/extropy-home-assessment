import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSpendingReport } from "../";

const { apiMock } = vi.hoisted(() => ({
  apiMock: vi.fn(),
}));

vi.mock("../../api", () => ({
  api: apiMock,
}));

describe("reports services", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("getSpendingReport", () => {
    it("should request the spending report using GET", async () => {
      const report = {
        totalThisMonth: 500,
        totalThisYear: 5000,
        monthlySpending: [
          {
            month: "2026-08",
            amount: 500,
          },
        ],
        spendingByCategory: [
          {
            categoryId: "food",
            categoryName: "Food",
            amount: 500,
          },
        ],
        recentExpenses: [],
      };

      apiMock.mockResolvedValue(report);

      const result = await getSpendingReport();

      expect(apiMock).toHaveBeenCalledTimes(1);
      expect(apiMock).toHaveBeenCalledWith("/spending-report", {
        method: "GET",
      });

      expect(result).toBe(report);
    });

    it("should return the API response", async () => {
      const report = {
        totalThisMonth: 1250.5,
        totalThisYear: 9800,
        monthlySpending: [],
        spendingByCategory: [],
        recentExpenses: [],
      };

      apiMock.mockResolvedValue(report);

      const result = await getSpendingReport();

      expect(result).toEqual(report);
    });

    it("should propagate API errors", async () => {
      const error = new Error("Unable to load spending report");

      apiMock.mockRejectedValue(error);

      await expect(getSpendingReport()).rejects.toBe(error);
    });
  });
});
