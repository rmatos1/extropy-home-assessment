import { vi } from "vitest";
import type { Category } from "@extropy/shared";
import type { ExpenseFormData } from "../../../../expenses.types";

export const formData: ExpenseFormData = {
  id: "expense-123",
  amount: "125.50",
  description: "Electricity bill",
  categoryId: "bills",
  date: "2026-08-30",
};

export const mockedCategories: Category[] = [
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

const onChangeDescription = vi.fn();
export const onClickSuggestedCategory = vi.fn();

export const mockedSuggestion = {
  categorySelectRef: { current: null },
  amountRef: { current: null },
  showSuggestion: false,
  suggestionTextButton: "",
  isSuggestingCategory: false,
  today: "2026-08-31",
  onChangeDescription,
  onClickSuggestedCategory,
};
