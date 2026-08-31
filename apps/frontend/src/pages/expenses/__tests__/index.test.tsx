import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Expenses } from "../";
import { useExpensesHelper } from "../useExpensesHelper.hook";
import {
  mockedCategories as categories,
  mockedExpenses as expenses,
  expenseFormData,
  columns,
} from "./mocks";

vi.mock("../useExpensesHelper.hook", () => ({
  useExpensesHelper: vi.fn(),
}));

vi.mock("../../../components", () => ({
  ActionButton: ({
    text,
    onClick,
    isDisabled,
  }: {
    text: string;
    onClick?: () => void;
    isDisabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={isDisabled}>
      {text}
    </button>
  ),

  DashboardTable: ({
    columns,
    data,
    isAdding,
    isEditing,
    editingRowId,
    renderFormRow,
    renderActions,
    isLoading,
    emptyMsg,
  }: {
    columns: unknown[];
    data: Array<{ id: string }>;
    isAdding: boolean;
    isEditing?: boolean;
    editingRowId?: string | null;
    renderFormRow: () => React.ReactNode;
    renderActions?: (row: { id: string }) => React.ReactNode;
    isLoading?: boolean;
    emptyMsg?: string;
  }) => (
    <div
      data-testid="dashboard-table"
      data-columns-count={columns.length}
      data-data-count={data.length}
      data-is-adding={String(isAdding)}
      data-is-editing={String(isEditing)}
      data-editing-row-id={editingRowId ?? ""}
      data-is-loading={String(isLoading)}
      data-empty-message={emptyMsg ?? ""}
    >
      {isAdding && renderFormRow()}

      {isEditing && editingRowId && renderFormRow()}

      {renderActions &&
        data.map((row) => <div key={row.id}>{renderActions(row)}</div>)}
    </div>
  ),

  DefaultModal: ({
    title,
    description,
    onClose,
    onConfirm,
    isProcessing,
    processingText,
    confirmTextButton,
  }: {
    title: string;
    description: string;
    onClose: () => void;
    onConfirm: () => void;
    isProcessing?: boolean;
    processingText?: string;
    confirmTextButton: string;
  }) => (
    <div data-testid="default-modal">
      <h2>{title}</h2>
      <p>{description}</p>

      <button type="button" onClick={onClose}>
        Cancel modal
      </button>

      <button type="button" onClick={onConfirm}>
        {isProcessing ? processingText : confirmTextButton}
      </button>
    </div>
  ),
}));

vi.mock("../expensesComponents", () => ({
  FilterForm: ({
    categories,
    isDisabled,
  }: {
    categories: unknown[];
    isDisabled: boolean;
  }) => (
    <div
      data-testid="filter-form"
      data-category-count={String(categories.length)}
      data-disabled={String(isDisabled)}
    />
  ),

  FormRow: ({
    form,
    formData,
    categories,
    isEditing,
    isSaving,
    onCancel,
  }: {
    form: string;
    formData: unknown;
    categories: unknown[];
    isEditing: boolean;
    isSaving: boolean;
    onCancel: () => void;
  }) => (
    <div data-testid="form-row">
      <span data-testid="form-id">{form}</span>
      <span data-testid="form-editing">{String(isEditing)}</span>
      <span data-testid="form-saving">{String(isSaving)}</span>
      <span data-testid="form-category-count">{categories.length}</span>
      <span data-testid="form-data">{JSON.stringify(formData)}</span>

      <button type="button" onClick={onCancel}>
        Cancel expense form
      </button>
    </div>
  ),

  ActionsRow: ({
    isDisabled,
    onClickEdit,
    onClickDelete,
  }: {
    isDisabled: boolean;
    onClickEdit: () => void;
    onClickDelete: () => void;
  }) => (
    <div data-testid="actions-row">
      <button type="button" disabled={isDisabled} onClick={onClickEdit}>
        Edit expense
      </button>

      <button type="button" disabled={isDisabled} onClick={onClickDelete}>
        Delete expense
      </button>
    </div>
  ),
}));

const useExpensesHelperMock = vi.mocked(useExpensesHelper);

describe("Expenses", () => {
  const createDefaultHelperReturn = () => ({
    expensesFetcher: {
      Form: ({
        children,
        ...props
      }: React.FormHTMLAttributes<HTMLFormElement>) => (
        <form {...props}>{children}</form>
      ),
    } as never,
    expensesFormRef: {
      current: null,
    },
    isAdding: false,
    onClickAddExpense: vi.fn(),
    isEditing: false,
    isProcessing: false,
    expenses,
    categories,
    expenseFormData,
    selectedExpenseId: null,
    onClickEditExpense: vi.fn(),
    onCancelExpenseForm: vi.fn(),
    onClickDeleteExpense: vi.fn(),
    showDeleteModal: false,
    deleteExpenseDescription: "",
    onCloseModal: vi.fn(),
    onConfirmDelete: vi.fn(),
    columns,
    isLoading: false,
  });

  beforeEach(() => {
    vi.resetAllMocks();

    useExpensesHelperMock.mockReturnValue(createDefaultHelperReturn());
  });

  it("should render the FilterForm", () => {
    render(<Expenses />);

    expect(screen.getByTestId("filter-form")).toBeInTheDocument();
  });

  it("should pass categories to FilterForm", () => {
    render(<Expenses />);

    expect(screen.getByTestId("filter-form")).toHaveAttribute(
      "data-category-count",
      "3"
    );
  });

  it("should render the Add expense button", () => {
    render(<Expenses />);

    expect(
      screen.getByRole("button", {
        name: "Add expense",
      })
    ).toBeInTheDocument();
  });

  it("should call onClickAddExpense when Add expense is clicked", async () => {
    const user = userEvent.setup();
    const onClickAddExpense = vi.fn();

    useExpensesHelperMock.mockReturnValue({
      ...createDefaultHelperReturn(),
      onClickAddExpense,
    });

    render(<Expenses />);

    await user.click(
      screen.getByRole("button", {
        name: "Add expense",
      })
    );

    expect(onClickAddExpense).toHaveBeenCalledTimes(1);
  });

  it("should disable Add expense when adding", () => {
    useExpensesHelperMock.mockReturnValue({
      ...createDefaultHelperReturn(),
      isAdding: true,
    });

    render(<Expenses />);

    expect(
      screen.getByRole("button", {
        name: "Add expense",
      })
    ).toBeDisabled();
  });

  it("should disable Add expense when editing", () => {
    useExpensesHelperMock.mockReturnValue({
      ...createDefaultHelperReturn(),
      isEditing: true,
    });

    render(<Expenses />);

    expect(
      screen.getByRole("button", {
        name: "Add expense",
      })
    ).toBeDisabled();
  });

  it("should disable FilterForm when adding", () => {
    useExpensesHelperMock.mockReturnValue({
      ...createDefaultHelperReturn(),
      isAdding: true,
    });

    render(<Expenses />);

    expect(screen.getByTestId("filter-form")).toHaveAttribute(
      "data-disabled",
      "true"
    );
  });

  it("should disable FilterForm when editing", () => {
    useExpensesHelperMock.mockReturnValue({
      ...createDefaultHelperReturn(),
      isEditing: true,
    });

    render(<Expenses />);

    expect(screen.getByTestId("filter-form")).toHaveAttribute(
      "data-disabled",
      "true"
    );
  });

  it("should render DashboardTable", () => {
    render(<Expenses />);

    expect(screen.getByTestId("dashboard-table")).toBeInTheDocument();
  });

  it("should pass expenses and columns to DashboardTable", () => {
    render(<Expenses />);

    const table = screen.getByTestId("dashboard-table");

    expect(table).toHaveAttribute("data-data-count", "2");

    expect(table).toHaveAttribute("data-columns-count", "2");
  });

  it("should pass the loading state to DashboardTable", () => {
    useExpensesHelperMock.mockReturnValue({
      ...createDefaultHelperReturn(),
      isLoading: true,
    });

    render(<Expenses />);

    expect(screen.getByTestId("dashboard-table")).toHaveAttribute(
      "data-is-loading",
      "true"
    );
  });

  it("should pass the adding state to DashboardTable", () => {
    useExpensesHelperMock.mockReturnValue({
      ...createDefaultHelperReturn(),
      isAdding: true,
    });

    render(<Expenses />);

    expect(screen.getByTestId("dashboard-table")).toHaveAttribute(
      "data-is-adding",
      "true"
    );

    expect(screen.getByTestId("form-row")).toBeInTheDocument();
  });

  it("should render the form row with the expected props", () => {
    useExpensesHelperMock.mockReturnValue({
      ...createDefaultHelperReturn(),
      isAdding: true,
      isProcessing: true,
      isEditing: false,
    });

    render(<Expenses />);

    expect(screen.getByTestId("form-id")).toHaveTextContent("expense-form");

    expect(screen.getByTestId("form-editing")).toHaveTextContent("false");

    expect(screen.getByTestId("form-saving")).toHaveTextContent("true");

    expect(screen.getByTestId("form-category-count")).toHaveTextContent("3");
  });

  it("should render the edit form for the selected expense", () => {
    useExpensesHelperMock.mockReturnValue({
      ...createDefaultHelperReturn(),
      isEditing: true,
      selectedExpenseId: "expense-2",
    });

    render(<Expenses />);

    expect(screen.getByTestId("dashboard-table")).toHaveAttribute(
      "data-is-editing",
      "true"
    );

    expect(screen.getByTestId("dashboard-table")).toHaveAttribute(
      "data-editing-row-id",
      "expense-2"
    );

    expect(screen.getByTestId("form-row")).toBeInTheDocument();
  });

  it("should pass the selected expense form data to FormRow", () => {
    const selectedFormData = {
      date: "2026-08-29",
      description: "Uber",
      categoryId: "transport",
      amount: "50.00",
    };

    useExpensesHelperMock.mockReturnValue({
      ...createDefaultHelperReturn(),
      isEditing: true,
      selectedExpenseId: "expense-2",
      expenseFormData: selectedFormData,
    });

    render(<Expenses />);

    expect(screen.getByTestId("form-data")).toHaveTextContent(
      JSON.stringify(selectedFormData)
    );
  });

  it("should render ActionsRow for each expense", () => {
    render(<Expenses />);

    expect(screen.getAllByTestId("actions-row")).toHaveLength(2);
  });

  it("should call onClickEditExpense with the expense", async () => {
    const user = userEvent.setup();
    const onClickEditExpense = vi.fn();

    useExpensesHelperMock.mockReturnValue({
      ...createDefaultHelperReturn(),
      onClickEditExpense,
    });

    render(<Expenses />);

    const editButtons = screen.getAllByRole("button", {
      name: "Edit expense",
    });

    await user.click(editButtons[0]);

    expect(onClickEditExpense).toHaveBeenCalledTimes(1);
    expect(onClickEditExpense).toHaveBeenCalledWith(expenses[0]);
  });

  it("should call onClickDeleteExpense with the expense", async () => {
    const user = userEvent.setup();
    const onClickDeleteExpense = vi.fn();

    useExpensesHelperMock.mockReturnValue({
      ...createDefaultHelperReturn(),
      onClickDeleteExpense,
    });

    render(<Expenses />);

    const deleteButtons = screen.getAllByRole("button", {
      name: "Delete expense",
    });

    await user.click(deleteButtons[1]);

    expect(onClickDeleteExpense).toHaveBeenCalledTimes(1);

    expect(onClickDeleteExpense).toHaveBeenCalledWith(expenses[1]);
  });

  it("should disable row actions when adding an expense", () => {
    useExpensesHelperMock.mockReturnValue({
      ...createDefaultHelperReturn(),
      isAdding: true,
    });

    render(<Expenses />);

    expect(
      screen.getAllByRole("button", {
        name: "Edit expense",
      })
    ).toHaveLength(2);

    expect(
      screen.getAllByRole("button", {
        name: "Edit expense",
      })[0]
    ).toBeDisabled();

    expect(
      screen.getAllByRole("button", {
        name: "Delete expense",
      })[0]
    ).toBeDisabled();
  });

  it("should disable row actions while processing", () => {
    useExpensesHelperMock.mockReturnValue({
      ...createDefaultHelperReturn(),
      isProcessing: true,
    });

    render(<Expenses />);

    expect(
      screen.getAllByRole("button", {
        name: "Edit expense",
      })[0]
    ).toBeDisabled();

    expect(
      screen.getAllByRole("button", {
        name: "Delete expense",
      })[0]
    ).toBeDisabled();
  });

  it("should not render the delete modal by default", () => {
    render(<Expenses />);

    expect(screen.queryByTestId("default-modal")).not.toBeInTheDocument();
  });

  it("should render the delete modal when requested", () => {
    useExpensesHelperMock.mockReturnValue({
      ...createDefaultHelperReturn(),
      showDeleteModal: true,
      deleteExpenseDescription: "Uber",
    });

    render(<Expenses />);

    expect(screen.getByTestId("default-modal")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Delete expense",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Are you sure you want to delete Uber?")
    ).toBeInTheDocument();
  });

  it("should call onCloseModal when the delete modal is closed", async () => {
    const user = userEvent.setup();
    const onCloseModal = vi.fn();

    useExpensesHelperMock.mockReturnValue({
      ...createDefaultHelperReturn(),
      showDeleteModal: true,
      deleteExpenseDescription: "Uber",
      onCloseModal,
    });

    render(<Expenses />);

    await user.click(
      screen.getByRole("button", {
        name: "Cancel modal",
      })
    );

    expect(onCloseModal).toHaveBeenCalledTimes(1);
  });

  it("should call onConfirmDelete when delete is confirmed", async () => {
    const user = userEvent.setup();
    const onConfirmDelete = vi.fn();

    useExpensesHelperMock.mockReturnValue({
      ...createDefaultHelperReturn(),
      showDeleteModal: true,
      deleteExpenseDescription: "Uber",
      onConfirmDelete,
    });

    render(<Expenses />);

    await user.click(
      screen.getByRole("button", {
        name: "Delete",
      })
    );

    expect(onConfirmDelete).toHaveBeenCalledTimes(1);
  });

  it("should pass the processing state to the delete modal", () => {
    useExpensesHelperMock.mockReturnValue({
      ...createDefaultHelperReturn(),
      showDeleteModal: true,
      isProcessing: true,
      deleteExpenseDescription: "Uber",
    });

    render(<Expenses />);

    expect(
      screen.getByRole("button", {
        name: "deleting...",
      })
    ).toBeInTheDocument();
  });

  it("should render the hidden form with create intent by default", () => {
    render(<Expenses />);

    const form = document.querySelector("form#expense-form");

    expect(form).toBeInTheDocument();

    const intent = form?.querySelector('input[name="intent"]');

    expect(intent).toHaveValue("create");
  });

  it("should use update intent while editing", () => {
    useExpensesHelperMock.mockReturnValue({
      ...createDefaultHelperReturn(),
      isEditing: true,
      selectedExpenseId: "expense-2",
    });

    render(<Expenses />);

    const form = document.querySelector("form#expense-form");

    expect(form?.querySelector('input[name="intent"]')).toHaveValue("update");

    expect(form?.querySelector('input[name="expenseId"]')).toHaveValue(
      "expense-2"
    );
  });

  it("should not render the expense id when not editing", () => {
    render(<Expenses />);

    const form = document.querySelector("form#expense-form");

    expect(
      form?.querySelector('input[name="expenseId"]')
    ).not.toBeInTheDocument();
  });
});
