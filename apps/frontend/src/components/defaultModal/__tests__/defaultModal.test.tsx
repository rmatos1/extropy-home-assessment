import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DefaultModal } from "../";

describe("DefaultModal", () => {
  const defaultProps = {
    title: "Delete expense",
    description: "Are you sure you want to delete this expense?",
    onClose: vi.fn(),
    confirmTextButton: "Delete",
    onConfirm: vi.fn(),
  };

  it("should render the title and description", () => {
    render(<DefaultModal {...defaultProps} />);

    expect(
      screen.getByRole("heading", { name: "Delete expense" })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Are you sure you want to delete this expense?")
    ).toBeInTheDocument();
  });

  it("should render Cancel and confirm buttons", () => {
    render(<DefaultModal {...defaultProps} />);

    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("should call onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<DefaultModal {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<DefaultModal {...defaultProps} onClose={onClose} />);

    const backdrop = document.querySelector(".absolute.inset-0");

    expect(backdrop).toBeInTheDocument();

    await user.click(backdrop!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onConfirm when the confirm button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(<DefaultModal {...defaultProps} onConfirm={onConfirm} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should render the processing text when isProcessing is true", () => {
    render(
      <DefaultModal
        {...defaultProps}
        isProcessing
        processingText="Deleting..."
      />
    );

    expect(
      screen.getByRole("button", { name: "Deleting..." })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Delete" })
    ).not.toBeInTheDocument();
  });

  it("should render the processing spinner when isProcessing is true", () => {
    render(
      <DefaultModal
        {...defaultProps}
        isProcessing
        processingText="Deleting..."
      />
    );

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should not render the processing spinner when isProcessing is false", () => {
    render(<DefaultModal {...defaultProps} />);

    expect(document.querySelector(".animate-spin")).not.toBeInTheDocument();
  });

  it("should render the confirm text when isProcessing is false", () => {
    render(<DefaultModal {...defaultProps} isProcessing={false} />);

    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("should render the processing spinner when processingText is not provided", () => {
    render(<DefaultModal {...defaultProps} isProcessing />);

    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should render the modal through a portal", () => {
    render(<DefaultModal {...defaultProps} />);

    expect(
      document.body.contains(
        screen.getByRole("heading", { name: "Delete expense" })
      )
    ).toBe(true);
  });
});
