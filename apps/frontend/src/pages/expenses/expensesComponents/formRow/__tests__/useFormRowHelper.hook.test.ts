import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SuggestCategoryResponse } from "@extropy/shared";

import { suggestExpenseCategory } from "../../../../../services";
import { useFormRowHelper } from "../useFormRowHelper.hook";

import { mockedCategories, mockedSuggestion } from "./mocks";

vi.mock("../../../../../services", () => ({
  suggestExpenseCategory: vi.fn(),
}));

const suggestExpenseCategoryMock = vi.mocked(suggestExpenseCategory);

const changeDescription = (
  onChange: ReturnType<typeof useFormRowHelper>["onChangeDescription"],
  value: string
) => {
  act(() => {
    onChange({
      target: { value },
    } as React.ChangeEvent<HTMLInputElement>);
  });
};

const advanceSuggestion = async () => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(700);
  });
};

describe("useFormRowHelper", () => {
  beforeEach(() => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date("2026-08-31T12:00:00.000Z"));

    suggestExpenseCategoryMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return the initial state", () => {
    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    expect(result.current.showSuggestion).toBe(false);
    expect(result.current.suggestionTextButton).toBe("");
    expect(result.current.isSuggestingCategory).toBe(false);
    expect(result.current.today).toBe("2026-08-31");
    expect(result.current.categorySelectRef.current).toBeNull();
    expect(result.current.amountRef.current).toBeNull();
  });

  it("should use the default description without requesting a category", async () => {
    renderHook(() => useFormRowHelper("Restaurant dinner", mockedCategories));

    await advanceSuggestion();

    expect(suggestExpenseCategoryMock).not.toHaveBeenCalled();
  });

  it("should not suggest a category when the description has 3 or fewer characters", async () => {
    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    changeDescription(result.current.onChangeDescription, "Bus");

    await advanceSuggestion();

    expect(suggestExpenseCategoryMock).not.toHaveBeenCalled();
    expect(result.current.isSuggestingCategory).toBe(false);
    expect(result.current.showSuggestion).toBe(false);
  });

  it("should wait 700ms before requesting a category suggestion", async () => {
    suggestExpenseCategoryMock.mockResolvedValue(mockedSuggestion);

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    changeDescription(result.current.onChangeDescription, "Restaurant dinner");

    act(() => {
      vi.advanceTimersByTime(699);
    });

    expect(suggestExpenseCategoryMock).not.toHaveBeenCalled();

    await advanceSuggestion();

    expect(suggestExpenseCategoryMock).toHaveBeenCalledTimes(1);
    expect(suggestExpenseCategoryMock).toHaveBeenCalledWith(
      "Restaurant dinner"
    );
  });

  it("should apply the suggested category and show the suggestion button", async () => {
    suggestExpenseCategoryMock.mockResolvedValue(mockedSuggestion);

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    changeDescription(result.current.onChangeDescription, "Restaurant dinner");

    await advanceSuggestion();

    expect(result.current.isSuggestingCategory).toBe(false);
    expect(result.current.showSuggestion).toBe(true);
    expect(result.current.suggestionTextButton).toBe("Use category Food");
  });

  it("should show the loading state while waiting for the suggestion", async () => {
    let resolveRequest!: (value: SuggestCategoryResponse) => void;

    suggestExpenseCategoryMock.mockImplementation(
      () =>
        new Promise<SuggestCategoryResponse>((resolve) => {
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
      resolveRequest(mockedSuggestion);
    });

    expect(result.current.isSuggestingCategory).toBe(false);
    expect(result.current.showSuggestion).toBe(true);
    expect(result.current.suggestionTextButton).toBe("Use category Food");
  });

  it("should use the category id when the suggested category is not found", async () => {
    suggestExpenseCategoryMock.mockResolvedValue({
      categoryId: "unknown-category",
      confidence: 0.9,
    });

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    changeDescription(result.current.onChangeDescription, "Something unusual");

    await advanceSuggestion();

    expect(result.current.showSuggestion).toBe(true);
    expect(result.current.suggestionTextButton).toBe(
      "Use category unknown-category"
    );
  });

  it("should not show a suggestion when the response has no category id", async () => {
    suggestExpenseCategoryMock.mockResolvedValue({
      categoryId: null,
      confidence: 0.2,
    });

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    changeDescription(result.current.onChangeDescription, "Something unusual");

    await advanceSuggestion();

    expect(result.current.isSuggestingCategory).toBe(false);
    expect(result.current.showSuggestion).toBe(false);
    expect(result.current.suggestionTextButton).toBe("");
  });

  it("should clear the suggestion when the description changes", async () => {
    suggestExpenseCategoryMock.mockResolvedValue(mockedSuggestion);

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    changeDescription(result.current.onChangeDescription, "Restaurant dinner");

    await advanceSuggestion();

    expect(result.current.showSuggestion).toBe(true);
    expect(result.current.suggestionTextButton).toBe("Use category Food");

    changeDescription(result.current.onChangeDescription, "Bus ticket");

    expect(result.current.showSuggestion).toBe(false);
    expect(result.current.suggestionTextButton).toBe("");
  });

  it("should not request another suggestion for the same description", async () => {
    suggestExpenseCategoryMock.mockResolvedValue(mockedSuggestion);

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    changeDescription(result.current.onChangeDescription, "Restaurant dinner");

    await advanceSuggestion();

    expect(suggestExpenseCategoryMock).toHaveBeenCalledTimes(1);

    changeDescription(result.current.onChangeDescription, "Restaurant dinner");

    await advanceSuggestion();

    expect(suggestExpenseCategoryMock).toHaveBeenCalledTimes(1);
  });

  it("should trim the description before requesting a suggestion", async () => {
    suggestExpenseCategoryMock.mockResolvedValue(mockedSuggestion);

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    changeDescription(
      result.current.onChangeDescription,
      "   Restaurant dinner   "
    );

    await advanceSuggestion();

    expect(suggestExpenseCategoryMock).toHaveBeenCalledWith(
      "Restaurant dinner"
    );
  });

  it("should clear the suggestion when the category suggestion fails", async () => {
    suggestExpenseCategoryMock.mockRejectedValue(
      new Error("Unable to suggest category")
    );

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    changeDescription(result.current.onChangeDescription, "Restaurant dinner");

    await advanceSuggestion();

    expect(result.current.isSuggestingCategory).toBe(false);
    expect(result.current.showSuggestion).toBe(false);
    expect(result.current.suggestionTextButton).toBe("");
  });

  it("should apply the suggested category and focus the amount input", async () => {
    suggestExpenseCategoryMock.mockResolvedValue(mockedSuggestion);

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    const categorySelect = document.createElement("select");

    const foodOption = document.createElement("option");
    foodOption.value = "food";
    foodOption.textContent = "Food";

    categorySelect.appendChild(foodOption);

    const amountInput = document.createElement("input");

    const focusSpy = vi.spyOn(amountInput, "focus");

    result.current.categorySelectRef.current = categorySelect;
    result.current.amountRef.current = amountInput;

    changeDescription(result.current.onChangeDescription, "Restaurant dinner");

    await advanceSuggestion();

    expect(result.current.showSuggestion).toBe(true);

    act(() => {
      result.current.onClickSuggestedCategory();
    });

    expect(categorySelect.value).toBe("food");
    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(result.current.showSuggestion).toBe(false);
    expect(result.current.suggestionTextButton).toBe("");
  });

  it("should do nothing when clicking the suggested category without a suggestion", () => {
    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    const categorySelect = document.createElement("select");
    const amountInput = document.createElement("input");

    const focusSpy = vi.spyOn(amountInput, "focus");

    result.current.categorySelectRef.current = categorySelect;
    result.current.amountRef.current = amountInput;

    act(() => {
      result.current.onClickSuggestedCategory();
    });

    expect(categorySelect.value).toBe("");
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it("should cancel the pending suggestion request when the description changes", async () => {
    suggestExpenseCategoryMock.mockResolvedValue(mockedSuggestion);

    const { result } = renderHook(() => useFormRowHelper("", mockedCategories));

    changeDescription(result.current.onChangeDescription, "Restaurant dinner");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    changeDescription(result.current.onChangeDescription, "Bus ticket");

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(suggestExpenseCategoryMock).not.toHaveBeenCalled();

    await advanceSuggestion();

    expect(suggestExpenseCategoryMock).toHaveBeenCalledTimes(1);
    expect(suggestExpenseCategoryMock).toHaveBeenCalledWith("Bus ticket");
  });
});
