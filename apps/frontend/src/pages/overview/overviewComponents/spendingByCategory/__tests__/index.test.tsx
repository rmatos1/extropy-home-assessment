import type { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Category } from "@extropy/shared";

import { SpendingByCategory } from "../";

const pieMock = vi.fn();
const tooltipMock = vi.fn();

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),

  PieChart: ({ children }: { children: ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),

  Pie: ({
    data,
    dataKey,
    nameKey,
    label,
    children,
  }: {
    data: unknown[];
    dataKey: string;
    nameKey: string;
    label?: unknown;
    children: ReactNode;
  }) => {
    pieMock({
      data,
      dataKey,
      nameKey,
      label,
    });

    return <div data-testid="pie">{children}</div>;
  },

  Cell: ({ fill }: { fill: string }) => (
    <div data-testid="cell" data-fill={fill} />
  ),

  Tooltip: ({ formatter }: { formatter?: (value: unknown) => string }) => {
    tooltipMock(formatter);

    return <div data-testid="tooltip" />;
  },

  Legend: () => <div data-testid="legend" />,
}));

describe("SpendingByCategory", () => {
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

  const data = [
    {
      categoryId: "food",
      amount: 250,
    },
    {
      categoryId: "transport",
      amount: 100.5,
    },
    {
      categoryId: "bills",
      amount: 75,
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should render the section title", () => {
    render(<SpendingByCategory data={data} categories={categories} />);

    expect(
      screen.getByRole("heading", {
        name: "Spending by category",
      })
    ).toBeInTheDocument();
  });

  it("should render the empty state when there is no data", () => {
    render(<SpendingByCategory data={[]} categories={categories} />);

    expect(
      screen.getByText("There isn't any spending by category yet.")
    ).toBeInTheDocument();

    expect(screen.queryByTestId("pie-chart")).not.toBeInTheDocument();
  });

  it("should render the chart when data is provided", () => {
    render(<SpendingByCategory data={data} categories={categories} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();

    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("should transform category ids into category names", () => {
    render(<SpendingByCategory data={data} categories={categories} />);

    expect(pieMock).toHaveBeenCalledTimes(1);

    const pieProps = pieMock.mock.calls[0][0];

    expect(pieProps.data).toEqual([
      {
        categoryId: "food",
        amount: 250,
        categoryName: "Food",
      },
      {
        categoryId: "transport",
        amount: 100.5,
        categoryName: "Transport",
      },
      {
        categoryId: "bills",
        amount: 75,
        categoryName: "Bills",
      },
    ]);
  });

  it("should use the category id when the category is not found", () => {
    render(
      <SpendingByCategory
        data={[
          {
            categoryId: "unknown",
            amount: 50,
          },
        ]}
        categories={categories}
      />
    );

    const pieProps = pieMock.mock.calls[0][0];

    expect(pieProps.data).toEqual([
      {
        categoryId: "unknown",
        amount: 50,
        categoryName: "unknown",
      },
    ]);
  });

  it("should configure the Pie with amount as the data key", () => {
    render(<SpendingByCategory data={data} categories={categories} />);

    const pieProps = pieMock.mock.calls[0][0];

    expect(pieProps.dataKey).toBe("amount");
  });

  it("should configure the Pie with categoryName as the name key", () => {
    render(<SpendingByCategory data={data} categories={categories} />);

    const pieProps = pieMock.mock.calls[0][0];

    expect(pieProps.nameKey).toBe("categoryName");
  });

  it("should render one Cell for each category", () => {
    render(<SpendingByCategory data={data} categories={categories} />);

    expect(screen.getAllByTestId("cell")).toHaveLength(data.length);
  });

  it("should assign a color to every category cell", () => {
    render(<SpendingByCategory data={data} categories={categories} />);

    const cells = screen.getAllByTestId("cell");

    cells.forEach((cell) => {
      expect(cell).toHaveAttribute("data-fill");
      expect(cell.getAttribute("data-fill")).not.toBe("");
    });
  });

  it("should render the tooltip", () => {
    render(<SpendingByCategory data={data} categories={categories} />);

    expect(screen.getByTestId("tooltip")).toBeInTheDocument();

    expect(tooltipMock).toHaveBeenCalledTimes(1);
  });

  it("should render the legend", () => {
    render(<SpendingByCategory data={data} categories={categories} />);

    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });

  it("should format tooltip values as currency", () => {
    render(<SpendingByCategory data={data} categories={categories} />);

    const formatter = tooltipMock.mock.calls[0][0];

    expect(formatter).toBeTypeOf("function");
    expect(formatter(250)).toBe("$250.00");
    expect(formatter(100.5)).toBe("$100.50");
  });

  it("should format the pie labels using the category name and currency", () => {
    render(<SpendingByCategory data={data} categories={categories} />);

    const pieProps = pieMock.mock.calls[0][0];

    expect(pieProps.label).toBeTypeOf("function");

    expect(
      pieProps.label({
        payload: {
          categoryName: "Food",
        },
        value: 250,
      })
    ).toBe("Food: $250.00");

    expect(
      pieProps.label({
        payload: {
          categoryName: "Transport",
        },
        value: 100.5,
      })
    ).toBe("Transport: $100.50");
  });

  it("should render correctly when categories is empty", () => {
    render(
      <SpendingByCategory
        data={[
          {
            categoryId: "food",
            amount: 250,
          },
        ]}
        categories={[]}
      />
    );

    const pieProps = pieMock.mock.calls[0][0];

    expect(pieProps.data).toEqual([
      {
        categoryId: "food",
        amount: 250,
        categoryName: "food",
      },
    ]);
  });

  it("should preserve the original expense amounts", () => {
    render(<SpendingByCategory data={data} categories={categories} />);

    const pieProps = pieMock.mock.calls[0][0];

    expect(
      pieProps.data.map((item: { amount: number }) => item.amount)
    ).toEqual([250, 100.5, 75]);
  });
});
