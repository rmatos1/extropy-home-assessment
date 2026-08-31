import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Categories } from "../";
import { useCategoriesHelper } from "../useCategoriesHelper.hook";

vi.mock("../useCategoriesHelper.hook", () => ({
  useCategoriesHelper: vi.fn(),
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
    renderFormRow,
    isLoading,
  }: {
    columns: unknown[];
    data: unknown[];
    isAdding: boolean;
    renderFormRow: () => React.ReactNode;
    isLoading?: boolean;
  }) => (
    <div
      data-testid="dashboard-table"
      data-columns-count={columns.length}
      data-data-count={data.length}
      data-is-adding={String(isAdding)}
      data-is-loading={String(isLoading)}
    >
      {isAdding && renderFormRow()}
    </div>
  ),
}));

vi.mock("../categories.constants", () => ({
  columns: [
    {
      accessorKey: "name",
      header: "Category",
    },
  ],
}));

vi.mock("../categoriesComponents", () => ({
  FormRow: ({
    isSaving,
    onCancel,
  }: {
    fetcher: unknown;
    isSaving: boolean;
    onCancel: () => void;
  }) => (
    <div data-testid="form-row">
      <span data-testid="form-saving">{String(isSaving)}</span>

      <button type="button" onClick={onCancel}>
        Cancel category
      </button>
    </div>
  ),
}));

const useCategoriesHelperMock = vi.mocked(useCategoriesHelper);

const categories = [
  {
    id: "food",
    name: "Food",
  },
  {
    id: "transport",
    name: "Transport",
  },
];

describe("Categories", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    useCategoriesHelperMock.mockReturnValue({
      categoriesFetcher: {
        Form: vi.fn(),
      } as never,
      categoriesFormRef: {
        current: null,
      },
      isAdding: false,
      categories,
      isSaving: false,
      onClickAddCategory: vi.fn(),
      onCancelCategoryForm: vi.fn(),
      isLoading: false,
    });
  });

  it("should render the Add expense button", () => {
    render(<Categories />);

    expect(
      screen.getByRole("button", { name: "Add expense" })
    ).toBeInTheDocument();
  });

  it("should call onClickAddCategory when Add expense is clicked", async () => {
    const user = userEvent.setup();

    const onClickAddCategory = vi.fn();

    useCategoriesHelperMock.mockReturnValue({
      categoriesFetcher: {
        Form: vi.fn(),
      } as never,
      categoriesFormRef: {
        current: null,
      },
      isAdding: false,
      categories,
      isSaving: false,
      onClickAddCategory,
      onCancelCategoryForm: vi.fn(),
      isLoading: false,
    });

    render(<Categories />);

    await user.click(screen.getByRole("button", { name: "Add expense" }));

    expect(onClickAddCategory).toHaveBeenCalledTimes(1);
  });

  it("should disable the Add expense button when a category is being added", () => {
    useCategoriesHelperMock.mockReturnValue({
      categoriesFetcher: {
        Form: vi.fn(),
      } as never,
      categoriesFormRef: {
        current: null,
      },
      isAdding: true,
      categories,
      isSaving: false,
      onClickAddCategory: vi.fn(),
      onCancelCategoryForm: vi.fn(),
      isLoading: false,
    });

    render(<Categories />);

    expect(screen.getByRole("button", { name: "Add expense" })).toBeDisabled();
  });

  it("should render the categories table", () => {
    render(<Categories />);

    const table = screen.getByTestId("dashboard-table");

    expect(table).toBeInTheDocument();
    expect(table).toHaveAttribute("data-columns-count", "1");
    expect(table).toHaveAttribute("data-data-count", "2");
  });

  it("should pass isAdding to the table", () => {
    useCategoriesHelperMock.mockReturnValue({
      categoriesFetcher: {
        Form: vi.fn(),
      } as never,
      categoriesFormRef: {
        current: null,
      },
      isAdding: true,
      categories,
      isSaving: false,
      onClickAddCategory: vi.fn(),
      onCancelCategoryForm: vi.fn(),
      isLoading: false,
    });

    render(<Categories />);

    expect(screen.getByTestId("dashboard-table")).toHaveAttribute(
      "data-is-adding",
      "true"
    );
  });

  it("should render the category form row when adding", () => {
    useCategoriesHelperMock.mockReturnValue({
      categoriesFetcher: {
        Form: vi.fn(),
      } as never,
      categoriesFormRef: {
        current: null,
      },
      isAdding: true,
      categories,
      isSaving: false,
      onClickAddCategory: vi.fn(),
      onCancelCategoryForm: vi.fn(),
      isLoading: false,
    });

    render(<Categories />);

    expect(screen.getByTestId("form-row")).toBeInTheDocument();
  });

  it("should pass the saving state to the form row", () => {
    useCategoriesHelperMock.mockReturnValue({
      categoriesFetcher: {
        Form: vi.fn(),
      } as never,
      categoriesFormRef: {
        current: null,
      },
      isAdding: true,
      categories,
      isSaving: true,
      onClickAddCategory: vi.fn(),
      onCancelCategoryForm: vi.fn(),
      isLoading: false,
    });

    render(<Categories />);

    expect(screen.getByTestId("form-saving")).toHaveTextContent("true");
  });

  it("should call onCancelCategoryForm from the form row", async () => {
    const user = userEvent.setup();

    const onCancelCategoryForm = vi.fn();

    useCategoriesHelperMock.mockReturnValue({
      categoriesFetcher: {
        Form: vi.fn(),
      } as never,
      categoriesFormRef: {
        current: null,
      },
      isAdding: true,
      categories,
      isSaving: false,
      onClickAddCategory: vi.fn(),
      onCancelCategoryForm,
      isLoading: false,
    });

    render(<Categories />);

    await user.click(
      screen.getByRole("button", {
        name: "Cancel category",
      })
    );

    expect(onCancelCategoryForm).toHaveBeenCalledTimes(1);
  });

  it("should pass the loading state to the table", () => {
    useCategoriesHelperMock.mockReturnValue({
      categoriesFetcher: {
        Form: vi.fn(),
      } as never,
      categoriesFormRef: {
        current: null,
      },
      isAdding: false,
      categories,
      isSaving: false,
      onClickAddCategory: vi.fn(),
      onCancelCategoryForm: vi.fn(),
      isLoading: true,
    });

    render(<Categories />);

    expect(screen.getByTestId("dashboard-table")).toHaveAttribute(
      "data-is-loading",
      "true"
    );
  });
});
