import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@extropy/shared";

import { PasswordInput } from "../";

describe("PasswordInput", () => {
  it("should render with the default label", () => {
    render(<PasswordInput />);

    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("should render with a custom label", () => {
    render(<PasswordInput label="Confirm password" />);

    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
  });

  it("should render the input as a password by default", () => {
    render(<PasswordInput />);

    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password"
    );
  });

  it("should render the default autocomplete type", () => {
    render(<PasswordInput />);

    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "current-password"
    );
  });

  it("should render the provided autocomplete type", () => {
    render(<PasswordInput autoCompleteType="new-password" />);

    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "autocomplete",
      "new-password"
    );
  });

  it("should render the password length constraints", () => {
    render(<PasswordInput />);

    const input = screen.getByLabelText("Password");

    expect(input).toHaveAttribute("minlength", String(MIN_PASSWORD_LENGTH));

    expect(input).toHaveAttribute("maxlength", String(MAX_PASSWORD_LENGTH));
  });

  it("should render the Show password button", () => {
    render(<PasswordInput />);

    expect(
      screen.getByRole("button", {
        name: "Show password",
      })
    ).toBeInTheDocument();
  });

  it("should show the password when the toggle button is clicked", async () => {
    const user = userEvent.setup();

    render(<PasswordInput />);

    const input = screen.getByLabelText("Password");

    await user.click(
      screen.getByRole("button", {
        name: "Show password",
      })
    );

    expect(input).toHaveAttribute("type", "text");

    expect(
      screen.getByRole("button", {
        name: "Hide password",
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", {
        name: "Show password",
      })
    ).not.toBeInTheDocument();
  });

  it("should hide the password when the toggle button is clicked again", async () => {
    const user = userEvent.setup();

    render(<PasswordInput />);

    const input = screen.getByLabelText("Password");

    const toggleButton = screen.getByRole("button", {
      name: "Show password",
    });

    await user.click(toggleButton);

    expect(input).toHaveAttribute("type", "text");

    await user.click(
      screen.getByRole("button", {
        name: "Hide password",
      })
    );

    expect(input).toHaveAttribute("type", "password");

    expect(
      screen.getByRole("button", {
        name: "Show password",
      })
    ).toBeInTheDocument();
  });

  it("should preserve the entered password when toggling visibility", async () => {
    const user = userEvent.setup();

    render(<PasswordInput />);

    const input = screen.getByLabelText("Password");

    await user.type(input, "password123");

    await user.click(
      screen.getByRole("button", {
        name: "Show password",
      })
    );

    expect(input).toHaveValue("password123");

    await user.click(
      screen.getByRole("button", {
        name: "Hide password",
      })
    );

    expect(input).toHaveValue("password123");
    expect(input).toHaveAttribute("type", "password");
  });
});
