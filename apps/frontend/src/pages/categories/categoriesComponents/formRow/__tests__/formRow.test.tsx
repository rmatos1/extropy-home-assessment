import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FormRow } from "../";

vi.mock("../../../../../components", () => ({
  InputGroup: ({ name, type }: { name: string; type: string }) => (
    <input data-testid="category-input" name={name} type={type} />
  ),

  TableFormActions: ({
    isSaving,
    onCancel,
  }: {
    isSaving: boolean;
    onCancel: () => void;
  }) => (
    <div>
      <button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save"}
      </button>

      <button type="button" disabled={isSaving} onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

const createFetcher = () => ({
  Form: ({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>) => (
    <form {...props}>{children}</form>
  ),
});

describe("FormRow", () => {
  it("should render the category input", () => {
    const fetcher = createFetcher();

    render(
      <table>
        <tbody>
          <FormRow
            fetcher={fetcher as never}
            isSaving={false}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    const input = screen.getByTestId("category-input");

    expect(input).toHaveAttribute("name", "categoryName");
    expect(input).toHaveAttribute("type", "text");
  });

  it("should render a form with post method", () => {
    const fetcher = createFetcher();

    const { container } = render(
      <table>
        <tbody>
          <FormRow
            fetcher={fetcher as never}
            isSaving={false}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    const form = container.querySelector("form");

    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute("method", "post");
  });

  it("should render Save and Cancel actions when not saving", () => {
    const fetcher = createFetcher();

    render(
      <table>
        <tbody>
          <FormRow
            fetcher={fetcher as never}
            isSaving={false}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("should render saving state", () => {
    const fetcher = createFetcher();

    render(
      <table>
        <tbody>
          <FormRow fetcher={fetcher as never} isSaving onCancel={vi.fn()} />
        </tbody>
      </table>
    );

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("should call onCancel when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    const fetcher = createFetcher();

    render(
      <table>
        <tbody>
          <FormRow
            fetcher={fetcher as never}
            isSaving={false}
            onCancel={onCancel}
          />
        </tbody>
      </table>
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should forward the ref to the form", () => {
    const fetcher = createFetcher();

    const ref = { current: null as HTMLFormElement | null };

    render(
      <table>
        <tbody>
          <FormRow
            ref={ref}
            fetcher={fetcher as never}
            isSaving={false}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    expect(ref.current).toBeInstanceOf(HTMLFormElement);
    expect(ref.current).toHaveAttribute("method", "post");
  });

  it("should render the expected form classes", () => {
    const fetcher = createFetcher();

    const { container } = render(
      <table>
        <tbody>
          <FormRow
            fetcher={fetcher as never}
            isSaving={false}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    const form = container.querySelector("form");

    expect(form).toHaveClass("flex", "gap-4", "max-sm:flex-col");
  });

  it("should render the form inside a table row", () => {
    const fetcher = createFetcher();

    render(
      <table>
        <tbody>
          <FormRow
            fetcher={fetcher as never}
            isSaving={false}
            onCancel={vi.fn()}
          />
        </tbody>
      </table>
    );

    expect(screen.getByRole("row")).toBeInTheDocument();
  });
});
