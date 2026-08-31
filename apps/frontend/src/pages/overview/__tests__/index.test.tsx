import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Overview } from "../";

const useLoaderDataMock = vi.fn();

vi.mock("react-router", () => ({
  useLoaderData: () => useLoaderDataMock(),
}));

vi.mock("../overviewComponents", () => ({
  SpendingSummary: ({
    totalThisMonth,
    totalThisYear,
  }: {
    totalThisMonth: number;
    totalThisYear: number;
  }) => (
    <div data-testid="spending-summary">
      <span data-testid="total-month">{totalThisMonth}</span>
      <span data-testid="total-year">{totalThisYear}</span>
    </div>
  ),

  MonthlySpending: ({ data }: { data: unknown[] }) => (
    <div data-testid="monthly-spending">{JSON.stringify(data)}</div>
  ),

  SpendingByCategory: ({
    data,
    categories,
  }: {
    data: unknown[];
    categories: unknown[];
  }) => (
    <div data-testid="spending-by-category">
      <span data-testid="category-data">{JSON.stringify(data)}</span>
      <span data-testid="categories-data">{JSON.stringify(categories)}</span>
    </div>
  ),

  RecentExpenses: ({ expenses }: { expenses: unknown[] }) => (
    <div data-testid="recent-expenses">{JSON.stringify(expenses)}</div>
  ),
}));

describe("Overview", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should render all overview sections", () => {
    useLoaderDataMock.mockReturnValue([
      [
        {
          id: "food",
          name: "Food",
        },
      ],
      {
        totalThisMonth: 100,
        totalThisYear: 1000,
        monthlySpending: [
          {
            month: "2026-08",
            amount: 100,
          },
        ],
        spendingByCategory: [
          {
            categoryId: "food",
            amount: 100,
          },
        ],
        recentExpenses: [
          {
            id: "expense-1",
            description: "Lunch",
            amount: 100,
            date: "2026-08-30",
          },
        ],
      },
    ]);

    render(<Overview />);

    expect(screen.getByTestId("spending-summary")).toBeInTheDocument();

    expect(screen.getByTestId("monthly-spending")).toBeInTheDocument();

    expect(screen.getByTestId("spending-by-category")).toBeInTheDocument();

    expect(screen.getByTestId("recent-expenses")).toBeInTheDocument();
  });

  it("should pass the monthly and yearly totals to SpendingSummary", () => {
    useLoaderDataMock.mockReturnValue([
      [],
      {
        totalThisMonth: 1250.5,
        totalThisYear: 9800,
        monthlySpending: [],
        spendingByCategory: [],
        recentExpenses: [],
      },
    ]);

    render(<Overview />);

    expect(screen.getByTestId("total-month")).toHaveTextContent("1250.5");

    expect(screen.getByTestId("total-year")).toHaveTextContent("9800");
  });

  it("should pass monthly spending data to MonthlySpending", () => {
    const monthlySpending = [
      {
        month: "2026-08",
        amount: 450,
      },
      {
        month: "2026-07",
        amount: 300,
      },
    ];

    useLoaderDataMock.mockReturnValue([
      [],
      {
        totalThisMonth: 0,
        totalThisYear: 0,
        monthlySpending,
        spendingByCategory: [],
        recentExpenses: [],
      },
    ]);

    render(<Overview />);

    expect(screen.getByTestId("monthly-spending")).toHaveTextContent(
      JSON.stringify(monthlySpending)
    );
  });

  it("should pass categories and spending by category data to SpendingByCategory", () => {
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

    const spendingByCategory = [
      {
        categoryId: "food",
        amount: 250,
      },
      {
        categoryId: "transport",
        amount: 100,
      },
    ];

    useLoaderDataMock.mockReturnValue([
      categories,
      {
        totalThisMonth: 0,
        totalThisYear: 0,
        monthlySpending: [],
        spendingByCategory,
        recentExpenses: [],
      },
    ]);

    render(<Overview />);

    expect(screen.getByTestId("category-data")).toHaveTextContent(
      JSON.stringify(spendingByCategory)
    );

    expect(screen.getByTestId("categories-data")).toHaveTextContent(
      JSON.stringify(categories)
    );
  });

  it("should pass recent expenses to RecentExpenses", () => {
    const recentExpenses = [
      {
        id: "expense-1",
        description: "Lunch",
        amount: 100,
        date: "2026-08-30",
      },
      {
        id: "expense-2",
        description: "Uber",
        amount: 50,
        date: "2026-08-29",
      },
    ];

    useLoaderDataMock.mockReturnValue([
      [],
      {
        totalThisMonth: 0,
        totalThisYear: 0,
        monthlySpending: [],
        spendingByCategory: [],
        recentExpenses,
      },
    ]);

    render(<Overview />);

    expect(screen.getByTestId("recent-expenses")).toHaveTextContent(
      JSON.stringify(recentExpenses)
    );
  });

  it("should use zero as the fallback for missing monthly total", () => {
    useLoaderDataMock.mockReturnValue([
      [],
      {
        totalThisMonth: undefined,
        totalThisYear: undefined,
        monthlySpending: [],
        spendingByCategory: [],
        recentExpenses: [],
      },
    ]);

    render(<Overview />);

    expect(screen.getByTestId("total-month")).toHaveTextContent("0");

    expect(screen.getByTestId("total-year")).toHaveTextContent("0");
  });

  it("should use empty arrays as fallbacks for missing report arrays", () => {
    useLoaderDataMock.mockReturnValue([
      [],
      {
        totalThisMonth: 0,
        totalThisYear: 0,
        monthlySpending: undefined,
        spendingByCategory: undefined,
        recentExpenses: undefined,
      },
    ]);

    render(<Overview />);

    expect(screen.getByTestId("monthly-spending")).toHaveTextContent("[]");

    expect(screen.getByTestId("category-data")).toHaveTextContent("[]");

    expect(screen.getByTestId("recent-expenses")).toHaveTextContent("[]");
  });

  it("should pass the categories even when the report is empty", () => {
    const categories = [
      {
        id: "food",
        name: "Food",
      },
    ];

    useLoaderDataMock.mockReturnValue([categories, undefined]);

    render(<Overview />);

    expect(screen.getByTestId("total-month")).toHaveTextContent("0");

    expect(screen.getByTestId("total-year")).toHaveTextContent("0");

    expect(screen.getByTestId("categories-data")).toHaveTextContent(
      JSON.stringify(categories)
    );
  });

  it("should render the loader data in the expected component structure", () => {
    const categories = [
      {
        id: "food",
        name: "Food",
      },
    ];

    const reports = {
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
          amount: 500,
        },
      ],
      recentExpenses: [],
    };

    useLoaderDataMock.mockReturnValue([categories, reports]);

    render(<Overview />);

    expect(screen.getByTestId("total-month")).toHaveTextContent("500");

    expect(screen.getByTestId("total-year")).toHaveTextContent("5000");

    expect(screen.getByTestId("monthly-spending")).toHaveTextContent(
      JSON.stringify(reports.monthlySpending)
    );

    expect(screen.getByTestId("category-data")).toHaveTextContent(
      JSON.stringify(reports.spendingByCategory)
    );

    expect(screen.getByTestId("categories-data")).toHaveTextContent(
      JSON.stringify(categories)
    );

    expect(screen.getByTestId("recent-expenses")).toHaveTextContent(
      JSON.stringify(reports.recentExpenses)
    );
  });
});
