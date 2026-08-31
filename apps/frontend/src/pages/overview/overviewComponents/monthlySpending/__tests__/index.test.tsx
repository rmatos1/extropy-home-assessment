import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MonthlySpending } from "../";

const barChartMock = vi.fn();

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),

  BarChart: ({
    data,
    children,
  }: {
    data: unknown[];
    children: React.ReactNode;
  }) => {
    barChartMock(data);

    return <div data-testid="bar-chart">{children}</div>;
  },

  CartesianGrid: () => <div data-testid="cartesian-grid" />,

  XAxis: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="x-axis" data-data-key={dataKey} />
  ),

  YAxis: () => <div data-testid="y-axis" />,

  Tooltip: () => <div data-testid="tooltip" />,

  Bar: ({ dataKey }: { dataKey: string }) => (
    <div data-testid="bar" data-data-key={dataKey} />
  ),

  Rectangle: () => <div data-testid="rectangle" />,
}));

describe("MonthlySpending", () => {
  const data = [
    {
      month: "2026-08",
      amount: 450.5,
    },
    {
      month: "2026-07",
      amount: 300,
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should render the section title", () => {
    render(<MonthlySpending data={data} />);

    expect(
      screen.getByRole("heading", {
        name: "Monthly spending",
      })
    ).toBeInTheDocument();
  });

  it("should render the empty state when there is no data", () => {
    render(<MonthlySpending data={[]} />);

    expect(
      screen.getByText("There isn't any spending data yet.")
    ).toBeInTheDocument();

    expect(screen.queryByTestId("bar-chart")).not.toBeInTheDocument();
  });

  it("should render the chart when data is provided", () => {
    render(<MonthlySpending data={data} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();

    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("should pass the provided data to BarChart", () => {
    render(<MonthlySpending data={data} />);

    expect(barChartMock).toHaveBeenCalledTimes(1);
    expect(barChartMock).toHaveBeenCalledWith(data);
  });

  it("should configure the X axis with the month data key", () => {
    render(<MonthlySpending data={data} />);

    expect(screen.getByTestId("x-axis")).toHaveAttribute(
      "data-data-key",
      "month"
    );
  });

  it("should configure the Y axis", () => {
    render(<MonthlySpending data={data} />);

    expect(screen.getByTestId("y-axis")).toBeInTheDocument();
  });

  it("should configure the tooltip", () => {
    render(<MonthlySpending data={data} />);

    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });

  it("should configure the bar with the amount data key", () => {
    render(<MonthlySpending data={data} />);

    expect(screen.getByTestId("bar")).toHaveAttribute(
      "data-data-key",
      "amount"
    );
  });

  it("should render the cartesian grid", () => {
    render(<MonthlySpending data={data} />);

    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
  });

  it("should render the chart only when there is at least one data item", () => {
    const { rerender } = render(<MonthlySpending data={data} />);

    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();

    rerender(<MonthlySpending data={[]} />);

    expect(screen.queryByTestId("bar-chart")).not.toBeInTheDocument();

    expect(
      screen.getByText("There isn't any spending data yet.")
    ).toBeInTheDocument();
  });

  it("should use a responsive container for the chart", () => {
    render(<MonthlySpending data={data} />);

    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });
});
