import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { ActionButton } from "../";

describe("ActionButton", () => {
  it("should render the provided text", () => {
    render(<ActionButton text="Add expense" />);

    expect(
      screen.getByRole("button", { name: "Add expense" })
    ).toBeInTheDocument();
  });

  it("should use button type by default", () => {
    render(<ActionButton text="Add expense" />);

    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("should render the provided button type", () => {
    render(<ActionButton text="Save" type="submit" />);

    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("should call onClick when clicked", () => {
    const onClick = vi.fn();

    render(<ActionButton text="Add expense" onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Add expense" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should not call onClick when disabled", () => {
    const onClick = vi.fn();

    render(<ActionButton text="Add expense" onClick={onClick} isDisabled />);

    const button = screen.getByRole("button");

    expect(button).toBeDisabled();

    fireEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it("should render the name attribute", () => {
    render(<ActionButton text="Save" name="intent" />);

    expect(screen.getByRole("button")).toHaveAttribute("name", "intent");
  });

  it("should render the value attribute", () => {
    render(<ActionButton text="Save" value="update" />);

    expect(screen.getByRole("button")).toHaveAttribute("value", "update");
  });

  it("should render processing state", () => {
    render(<ActionButton text="Save" isProcessing />);

    expect(
      screen.getByRole("button", { name: "Processing..." })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Save" })
    ).not.toBeInTheDocument();
  });

  it("should render the loading spinner when processing", () => {
    const { container } = render(<ActionButton text="Save" isProcessing />);

    const spinner = container.querySelector(".animate-spin");

    expect(spinner).toBeInTheDocument();
  });

  it("should not render the loading spinner when not processing", () => {
    const { container } = render(<ActionButton text="Save" />);

    const spinner = container.querySelector(".animate-spin");

    expect(spinner).not.toBeInTheDocument();
  });

  it("should render custom classes", () => {
    render(
      <ActionButton text="Add expense" customClasses="px-4 max-md:self-end" />
    );

    expect(screen.getByRole("button")).toHaveClass("px-4", "max-md:self-end");
  });

  it("should be disabled when isDisabled is true", () => {
    render(<ActionButton text="Save" isDisabled />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should remain enabled when isDisabled is false", () => {
    render(<ActionButton text="Save" isDisabled={false} />);

    expect(screen.getByRole("button")).not.toBeDisabled();
  });
});
