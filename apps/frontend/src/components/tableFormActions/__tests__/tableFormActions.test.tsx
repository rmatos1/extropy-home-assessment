import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TableFormActions } from "../";

describe("TableFormActions", () => {
  it("should render Save when not saving and not editing", () => {
    render(
      <TableFormActions isSaving={false} isEditing={false} onCancel={vi.fn()} />
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("should render Save when isEditing is undefined", () => {
    render(<TableFormActions isSaving={false} onCancel={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("should render Update when editing", () => {
    render(<TableFormActions isSaving={false} isEditing onCancel={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Save" })
    ).not.toBeInTheDocument();
  });

  it("should render Saving when isSaving is true", () => {
    render(<TableFormActions isSaving isEditing={false} onCancel={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: "Saving..." })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Save" })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Update" })
    ).not.toBeInTheDocument();
  });

  it("should render the loading spinner when saving", () => {
    const { container } = render(
      <TableFormActions isSaving onCancel={vi.fn()} />
    );

    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should not render the loading spinner when not saving", () => {
    const { container } = render(
      <TableFormActions isSaving={false} onCancel={vi.fn()} />
    );

    expect(container.querySelector(".animate-spin")).not.toBeInTheDocument();
  });

  it("should disable the submit button while saving", () => {
    render(<TableFormActions isSaving onCancel={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  });

  it("should disable the cancel button while saving", () => {
    render(<TableFormActions isSaving onCancel={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("should enable both buttons when not saving", () => {
    render(<TableFormActions isSaving={false} onCancel={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Save" })).not.toBeDisabled();

    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeDisabled();
  });

  it("should call onCancel when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<TableFormActions isSaving={false} onCancel={onCancel} />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should not call onCancel when Cancel is disabled", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<TableFormActions isSaving onCancel={onCancel} />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).not.toHaveBeenCalled();
  });

  it("should use submit type for the primary button", () => {
    render(<TableFormActions isSaving={false} onCancel={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "type",
      "submit"
    );
  });

  it("should use button type for the Cancel button", () => {
    render(<TableFormActions isSaving={false} onCancel={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Cancel" })).toHaveAttribute(
      "type",
      "button"
    );
  });

  it("should render the form attribute when provided", () => {
    render(
      <TableFormActions
        isSaving={false}
        onCancel={vi.fn()}
        form="expense-form"
      />
    );

    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "form",
      "expense-form"
    );
  });

  it("should not render a form attribute when it is not provided", () => {
    render(<TableFormActions isSaving={false} onCancel={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Save" })).not.toHaveAttribute(
      "form"
    );
  });

  it("should prioritize saving state over editing state", () => {
    render(<TableFormActions isSaving isEditing onCancel={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: "Saving..." })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Update" })
    ).not.toBeInTheDocument();
  });
});
