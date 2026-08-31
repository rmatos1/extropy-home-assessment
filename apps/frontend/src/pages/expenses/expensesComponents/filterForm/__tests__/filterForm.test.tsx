import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import type { Category } from "@extropy/shared";

import { FilterForm } from "../";

describe("FilterForm", () => {
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

  const renderFilterForm = (
    isDisabled = false,
    customCategories = categories
  ) => {
    const router = createMemoryRouter([
      {
        path: "/",
        element: (
          <FilterForm categories={customCategories} isDisabled={isDisabled} />
        ),
      },
    ]);

    return render(<RouterProvider router={router} />);
  };

  it("should render the From date input", () => {
    renderFilterForm();

    expect(screen.getByLabelText("From")).toBeInTheDocument();
  });

  it("should render the To date input", () => {
    renderFilterForm();

    expect(screen.getByLabelText("To")).toBeInTheDocument();
  });

  it("should render the Category select", () => {
    renderFilterForm();

    expect(screen.getByLabelText("Category")).toBeInTheDocument();
  });

  it("should render the Filter button", () => {
    renderFilterForm();

    expect(screen.getByRole("button", { name: "Filter" })).toBeInTheDocument();
  });

  it("should render all categories", () => {
    renderFilterForm();

    expect(
      screen.getByRole("option", { name: "All categories" })
    ).toBeInTheDocument();

    expect(screen.getByRole("option", { name: "Food" })).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Transport" })
    ).toBeInTheDocument();

    expect(screen.getByRole("option", { name: "Bills" })).toBeInTheDocument();
  });

  it("should select All categories by default", () => {
    renderFilterForm();

    expect(screen.getByLabelText("Category")).toHaveValue("");
  });

  it("should use GET as the form method", () => {
    renderFilterForm();

    const form = screen.getByRole("form");

    expect(form).toHaveAttribute("method", "get");
  });

  it("should render date inputs with the expected type", () => {
    renderFilterForm();

    expect(screen.getByLabelText("From")).toHaveAttribute("type", "date");

    expect(screen.getByLabelText("To")).toHaveAttribute("type", "date");
  });

  it("should make the date inputs optional", () => {
    renderFilterForm();

    expect(screen.getByLabelText("From")).not.toBeRequired();

    expect(screen.getByLabelText("To")).not.toBeRequired();
  });

  it("should set today's date as the maximum for both date inputs initially", () => {
    renderFilterForm();

    const today = new Date().toISOString().split("T")[0];

    expect(screen.getByLabelText("From")).toHaveAttribute("max", today);

    expect(screen.getByLabelText("To")).toHaveAttribute("max", today);
  });

  it("should update the To minimum when a start date is selected", async () => {
    const user = userEvent.setup();

    renderFilterForm();

    const fromInput = screen.getByLabelText("From");
    const toInput = screen.getByLabelText("To");

    await user.type(fromInput, "2026-08-10");

    expect(toInput).toHaveAttribute("min", "2026-08-10");
  });

  it("should update the From maximum when an end date is selected", async () => {
    const user = userEvent.setup();

    renderFilterForm();

    const fromInput = screen.getByLabelText("From");
    const toInput = screen.getByLabelText("To");

    await user.type(toInput, "2026-08-20");

    expect(fromInput).toHaveAttribute("max", "2026-08-20");
  });

  it("should keep today's date as the maximum when no end date is selected", () => {
    renderFilterForm();

    const today = new Date().toISOString().split("T")[0];

    expect(screen.getByLabelText("From")).toHaveAttribute("max", today);
  });

  it("should update the selected date values", async () => {
    const user = userEvent.setup();

    renderFilterForm();

    const fromInput = screen.getByLabelText("From");
    const toInput = screen.getByLabelText("To");

    await user.type(fromInput, "2026-08-10");
    await user.type(toInput, "2026-08-20");

    expect(fromInput).toHaveValue("2026-08-10");
    expect(toInput).toHaveValue("2026-08-20");
  });

  it("should disable the Filter button when isDisabled is true", () => {
    renderFilterForm(true);

    expect(screen.getByRole("button", { name: "Filter" })).toBeDisabled();
  });

  it("should enable the Filter button when isDisabled is false", () => {
    renderFilterForm(false);

    expect(screen.getByRole("button", { name: "Filter" })).not.toBeDisabled();
  });

  it("should allow selecting a category", async () => {
    const user = userEvent.setup();

    renderFilterForm();

    const select = screen.getByLabelText("Category");

    await user.selectOptions(select, "transport");

    expect(select).toHaveValue("transport");
  });

  it("should render correctly when there are no categories", () => {
    renderFilterForm(false, []);

    expect(
      screen.getByRole("option", { name: "All categories" })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("option", { name: "Food" })
    ).not.toBeInTheDocument();
  });

  it("should have the expected form fields", () => {
    renderFilterForm();

    expect(screen.getByLabelText("From")).toHaveAttribute("name", "startDate");

    expect(screen.getByLabelText("To")).toHaveAttribute("name", "endDate");

    expect(screen.getByLabelText("Category")).toHaveAttribute(
      "name",
      "categoryId"
    );
  });

  it("should render the Filter button as a submit button", () => {
    renderFilterForm();

    expect(screen.getByRole("button", { name: "Filter" })).toHaveAttribute(
      "type",
      "submit"
    );
  });

  it("should have the expected responsive form classes", () => {
    const { container } = renderFilterForm();

    const form = container.querySelector("form");

    expect(form).toHaveClass(
      "grid",
      "w-full",
      "grid-cols-4",
      "items-end",
      "gap-4",
      "max-lg:grid-cols-2",
      "max-sm:grid-cols-1"
    );
  });
});
