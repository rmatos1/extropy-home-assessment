import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Category, Expense } from "@extropy/shared";

import { FormRow } from "../";
import { useFormRowHelper } from "../useFormRowHelper.hook";

vi.mock("../../../../../components", () => ({
  InputGroup: ({
    name,
    type,
    defaultValue,
    form,
    max,
    inputMode,
    pattern,
  }: {
    name: string;
    type: string;
    defaultValue?: string | number;
    form?: string;
    max?: string;
    inputMode?: string;
    pattern?: string;
  }) => (
    <input
      data-testid={`input-${name}`}
      name={name}
      type={type}
      defaultValue={defaultValue}
      form={form}
      max={max}
      inputMode={inputMode}
      pattern={pattern}
    />
  ),

  TableFormActions: ({
    isSaving,
    isEditing,
    onCancel,
    form,
  }: {
    isSaving: boolean;
    isEditing?: boolean;
    onCancel: () => void;
    form?: string;
  }) => (
    <div data-testid="table-form-actions">
      <span data-testid="saving-state">{String(isSaving)}</span>

      <span data-testid="editing-state">{String(isEditing)}</span>

      <span data-testid="form-id">{form ?? ""}</span>

      <button type="button" onClick={onCancel} disabled={isSaving}>
        Cancel
      </button>
    </div>
  ),
}));

vi.mock("../useFormRowHelper.hook", () => ({
  useFormRowHelper: vi.fn(),
}));

const useFormRowHelperMock = vi.mocked(useFormRowHelper);

describe("FormRow", () => {
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

  const formData: Expense = {
    id: "expense-123",
    userId: "user-123",
    amount: 125.5,
    description: "Electricity bill",
    categoryId: "bills",
    date: "2026-08-30",
    createdAt: "2026-08-30T10:00:00.000Z",
    updatedAt: "2026-08-30T10:00:00.000Z",
  };

  const onChangeDescription = vi.fn();
  const onClickSuggestedCategory = vi.fn();

  const renderFormRow = (
    overrides: Partial<React.ComponentProps<typeof FormRow>> = {}
  ) =>
    render(
      <table>
        <tbody>
          <FormRow
            form="expense-form"
            formData={formData}
            categories={categories}
            isEditing={false}
            isSaving={false}
            onCancel={vi.fn()}
            {...overrides}
          />
        </tbody>
      </table>
    );

  beforeEach(() => {
    vi.resetAllMocks();

    useFormRowHelperMock.mockReturnValue({
      categorySelectRef: { current: null },
      amountRef: { current: null },
      showSuggestion: false,
      suggestionTextButton: "",
      isSuggestingCategory: false,
      today: "2026-08-31",
      onChangeDescription,
      onClickSuggestedCategory,
    });
  });

  it("should render the row", () => {
    renderFormRow();

    expect(screen.getByRole("row")).toBeInTheDocument();
  });

  it("should render the mobile labels", () => {
    renderFormRow();

    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
  });

  it("should render the date input with the expected values", () => {
    renderFormRow();

    const input = screen.getByTestId("input-date");

    expect(input).toHaveAttribute("name", "date");
    expect(input).toHaveAttribute("type", "date");
    expect(input).toHaveValue(formData.date);
    expect(input).toHaveAttribute("form", "expense-form");
    expect(input).toHaveAttribute("max", "2026-08-31");
  });

  it("should render the description input with the expected value", () => {
    renderFormRow();

    const input = screen.getByTestId("input-description");

    expect(input).toHaveAttribute("name", "description");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue(formData.description);
    expect(input).toHaveAttribute("form", "expense-form");
  });

  it("should render the category select with the current category selected", () => {
    renderFormRow();

    const select = screen.getByRole("combobox");

    expect(select).toHaveAttribute("name", "categoryId");
    expect(select).toHaveAttribute("form", "expense-form");
    expect(select).toBeRequired();
  });

  it("should render all categories", () => {
    renderFormRow();

    expect(screen.getByRole("option", { name: "Select" })).toBeInTheDocument();

    expect(screen.getByRole("option", { name: "Food" })).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Transport" })
    ).toBeInTheDocument();

    expect(screen.getByRole("option", { name: "Bills" })).toBeInTheDocument();
  });

  it("should select the current category", () => {
    renderFormRow();

    expect(screen.getByRole("combobox")).toHaveValue("bills");
  });

  it("should render the amount input with the expected values", () => {
    renderFormRow();

    const input = screen.getByTestId("input-amount");

    expect(input).toHaveAttribute("name", "amount");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveValue("125.5");
    expect(input).toHaveAttribute("form", "expense-form");
    expect(input).toHaveAttribute("inputmode", "decimal");
    expect(input).toHaveAttribute("pattern", "^\\d+([.,]\\d{1,2})?$");
  });

  it("should pass the form and states to TableFormActions", () => {
    renderFormRow({
      isEditing: true,
      isSaving: true,
    });

    expect(screen.getByTestId("saving-state")).toHaveTextContent("true");

    expect(screen.getByTestId("editing-state")).toHaveTextContent("true");

    expect(screen.getByTestId("form-id")).toHaveTextContent("expense-form");
  });

  it("should call onCancel from TableFormActions", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    renderFormRow({ onCancel });

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should render the suggestion loading state", () => {
    useFormRowHelperMock.mockReturnValue({
      categorySelectRef: { current: null },
      amountRef: { current: null },
      showSuggestion: true,
      suggestionTextButton: "",
      isSuggestingCategory: true,
      today: "2026-08-31",
      onChangeDescription,
      onClickSuggestedCategory,
    });

    renderFormRow();

    expect(screen.getByText("Suggesting category...")).toBeInTheDocument();
  });

  it("should render the suggested category button", () => {
    useFormRowHelperMock.mockReturnValue({
      categorySelectRef: { current: null },
      amountRef: { current: null },
      showSuggestion: true,
      suggestionTextButton: "Use category Food",
      isSuggestingCategory: false,
      today: "2026-08-31",
      onChangeDescription,
      onClickSuggestedCategory,
    });

    renderFormRow();

    expect(
      screen.getByRole("button", {
        name: "Use category Food",
      })
    ).toBeInTheDocument();
  });

  it("should call onClickSuggestedCategory when the suggestion button is clicked", async () => {
    const user = userEvent.setup();

    useFormRowHelperMock.mockReturnValue({
      categorySelectRef: { current: null },
      amountRef: { current: null },
      showSuggestion: true,
      suggestionTextButton: "Use category Food",
      isSuggestingCategory: false,
      today: "2026-08-31",
      onChangeDescription,
      onClickSuggestedCategory,
    });

    renderFormRow();

    await user.click(
      screen.getByRole("button", {
        name: "Use category Food",
      })
    );

    expect(onClickSuggestedCategory).toHaveBeenCalledTimes(1);
  });

  it("should not render suggestion content when there is no suggestion", () => {
    renderFormRow();

    expect(
      screen.queryByText("Suggesting category...")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: /Use category/,
      })
    ).not.toBeInTheDocument();
  });

  it("should pass the description and categories to the helper", () => {
    renderFormRow();

    expect(useFormRowHelperMock).toHaveBeenCalledWith(
      formData.description,
      categories
    );
  });

  it("should render the row with the expected mobile classes", () => {
    renderFormRow();

    const row = screen.getByRole("row");

    expect(row).toHaveClass("max-md:block", "max-md:w-full");
  });

  it("should render bottom spacing when a suggestion is visible", () => {
    useFormRowHelperMock.mockReturnValue({
      categorySelectRef: { current: null },
      amountRef: { current: null },
      showSuggestion: true,
      suggestionTextButton: "Use category Food",
      isSuggestingCategory: false,
      today: "2026-08-31",
      onChangeDescription,
      onClickSuggestedCategory,
    });

    const { container } = renderFormRow();

    expect(container.querySelector(".h-10.max-md\\:h-0")).toBeInTheDocument();
  });
});
