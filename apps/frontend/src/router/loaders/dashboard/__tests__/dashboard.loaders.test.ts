import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getSpendingReport,
  getExpenses,
  getCategories,
} from "../../../../services";

import { overviewLoader, expensesLoader, categoriesLoader } from "../";

import {
  mockedCategories,
  mockedExpenses,
  mockedReport,
  emptySummary,
} from "./mocks";

vi.mock("../../../../services", () => ({
  getSpendingReport: vi.fn(),
  getExpenses: vi.fn(),
  getCategories: vi.fn(),
}));

const getSpendingReportMock = vi.mocked(getSpendingReport);
const getExpensesMock = vi.mocked(getExpenses);
const getCategoriesMock = vi.mocked(getCategories);

describe("dashboard.loaders", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("overviewLoader", () => {
    it("should load categories and spending report", async () => {
      getCategoriesMock.mockResolvedValue(mockedCategories);
      getSpendingReportMock.mockResolvedValue(mockedReport);

      const result = await overviewLoader();

      expect(getCategoriesMock).toHaveBeenCalledTimes(1);
      expect(getSpendingReportMock).toHaveBeenCalledTimes(1);

      expect(result).toEqual([mockedCategories, mockedReport]);
    });

    it("should execute both requests in parallel", async () => {
      let resolveCategories!: (value: unknown) => void;
      let resolveReport!: (value: unknown) => void;

      const categoriesPromise = new Promise((resolve) => {
        resolveCategories = resolve;
      });

      const reportPromise = new Promise((resolve) => {
        resolveReport = resolve;
      });

      getCategoriesMock.mockReturnValue(categoriesPromise as never);

      getSpendingReportMock.mockReturnValue(reportPromise as never);

      const loaderPromise = overviewLoader();

      expect(getCategoriesMock).toHaveBeenCalledTimes(1);
      expect(getSpendingReportMock).toHaveBeenCalledTimes(1);

      resolveCategories([]);
      resolveReport(emptySummary);

      await expect(loaderPromise).resolves.toEqual([[], emptySummary]);
    });

    it("should propagate an error from getCategories", async () => {
      const error = new Error("Categories error");

      getCategoriesMock.mockRejectedValue(error);
      getSpendingReportMock.mockResolvedValue(emptySummary);

      await expect(overviewLoader()).rejects.toBe(error);
    });

    it("should propagate an error from getSpendingReport", async () => {
      const error = new Error("Report error");

      getCategoriesMock.mockResolvedValue([]);
      getSpendingReportMock.mockRejectedValue(error);

      await expect(overviewLoader()).rejects.toBe(error);
    });
  });

  describe("expensesLoader", () => {
    it("should load categories and expenses without filters", async () => {
      getCategoriesMock.mockResolvedValue(mockedCategories);
      getExpensesMock.mockResolvedValue(mockedExpenses);

      const request = new Request("http://localhost/expenses");

      const result = await expensesLoader({
        request,
      } as never);

      expect(getCategoriesMock).toHaveBeenCalledTimes(1);

      expect(getExpensesMock).toHaveBeenCalledTimes(1);
      expect(getExpensesMock).toHaveBeenCalledWith({
        startDate: undefined,
        endDate: undefined,
        categoryId: undefined,
      });

      expect(result).toEqual({
        categories: mockedCategories,
        expenses: mockedExpenses,
      });
    });

    it("should pass all query parameters to getExpenses", async () => {
      getCategoriesMock.mockResolvedValue([]);
      getExpensesMock.mockResolvedValue([]);

      const request = new Request(
        "http://localhost/expenses?startDate=2026-08-01&endDate=2026-08-31&categoryId=food"
      );

      const result = await expensesLoader({
        request,
      } as never);

      expect(getExpensesMock).toHaveBeenCalledWith({
        startDate: "2026-08-01",
        endDate: "2026-08-31",
        categoryId: "food",
      });

      expect(result).toEqual({
        categories: [],
        expenses: [],
      });
    });

    it("should pass only the provided startDate", async () => {
      getCategoriesMock.mockResolvedValue([]);
      getExpensesMock.mockResolvedValue([]);

      const request = new Request(
        "http://localhost/expenses?startDate=2026-08-01"
      );

      await expensesLoader({
        request,
      } as never);

      expect(getExpensesMock).toHaveBeenCalledWith({
        startDate: "2026-08-01",
        endDate: undefined,
        categoryId: undefined,
      });
    });

    it("should pass only the provided endDate", async () => {
      getCategoriesMock.mockResolvedValue([]);
      getExpensesMock.mockResolvedValue([]);

      const request = new Request(
        "http://localhost/expenses?endDate=2026-08-31"
      );

      await expensesLoader({
        request,
      } as never);

      expect(getExpensesMock).toHaveBeenCalledWith({
        startDate: undefined,
        endDate: "2026-08-31",
        categoryId: undefined,
      });
    });

    it("should pass only the provided categoryId", async () => {
      getCategoriesMock.mockResolvedValue([]);
      getExpensesMock.mockResolvedValue([]);

      const request = new Request(
        "http://localhost/expenses?categoryId=transport"
      );

      await expensesLoader({
        request,
      } as never);

      expect(getExpensesMock).toHaveBeenCalledWith({
        startDate: undefined,
        endDate: undefined,
        categoryId: "transport",
      });
    });

    it("should preserve empty query parameters as empty strings", async () => {
      getCategoriesMock.mockResolvedValue([]);
      getExpensesMock.mockResolvedValue([]);

      const request = new Request(
        "http://localhost/expenses?startDate=&endDate=&categoryId="
      );

      await expensesLoader({
        request,
      } as never);

      expect(getExpensesMock).toHaveBeenCalledWith({
        startDate: "",
        endDate: "",
        categoryId: "",
      });
    });

    it("should return categories and expenses", async () => {
      getCategoriesMock.mockResolvedValue(mockedCategories);
      getExpensesMock.mockResolvedValue(mockedExpenses);

      const result = await expensesLoader({
        request: new Request("http://localhost/expenses"),
      } as never);

      expect(result).toEqual({
        categories: mockedCategories,
        expenses: mockedExpenses,
      });
    });

    it("should propagate an error from getCategories", async () => {
      const error = new Error("Unable to load categories");

      getCategoriesMock.mockRejectedValue(error);
      getExpensesMock.mockResolvedValue([]);

      await expect(
        expensesLoader({
          request: new Request("http://localhost/expenses"),
        } as never)
      ).rejects.toBe(error);
    });

    it("should propagate an error from getExpenses", async () => {
      const error = new Error("Unable to load expenses");

      getCategoriesMock.mockResolvedValue([]);
      getExpensesMock.mockRejectedValue(error);

      await expect(
        expensesLoader({
          request: new Request("http://localhost/expenses"),
        } as never)
      ).rejects.toBe(error);
    });

    it("should call getCategories and getExpenses once", async () => {
      getCategoriesMock.mockResolvedValue([]);
      getExpensesMock.mockResolvedValue([]);

      await expensesLoader({
        request: new Request("http://localhost/expenses"),
      } as never);

      expect(getCategoriesMock).toHaveBeenCalledTimes(1);
      expect(getExpensesMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("categoriesLoader", () => {
    it("should return categories", async () => {
      getCategoriesMock.mockResolvedValue(mockedCategories);

      const result = await categoriesLoader();

      expect(getCategoriesMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockedCategories);
    });

    it("should call getCategories without arguments", async () => {
      getCategoriesMock.mockResolvedValue([]);

      await categoriesLoader();

      expect(getCategoriesMock).toHaveBeenCalledWith();
    });

    it("should propagate errors from getCategories", async () => {
      const error = new Error("Unable to load categories");

      getCategoriesMock.mockRejectedValue(error);

      await expect(categoriesLoader()).rejects.toBe(error);
    });
  });
});
