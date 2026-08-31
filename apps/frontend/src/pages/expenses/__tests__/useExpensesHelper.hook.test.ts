import { act, renderHook } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import toast from "react-hot-toast";

import type { ExpenseResponse } from "@extropy/shared";

import { useExpensesHelper } from "../useExpensesHelper.hook";
import { initialExpenseData, getColumns } from "../expenses.constants";
import {
  mockedCategories as categories,
  mockedExpenses as expenses,
} from "./mocks";

const useFetcherMock = vi.fn();
const useLoaderDataMock = vi.fn();
const useNavigationMock = vi.fn();

const submitMock = vi.fn();

vi.mock("react-router", () => ({
  useFetcher: () => useFetcherMock(),
  useLoaderData: () => useLoaderDataMock(),
  useNavigation: () => useNavigationMock(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("../expenses.constants", async () => {
  const actual = await vi.importActual<typeof import("../expenses.constants")>(
    "../expenses.constants"
  );

  return {
    ...actual,
    getColumns: vi.fn(),
  };
});

const toastErrorMock = vi.mocked(toast.error);
const toastSuccessMock = vi.mocked(toast.success);
const getColumnsMock = vi.mocked(getColumns);

describe("useExpensesHelper", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    useFetcherMock.mockReturnValue({
      state: "idle",
      data: undefined,
      submit: submitMock,
    });

    useLoaderDataMock.mockReturnValue({
      categories,
      expenses,
    });

    useNavigationMock.mockReturnValue({
      state: "idle",
      location: undefined,
    });

    getColumnsMock.mockReturnValue([
      {
        accessorKey: "date",
        header: "Date",
      },
    ] as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useExpensesHelper());

      expect(result.current.isAdding).toBe(false);
      expect(result.current.isEditing).toBe(false);
      expect(result.current.showDeleteModal).toBe(false);
      expect(result.current.selectedExpenseId).toBe(null);
      expect(result.current.expenseFormData).toEqual(initialExpenseData);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it("should return expenses and categories from loader data", () => {
      const { result } = renderHook(() => useExpensesHelper());

      expect(result.current.expenses).toEqual(expenses);
      expect(result.current.categories).toEqual(categories);
    });
  });

  describe("loading and processing", () => {
    it("should set isProcessing when the fetcher is submitting", () => {
      useFetcherMock.mockReturnValue({
        state: "submitting",
        data: undefined,
        submit: submitMock,
      });

      const { result } = renderHook(() => useExpensesHelper());

      expect(result.current.isProcessing).toBe(true);
    });

    it("should set isLoading when navigating to expenses", () => {
      useNavigationMock.mockReturnValue({
        state: "loading",
        location: {
          pathname: "/expenses",
        },
      });

      const { result } = renderHook(() => useExpensesHelper());

      expect(result.current.isLoading).toBe(true);
    });

    it("should not set isLoading when navigating to another route", () => {
      useNavigationMock.mockReturnValue({
        state: "loading",
        location: {
          pathname: "/categories",
        },
      });

      const { result } = renderHook(() => useExpensesHelper());

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("columns", () => {
    it("should create columns using the category map", () => {
      const columns = [
        {
          accessorKey: "date",
          header: "Date",
        },
      ];

      getColumnsMock.mockReturnValue(columns as never);

      const { result } = renderHook(() => useExpensesHelper());

      expect(getColumnsMock).toHaveBeenCalledTimes(1);

      const categoryMap = getColumnsMock.mock.calls[0][0];

      expect(categoryMap).toBeInstanceOf(Map);
      expect(categoryMap.get("food")).toBe("Food");
      expect(categoryMap.get("transport")).toBe("Transport");
      expect(categoryMap.get("bills")).toBe("Bills");

      expect(result.current.columns).toBe(columns);
    });
  });

  describe("add expense", () => {
    it("should start the add form", () => {
      const { result } = renderHook(() => useExpensesHelper());

      act(() => {
        result.current.onClickAddExpense();
      });

      expect(result.current.isAdding).toBe(true);
      expect(result.current.expenseFormData).toEqual(initialExpenseData);
    });
  });

  describe("edit expense", () => {
    it("should populate the form when editing an expense", () => {
      const { result } = renderHook(() => useExpensesHelper());

      act(() => {
        result.current.onClickEditExpense(expenses[0]);
      });

      expect(result.current.isEditing).toBe(true);
      expect(result.current.isAdding).toBe(false);
      expect(result.current.selectedExpenseId).toBe("expense-1");

      expect(result.current.expenseFormData).toEqual({
        date: "2026-08-20",
        description: "Lunch",
        categoryId: "food",
        amount: "100.00",
      });
    });

    it("should format the amount with two decimal places when editing", () => {
      const expense: ExpenseResponse = {
        ...expenses[1],
        amount: 50.5,
      };

      const { result } = renderHook(() => useExpensesHelper());

      act(() => {
        result.current.onClickEditExpense(expense);
      });

      expect(result.current.expenseFormData.amount).toBe("50.50");
    });
  });

  describe("cancel expense form", () => {
    it("should cancel an add form", () => {
      const { result } = renderHook(() => useExpensesHelper());

      act(() => {
        result.current.onClickAddExpense();
      });

      expect(result.current.isAdding).toBe(true);

      act(() => {
        result.current.onCancelExpenseForm();
      });

      expect(result.current.isAdding).toBe(false);
      expect(result.current.expenseFormData).toEqual(initialExpenseData);
    });

    it("should cancel an edit form", () => {
      const { result } = renderHook(() => useExpensesHelper());

      act(() => {
        result.current.onClickEditExpense(expenses[0]);
      });

      act(() => {
        result.current.onCancelExpenseForm();
      });

      expect(result.current.isEditing).toBe(false);
      expect(result.current.selectedExpenseId).toBe(null);
      expect(result.current.expenseFormData).toEqual(initialExpenseData);
    });
  });

  describe("delete modal", () => {
    it("should open the delete modal for an expense", () => {
      const { result } = renderHook(() => useExpensesHelper());

      act(() => {
        result.current.onClickDeleteExpense(expenses[1]);
      });

      expect(result.current.showDeleteModal).toBe(true);
      expect(result.current.selectedExpenseId).toBe("expense-2");
      expect(result.current.isEditing).toBe(false);
    });

    it("should return the selected expense description", () => {
      const { result } = renderHook(() => useExpensesHelper());

      act(() => {
        result.current.onClickDeleteExpense(expenses[1]);
      });

      expect(result.current.deleteExpenseDescription).toBe("Uber");
    });

    it("should close the delete modal", () => {
      const { result } = renderHook(() => useExpensesHelper());

      act(() => {
        result.current.onClickDeleteExpense(expenses[0]);
      });

      act(() => {
        result.current.onCloseModal();
      });

      expect(result.current.showDeleteModal).toBe(false);
      expect(result.current.selectedExpenseId).toBe(null);
      expect(result.current.deleteExpenseDescription).toBe("");
    });
  });

  describe("confirm delete", () => {
    it("should not submit when there is no selected expense", () => {
      const { result } = renderHook(() => useExpensesHelper());

      act(() => {
        result.current.onConfirmDelete();
      });

      expect(submitMock).not.toHaveBeenCalled();
    });

    it("should submit the delete operation", () => {
      const { result } = renderHook(() => useExpensesHelper());

      act(() => {
        result.current.onClickDeleteExpense(expenses[0]);
      });

      act(() => {
        result.current.onConfirmDelete();
      });

      expect(submitMock).toHaveBeenCalledTimes(1);

      expect(submitMock).toHaveBeenCalledWith(
        {
          intent: "delete",
          expenseId: "expense-1",
        },
        {
          method: "post",
          action: "/expenses",
        }
      );
    });
  });

  describe("fetcher feedback", () => {
    it("should show an error toast when fetcher returns an error", () => {
      useFetcherMock.mockReturnValue({
        state: "idle",
        data: {
          error: "Unable to save expense",
        },
        submit: submitMock,
      });

      renderHook(() => useExpensesHelper());

      expect(toastErrorMock).toHaveBeenCalledTimes(1);
      expect(toastErrorMock).toHaveBeenCalledWith("Unable to save expense");
      expect(toastSuccessMock).not.toHaveBeenCalled();
    });

    it("should show a success toast when fetcher returns success", () => {
      useFetcherMock.mockReturnValue({
        state: "idle",
        data: {
          success: true,
          message: "Expense saved successfully",
        },
        submit: submitMock,
      });

      renderHook(() => useExpensesHelper());

      expect(toastSuccessMock).toHaveBeenCalledTimes(1);
      expect(toastSuccessMock).toHaveBeenCalledWith(
        "Expense saved successfully"
      );
    });

    it("should prioritize error over success", () => {
      useFetcherMock.mockReturnValue({
        state: "idle",
        data: {
          error: "Something went wrong",
          success: true,
          message: "Expense saved successfully",
        },
        submit: submitMock,
      });

      renderHook(() => useExpensesHelper());

      expect(toastErrorMock).toHaveBeenCalledWith("Something went wrong");

      expect(toastSuccessMock).not.toHaveBeenCalled();
    });

    it("should stop editing after an update operation", () => {
      useFetcherMock.mockReturnValue({
        state: "idle",
        data: {
          operation: "update",
        },
        submit: submitMock,
      });

      const { result } = renderHook(() => useExpensesHelper());

      act(() => {
        result.current.onClickEditExpense(expenses[0]);
      });

      expect(result.current.isEditing).toBe(true);

      useFetcherMock.mockReturnValue({
        state: "idle",
        data: {
          operation: "update",
        },
        submit: submitMock,
      });

      // Force a render so the effect receives the fetcher data.
      act(() => {
        result.current.onCancelExpenseForm();
      });

      expect(result.current.isEditing).toBe(false);
    });

    it("should close the delete modal after a delete operation", () => {
      useFetcherMock.mockReturnValue({
        state: "idle",
        data: undefined,
        submit: submitMock,
      });

      const { result, rerender } = renderHook(() => useExpensesHelper());

      act(() => {
        result.current.onClickDeleteExpense(expenses[0]);
      });

      expect(result.current.showDeleteModal).toBe(true);
      expect(result.current.selectedExpenseId).toBe("expense-1");

      useFetcherMock.mockReturnValue({
        state: "idle",
        data: {
          operation: "delete",
        },
        submit: submitMock,
      });

      rerender();

      expect(result.current.showDeleteModal).toBe(false);
      expect(result.current.selectedExpenseId).toBe(null);
    });
  });
});
