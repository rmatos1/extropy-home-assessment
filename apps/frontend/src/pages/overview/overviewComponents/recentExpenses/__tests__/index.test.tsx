import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ExpenseResponse } from "@extropy/shared";

import { RecentExpenses } from "../";

describe("RecentExpenses", () => {
  const expenses: ExpenseResponse[] = [
    {
      id: "expense-1",
      userId: "user-123",
      amount: 125.5,
      description: "Grocery shopping",
      categoryId: "food",
      categoryName: "Food",
      date: "2026-08-30",
    },
    {
      id: "expense-2",
      userId: "user-123",
      amount: 50,
      description: "Uber ride",
      categoryId: "transport",
      categoryName: "Transport",
      date: "2026-08-29",
    },
  ];

  it("should render the section title", () => {
    render(<RecentExpenses expenses={expenses} />);

    expect(
      screen.getByRole("heading", {
        name: "Recent expenses",
      })
    ).toBeInTheDocument();
  });

  it("should render the empty state when there are no expenses", () => {
    render(<RecentExpenses expenses={[]} />);

    expect(
      screen.getByText("There aren't any recent expenses.")
    ).toBeInTheDocument();
  });

  it("should not render the empty state when expenses are available", () => {
    render(<RecentExpenses expenses={expenses} />);

    expect(
      screen.queryByText("There aren't any recent expenses.")
    ).not.toBeInTheDocument();
  });

  it("should render the table headers", () => {
    render(<RecentExpenses expenses={expenses} />);

    expect(
      screen.getByRole("columnheader", { name: "Date" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: "Expense" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: "Amount" })
    ).toBeInTheDocument();
  });

  it("should render all expenses", () => {
    render(<RecentExpenses expenses={expenses} />);

    expect(screen.getByText("Grocery shopping")).toBeInTheDocument();

    expect(screen.getByText("Uber ride")).toBeInTheDocument();
  });

  it("should format expense dates", () => {
    render(<RecentExpenses expenses={expenses} />);

    expect(screen.getByText("30/08/2026")).toBeInTheDocument();

    expect(screen.getByText("29/08/2026")).toBeInTheDocument();
  });

  it("should format expense amounts as USD currency", () => {
    render(<RecentExpenses expenses={expenses} />);

    expect(screen.getByText("$125.50")).toBeInTheDocument();

    expect(screen.getByText("$50.00")).toBeInTheDocument();
  });

  it("should render the correct number of expense rows", () => {
    render(<RecentExpenses expenses={expenses} />);

    const rows = screen.getAllByRole("row");

    expect(rows).toHaveLength(3);
  });

  it("should render the correct mobile data labels", () => {
    render(<RecentExpenses expenses={expenses} />);

    const groceryCell = screen.getByText("Grocery shopping").closest("td");

    const dateCell = screen.getByText("30/08/2026").closest("td");

    const amountCell = screen.getByText("$125.50").closest("td");

    expect(dateCell).toHaveAttribute("data-label", "Date");
    expect(groceryCell).toHaveAttribute("data-label", "Expense");
    expect(amountCell).toHaveAttribute("data-label", "Amount");
  });

  it("should render the empty state across all columns", () => {
    render(<RecentExpenses expenses={[]} />);

    const emptyCell = screen.getByText("There aren't any recent expenses.");

    expect(emptyCell).toHaveAttribute("colspan", "3");
  });

  it("should render each expense as a separate row", () => {
    render(<RecentExpenses expenses={expenses} />);

    const groceryRow = screen.getByText("Grocery shopping").closest("tr");

    const uberRow = screen.getByText("Uber ride").closest("tr");

    expect(groceryRow).toBeInTheDocument();
    expect(uberRow).toBeInTheDocument();
    expect(groceryRow).not.toBe(uberRow);
  });
});
