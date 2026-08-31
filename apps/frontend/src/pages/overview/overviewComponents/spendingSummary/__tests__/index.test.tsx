import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SpendingSummary } from "../";

describe("SpendingSummary", () => {
  it("should render the monthly spending card", () => {
    render(<SpendingSummary totalThisMonth={1250.5} totalThisYear={9850} />);

    expect(screen.getByText("This month")).toBeInTheDocument();

    expect(screen.getByText("$1,250.50")).toBeInTheDocument();
  });

  it("should render the yearly spending card", () => {
    render(<SpendingSummary totalThisMonth={1250.5} totalThisYear={9850} />);

    expect(screen.getByText("This year")).toBeInTheDocument();

    expect(screen.getByText("$9,850.00")).toBeInTheDocument();
  });

  it("should render both spending values", () => {
    render(<SpendingSummary totalThisMonth={500} totalThisYear={3000} />);

    expect(screen.getByText("$500.00")).toBeInTheDocument();

    expect(screen.getByText("$3,000.00")).toBeInTheDocument();
  });

  it("should format zero values as currency", () => {
    render(<SpendingSummary totalThisMonth={0} totalThisYear={0} />);

    expect(screen.getAllByText("$0.00")).toHaveLength(2);
  });

  it("should format decimal values as USD currency", () => {
    render(<SpendingSummary totalThisMonth={123.45} totalThisYear={6789.1} />);

    expect(screen.getByText("$123.45")).toBeInTheDocument();

    expect(screen.getByText("$6,789.10")).toBeInTheDocument();
  });

  it("should render exactly two spending cards", () => {
    render(<SpendingSummary totalThisMonth={100} totalThisYear={1000} />);

    expect(screen.getByText("This month")).toBeInTheDocument();

    expect(screen.getByText("This year")).toBeInTheDocument();
  });
});
