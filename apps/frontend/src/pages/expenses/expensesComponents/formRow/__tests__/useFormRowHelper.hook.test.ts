import { act, renderHook } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import type { Category } from "@extropy/shared";

import { suggestExpenseCategory } from "../../../../../services";
import { useFormRowHelper } from "../useFormRowHelper.hook";

vi.mock("../../../../../services", () => ({
  suggestExpenseCategory: vi.fn(),
}));

const suggestExpenseCategoryMock = vi.mocked(suggestExpenseCategory);

const flushSuggestion = async () => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(700);
  });
};

describe("useFormRowHelper", () => {
  const categories: Category[] = [
    {
      id: "food",
      name: "Food",
    },
    {
      id: "transport",
      name: "Transport",
    },
    {
      id: "bills",
      name: "Bills",
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize without a suggestion", () => {
    const { result } = renderHook(() => useFormRowHelper("Lunch", categories));

    expect(result.current.suggestionTextButton).toBe("");
    expect(result.current.showSuggestion).toBe(false);
    expect(result.current.isSuggestingCategory).toBe(false);
  });

  it("should return today's date", () => {
    const expectedToday = new Date().toISOString().split("T")[0];

    const { result } = renderHook(() => useFormRowHelper("Lunch", categories));

    expect(result.current.today).toBe(expectedToday);
  });

  it("should not request a suggestion when the description has 3 or fewer characters", async () => {
    renderHook(() => useFormRowHelper("foo", categories));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(suggestExpenseCategoryMock).not.toHaveBeenCalled();
  });

  it("should not request a suggestion for an empty description", async () => {
    renderHook(() => useFormRowHelper("", categories));

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    expect(suggestExpenseCategoryMock).not.toHaveBeenCalled();
  });

  it("should request a category suggestion after 700ms", async () => {
    suggestExpenseCategoryMock.mockResolvedValue({
      categoryId: "food",
      confidence: 0.95,
    });

    renderHook(() => useFormRowHelper("Restaurant dinner", categories));

    expect(suggestExpenseCategoryMock).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(699);
    });

    expect(suggestExpenseCategoryMock).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(suggestExpenseCategoryMock).toHaveBeenCalledTimes(1);

    expect(suggestExpenseCategoryMock).toHaveBeenCalledWith(
      "Restaurant dinner"
    );
  });

  it("should show the category suggestion after a successful response", async () => {
    suggestExpenseCategoryMock.mockResolvedValue({
      categoryId: "food",
      confidence: 0.95,
    });

    const { result } = renderHook(() =>
      useFormRowHelper("Restaurant dinner", categories)
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(700);
    });

    expect(result.current.isSuggestingCategory).toBe(false);
    expect(result.current.showSuggestion).toBe(true);
    expect(result.current.suggestionTextButton).toBe("Use ccategory Food");
  });

  it("should use the category id when the suggested category is not in the list", async () => {
    suggestExpenseCategoryMock.mockResolvedValue({
      categoryId: "unknown-category",
      confidence: 0.8,
    });

    const { result } = renderHook(() =>
      useFormRowHelper("Unknown expense", categories)
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(700);
    });

    expect(result.current.suggestionTextButton).toBe(
      "Use ccategory unknown-category"
    );
  });

  it("should not render a suggestion button when categoryId is null", async () => {
    suggestExpenseCategoryMock.mockResolvedValue({
      categoryId: null,
      confidence: 0.2,
    });

    const { result } = renderHook(() =>
      useFormRowHelper("Ambiguous expense", categories)
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(700);
    });

    expect(result.current.suggestionTextButton).toBe("");
    expect(result.current.showSuggestion).toBe(false);
  });

  it("should set the loading state while requesting a suggestion", async () => {
    let resolveRequest!: (value: {
      categoryId: string | null;
      confidence: number;
    }) => void;

    suggestExpenseCategoryMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );

    const { result } = renderHook(() =>
      useFormRowHelper("Restaurant dinner", categories)
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(700);
    });

    expect(result.current.isSuggestingCategory).toBe(true);
    expect(result.current.showSuggestion).toBe(true);

    await act(async () => {
      resolveRequest({
        categoryId: "food",
        confidence: 0.95,
      });
    });

    expect(result.current.isSuggestingCategory).toBe(false);
    expect(result.current.showSuggestion).toBe(true);
  });

  it("should clear the suggestion when the description changes", async () => {
    suggestExpenseCategoryMock.mockResolvedValue({
      categoryId: "food",
      confidence: 0.95,
    });

    const { result } = renderHook(() =>
      useFormRowHelper("Restaurant dinner", categories)
    );

    await flushSuggestion();

    expect(result.current.suggestionTextButton).toBe("Use ccategory Food");

    act(() => {
      result.current.onChangeDescription({
        target: {
          value: "New description",
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.suggestionTextButton).toBe("");
    expect(result.current.showSuggestion).toBe(false);
  });

  it("should debounce description changes", async () => {
    suggestExpenseCategoryMock.mockResolvedValue({
      categoryId: "food",
      confidence: 0.95,
    });

    const { result } = renderHook(() =>
      useFormRowHelper("Original description", categories)
    );

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    act(() => {
      result.current.onChangeDescription({
        target: {
          value: "Updated description",
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      vi.advanceTimersByTime(699);
    });

    expect(suggestExpenseCategoryMock).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(suggestExpenseCategoryMock).toHaveBeenCalledTimes(1);

    expect(suggestExpenseCategoryMock).toHaveBeenCalledWith(
      "Updated description"
    );
  });

  it("should not request a suggestion again for the same description", async () => {
    suggestExpenseCategoryMock.mockResolvedValue({
      categoryId: "food",
      confidence: 0.95,
    });

    const { result } = renderHook(() =>
      useFormRowHelper("Restaurant dinner", categories)
    );

    await flushSuggestion();

    expect(suggestExpenseCategoryMock).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.onChangeDescription({
        target: {
          value: "Restaurant dinner",
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await flushSuggestion();

    expect(suggestExpenseCategoryMock).toHaveBeenCalledTimes(1);
  });

  it("should clear the suggestion when the service fails", async () => {
    suggestExpenseCategoryMock.mockRejectedValue(new Error("OpenAI error"));

    const { result } = renderHook(() =>
      useFormRowHelper("Restaurant dinner", categories)
    );

    await flushSuggestion();

    expect(result.current.isSuggestingCategory).toBe(false);
    expect(result.current.suggestionTextButton).toBe("");
    expect(result.current.showSuggestion).toBe(false);
  });

  it("should set the selected category when applying a suggestion", async () => {
    suggestExpenseCategoryMock.mockResolvedValue({
      categoryId: "food",
      confidence: 0.95,
    });

    const { result } = renderHook(() =>
      useFormRowHelper("Restaurant dinner", categories)
    );

    const categorySelect = document.createElement("select");

    const option = document.createElement("option");
    option.value = "food";
    option.textContent = "Food";

    categorySelect.appendChild(option);

    const amountInput = document.createElement("input");

    result.current.categorySelectRef.current = categorySelect;
    result.current.amountRef.current = amountInput;

    const focusSpy = vi.spyOn(amountInput, "focus");

    await flushSuggestion();

    expect(result.current.suggestionTextButton).toBe("Use ccategory Food");

    act(() => {
      result.current.onClickSuggestedCategory();
    });

    expect(categorySelect.value).toBe("food");
    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(result.current.showSuggestion).toBe(false);
    expect(result.current.suggestionTextButton).toBe("");
  });

  it("should do nothing when there is no suggested category", () => {
    const { result } = renderHook(() =>
      useFormRowHelper("Restaurant dinner", categories)
    );

    const categorySelect = document.createElement("select");
    const amountInput = document.createElement("input");

    result.current.categorySelectRef.current = categorySelect;
    result.current.amountRef.current = amountInput;

    const focusSpy = vi.spyOn(amountInput, "focus");

    act(() => {
      result.current.onClickSuggestedCategory();
    });

    expect(categorySelect.value).toBe("");
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it("should clear the suggestion after applying it", async () => {
    suggestExpenseCategoryMock.mockResolvedValue({
      categoryId: "transport",
      confidence: 0.9,
    });

    const { result } = renderHook(() =>
      useFormRowHelper("Uber ride", categories)
    );

    const categorySelect = document.createElement("select");

    const option = document.createElement("option");
    option.value = "transport";
    option.textContent = "Transport";

    categorySelect.appendChild(option);

    const amountInput = document.createElement("input");

    result.current.categorySelectRef.current = categorySelect;
    result.current.amountRef.current = amountInput;

    await flushSuggestion();

    expect(result.current.suggestionTextButton).toBe("Use ccategory Transport");

    act(() => {
      result.current.onClickSuggestedCategory();
    });

    expect(result.current.showSuggestion).toBe(false);
    expect(result.current.suggestionTextButton).toBe("");
  });
});
