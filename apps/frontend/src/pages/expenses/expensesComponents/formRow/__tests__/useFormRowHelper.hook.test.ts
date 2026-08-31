import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { suggestExpenseCategory } from "../../../../../services";
import { useFormRowHelper } from "../useFormRowHelper.hook";

import { mockedCategories, mockedSuggestion } from "./mocks";

vi.mock("../../../../../services", () => ({
  suggestExpenseCategory: vi.fn(),
}));

const suggestExpenseCategoryMock = vi.mocked(suggestExpenseCategory);

describe("useFormRowHelper", () => {
  const changeDescription = (
    onChangeDescription: (event: React.ChangeEvent<HTMLInputElement>) => void,
    value: string
  ) => {
    act(() => {
      onChangeDescription({
        target: {
          value,
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });
  };

  const advanceSuggestion = async () => {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(700);
    });
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with the provided description and no suggestion", () => {
    const { result } = renderHook(() =>
      useFormRowHelper("Restaurant dinner", mockedCategories)
    );

    expect(result.current.showSuggestion).toBe(false);
    expect(result.current.suggestionTextButton).toBe("");
    expect(result.current.isSuggestingCategory).toBe(false);
  });

  it("should return today's date", () => {
    const { result } = renderHook(() =>
      useFormRowHelper("Lunch", mockedCategories)
    );

    const expectedToday = new Date().toISOString().split("T")[0];

    expect(result.current.today).toBe(expectedToday);
  });

  it("should not request a suggestion on mount", async () => {
    renderHook(() => useFormRowHelper("Restaurant dinner", mockedCategories));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(suggestExpenseCategoryMock).not.toHaveBeenCalled();
  });

  it("should request a suggestion 700ms after the description changes", async () => {
    suggestExpenseCategoryMock.mockResolvedValue({
      categoryId: "food",
      confidence: 0.95,
    });

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    changeDescription(result.current.onChangeDescription, "Restaurant dinner");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(699);
    });

    expect(suggestExpenseCategoryMock).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
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

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    changeDescription(result.current.onChangeDescription, "Restaurant dinner");

    await advanceSuggestion();

    expect(result.current.isSuggestingCategory).toBe(false);
    expect(result.current.showSuggestion).toBe(true);
    expect(result.current.suggestionTextButton).toBe("Use category Food");
  });

  it("should use the category id when the suggestion is not in the category list", async () => {
    suggestExpenseCategoryMock.mockResolvedValue({
      categoryId: "unknown-category",
      confidence: 0.8,
    });

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    changeDescription(result.current.onChangeDescription, "Unknown expense");

    await advanceSuggestion();

    expect(result.current.suggestionTextButton).toBe(
      "Use category unknown-category"
    );
  });

  it("should not show a suggestion when categoryId is null", async () => {
    suggestExpenseCategoryMock.mockResolvedValue({
      categoryId: null,
      confidence: 0.2,
    });

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    changeDescription(result.current.onChangeDescription, "Ambiguous expense");

    await advanceSuggestion();

    expect(result.current.showSuggestion).toBe(false);
    expect(result.current.suggestionTextButton).toBe("");
  });

  it("should show the loading state while waiting for the suggestion", async () => {
    let resolveRequest!: (value: typeof mockedSuggestion) => void;

    suggestExpenseCategoryMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        })
    );

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    changeDescription(result.current.onChangeDescription, "Restaurant dinner");

    await advanceSuggestion();

    expect(suggestExpenseCategoryMock).toHaveBeenCalledTimes(1);

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

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    changeDescription(result.current.onChangeDescription, "Restaurant dinner");

    await advanceSuggestion();

    expect(result.current.showSuggestion).toBe(true);

    changeDescription(result.current.onChangeDescription, "New description");

    expect(result.current.showSuggestion).toBe(false);
    expect(result.current.suggestionTextButton).toBe("");
  });

  it("should debounce description changes", async () => {
    suggestExpenseCategoryMock.mockResolvedValue({
      categoryId: "food",
      confidence: 0.95,
    });

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    changeDescription(result.current.onChangeDescription, "First description");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    changeDescription(
      result.current.onChangeDescription,
      "Updated description"
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(699);
    });

    expect(suggestExpenseCategoryMock).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(suggestExpenseCategoryMock).toHaveBeenCalledTimes(1);

    expect(suggestExpenseCategoryMock).toHaveBeenCalledWith(
      "Updated description"
    );
  });

  it("should not request the same description twice", async () => {
    suggestExpenseCategoryMock.mockResolvedValue({
      categoryId: "food",
      confidence: 0.95,
    });

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    changeDescription(result.current.onChangeDescription, "Restaurant dinner");

    await advanceSuggestion();

    expect(suggestExpenseCategoryMock).toHaveBeenCalledTimes(1);

    changeDescription(result.current.onChangeDescription, "Restaurant dinner");

    await advanceSuggestion();

    expect(suggestExpenseCategoryMock).toHaveBeenCalledTimes(1);
  });

  it("should clear the suggestion when the service fails", async () => {
    suggestExpenseCategoryMock.mockRejectedValue(new Error("OpenAI error"));

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    changeDescription(result.current.onChangeDescription, "Restaurant dinner");

    await advanceSuggestion();

    expect(result.current.isSuggestingCategory).toBe(false);
    expect(result.current.showSuggestion).toBe(false);
    expect(result.current.suggestionTextButton).toBe("");
  });

  it("should apply the suggested category and focus the amount input", async () => {
    suggestExpenseCategoryMock.mockResolvedValue({
      categoryId: "food",
      confidence: 0.95,
    });

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    const categorySelect = document.createElement("select");

    const option = document.createElement("option");
    option.value = "food";
    option.textContent = "Food";

    categorySelect.appendChild(option);

    const amountInput = document.createElement("input");

    result.current.categorySelectRef.current = categorySelect;
    result.current.amountRef.current = amountInput;

    const focusSpy = vi.spyOn(amountInput, "focus");

    changeDescription(result.current.onChangeDescription, "Restaurant dinner");

    await advanceSuggestion();

    expect(result.current.suggestionTextButton).toBe("Use category Food");

    act(() => {
      result.current.onClickSuggestedCategory();
    });

    expect(categorySelect.value).toBe("food");
    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(result.current.showSuggestion).toBe(false);
    expect(result.current.suggestionTextButton).toBe("");
  });

  it("should do nothing when there is no suggested category", () => {
    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

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

  it("should use the category id when categories are empty", async () => {
    suggestExpenseCategoryMock.mockResolvedValue({
      categoryId: "food",
      confidence: 0.95,
    });

    const { result } = renderHook(() => useFormRowHelper("", []));

    changeDescription(result.current.onChangeDescription, "Restaurant dinner");

    await advanceSuggestion();

    expect(result.current.suggestionTextButton).toBe("Use category food");
  });
});
