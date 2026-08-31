import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PaginationButton } from "../";

describe("PaginationButton", () => {
  it("should render the provided text", () => {
    render(
      <PaginationButton onClick={vi.fn()} isDisabled={false} text="Next" />
    );

    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it("should render as a button", () => {
    render(
      <PaginationButton onClick={vi.fn()} isDisabled={false} text="Next" />
    );

    expect(screen.getByRole("button", { name: "Next" })).toHaveAttribute(
      "type",
      "button"
    );
  });

  it("should call onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <PaginationButton onClick={onClick} isDisabled={false} text="Next" />
    );

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<PaginationButton onClick={onClick} isDisabled text="Next" />);

    const button = screen.getByRole("button", {
      name: "Next",
    });

    expect(button).toBeDisabled();

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("should be enabled when isDisabled is false", () => {
    render(
      <PaginationButton onClick={vi.fn()} isDisabled={false} text="Previous" />
    );

    expect(screen.getByRole("button", { name: "Previous" })).not.toBeDisabled();
  });

  it("should render the disabled attribute when isDisabled is true", () => {
    render(<PaginationButton onClick={vi.fn()} isDisabled text="Previous" />);

    expect(screen.getByRole("button", { name: "Previous" })).toHaveAttribute(
      "disabled"
    );
  });

  it("should render the provided text exactly", () => {
    render(
      <PaginationButton onClick={vi.fn()} isDisabled={false} text="Rows" />
    );

    expect(screen.getByRole("button", { name: "Rows" })).toHaveTextContent(
      "Rows"
    );
  });

  it("should render the expected classes", () => {
    render(
      <PaginationButton onClick={vi.fn()} isDisabled={false} text="Next" />
    );

    expect(screen.getByRole("button", { name: "Next" })).toHaveClass(
      "rounded-md",
      "border",
      "border-gray-300",
      "px-3",
      "py-1.5",
      "text-sm",
      "font-medium",
      "text-gray-700"
    );
  });
});
