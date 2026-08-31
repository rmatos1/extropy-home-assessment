import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InputGroup } from "../";

describe("InputGroup", () => {
  it("should render an input with the provided name and type", () => {
    render(<InputGroup name="email" type="email" />);

    const input = screen.getByRole("textbox");

    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("type", "email");
  });

  it("should render the label when provided", () => {
    render(<InputGroup label="Email" name="email" type="email" />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("should not render a label when it is not provided", () => {
    render(<InputGroup name="email" type="email" />);

    expect(screen.queryByText("Email")).not.toBeInTheDocument();
  });

  it("should use the default value", () => {
    render(
      <InputGroup
        name="description"
        type="text"
        defaultValue="Electricity bill"
      />
    );

    expect(screen.getByRole("textbox")).toHaveValue("Electricity bill");
  });

  it("should use the provided value", () => {
    render(
      <InputGroup
        name="description"
        type="text"
        value="Electricity bill"
        onChange={() => undefined}
      />
    );

    expect(screen.getByRole("textbox")).toHaveValue("Electricity bill");
  });

  it("should call onChange when the value changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<InputGroup name="description" type="text" onChange={onChange} />);

    const input = screen.getByRole("textbox");

    await user.type(input, "Food");

    expect(onChange).toHaveBeenCalled();
  });

  it("should be required by default", () => {
    render(<InputGroup name="email" type="email" />);

    expect(screen.getByRole("textbox")).toBeRequired();
  });

  it("should not be required when isRequired is false", () => {
    render(<InputGroup name="email" type="email" isRequired={false} />);

    expect(screen.getByRole("textbox")).not.toBeRequired();
  });

  it("should render the minLength attribute", () => {
    render(<InputGroup name="description" type="text" minLength={3} />);

    expect(screen.getByRole("textbox")).toHaveAttribute("minlength", "3");
  });

  it("should render the maxLength attribute", () => {
    render(<InputGroup name="description" type="text" maxLength={100} />);

    expect(screen.getByRole("textbox")).toHaveAttribute("maxlength", "100");
  });

  it("should render the inputMode attribute", () => {
    render(<InputGroup name="amount" type="text" inputMode="decimal" />);

    expect(screen.getByRole("textbox")).toHaveAttribute("inputmode", "decimal");
  });

  it("should render the pattern attribute", () => {
    render(<InputGroup name="amount" type="text" pattern="[0-9]+" />);

    expect(screen.getByRole("textbox")).toHaveAttribute("pattern", "[0-9]+");
  });

  it("should render the autocomplete attribute", () => {
    render(<InputGroup name="email" type="email" autoCompleteType="email" />);

    expect(screen.getByRole("textbox")).toHaveAttribute(
      "autocomplete",
      "email"
    );
  });

  it("should render the form attribute", () => {
    render(<InputGroup name="description" type="text" form="expense-form" />);

    expect(screen.getByRole("textbox")).toHaveAttribute("form", "expense-form");
  });

  it("should render the end adornment", () => {
    render(
      <InputGroup name="amount" type="text" endAdornment={<span>USD</span>} />
    );

    expect(screen.getByText("USD")).toBeInTheDocument();
  });

  it("should forward the ref to the input element", () => {
    const ref = { current: null as HTMLInputElement | null };

    render(<InputGroup ref={ref} name="amount" type="text" />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toHaveAttribute("name", "amount");
  });

  it("should render the correct input type for date", () => {
    render(<InputGroup name="date" type="date" />);

    expect(document.querySelector('input[name="date"]')).toHaveAttribute(
      "type",
      "date"
    );
  });

  it("should render password input correctly", () => {
    render(<InputGroup name="password" type="password" />);

    expect(document.querySelector('input[name="password"]')).toHaveAttribute(
      "type",
      "password"
    );
  });
});
