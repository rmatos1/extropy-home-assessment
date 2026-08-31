import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ActionsRow } from "../";

describe("ActionsRow", () => {
  it("should render Edit and Delete buttons", () => {
    render(
      <ActionsRow
        isDisabled={false}
        onClickEdit={vi.fn()}
        onClickDelete={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("should render both buttons with type button", () => {
    render(
      <ActionsRow
        isDisabled={false}
        onClickEdit={vi.fn()}
        onClickDelete={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Edit" })).toHaveAttribute(
      "type",
      "button"
    );

    expect(screen.getByRole("button", { name: "Delete" })).toHaveAttribute(
      "type",
      "button"
    );
  });

  it("should call onClickEdit when Edit is clicked", async () => {
    const user = userEvent.setup();
    const onClickEdit = vi.fn();

    render(
      <ActionsRow
        isDisabled={false}
        onClickEdit={onClickEdit}
        onClickDelete={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(onClickEdit).toHaveBeenCalledTimes(1);
  });

  it("should call onClickDelete when Delete is clicked", async () => {
    const user = userEvent.setup();
    const onClickDelete = vi.fn();

    render(
      <ActionsRow
        isDisabled={false}
        onClickEdit={vi.fn()}
        onClickDelete={onClickDelete}
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(onClickDelete).toHaveBeenCalledTimes(1);
  });

  it("should not call onClickEdit when disabled", async () => {
    const user = userEvent.setup();
    const onClickEdit = vi.fn();

    render(
      <ActionsRow
        isDisabled
        onClickEdit={onClickEdit}
        onClickDelete={vi.fn()}
      />
    );

    const button = screen.getByRole("button", {
      name: "Edit",
    });

    expect(button).toBeDisabled();

    await user.click(button);

    expect(onClickEdit).not.toHaveBeenCalled();
  });

  it("should not call onClickDelete when disabled", async () => {
    const user = userEvent.setup();
    const onClickDelete = vi.fn();

    render(
      <ActionsRow
        isDisabled
        onClickEdit={vi.fn()}
        onClickDelete={onClickDelete}
      />
    );

    const button = screen.getByRole("button", {
      name: "Delete",
    });

    expect(button).toBeDisabled();

    await user.click(button);

    expect(onClickDelete).not.toHaveBeenCalled();
  });

  it("should disable both buttons when isDisabled is true", () => {
    render(
      <ActionsRow isDisabled onClickEdit={vi.fn()} onClickDelete={vi.fn()} />
    );

    expect(screen.getByRole("button", { name: "Edit" })).toBeDisabled();

    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });

  it("should enable both buttons when isDisabled is false", () => {
    render(
      <ActionsRow
        isDisabled={false}
        onClickEdit={vi.fn()}
        onClickDelete={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Edit" })).not.toBeDisabled();

    expect(screen.getByRole("button", { name: "Delete" })).not.toBeDisabled();
  });

  it("should render the expected classes on the Edit button", () => {
    render(
      <ActionsRow
        isDisabled={false}
        onClickEdit={vi.fn()}
        onClickDelete={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Edit" })).toHaveClass(
      "text-sm",
      "font-medium",
      "cursor-pointer",
      "text-blue-500"
    );
  });

  it("should render the expected classes on the Delete button", () => {
    render(
      <ActionsRow
        isDisabled={false}
        onClickEdit={vi.fn()}
        onClickDelete={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass(
      "text-sm",
      "font-medium",
      "cursor-pointer",
      "text-red-500"
    );
  });
});
