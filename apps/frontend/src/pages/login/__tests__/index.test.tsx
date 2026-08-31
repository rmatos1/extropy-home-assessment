import type { FormHTMLAttributes } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import toast from "react-hot-toast";

import { Login } from "../";

const useActionDataMock = vi.fn();
const useNavigationMock = vi.fn();

vi.mock("react-router", () => ({
  Form: ({ children, ...props }: FormHTMLAttributes<HTMLFormElement>) => (
    <form {...props}>{children}</form>
  ),

  useActionData: () => useActionDataMock(),
  useNavigation: () => useNavigationMock(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
  },
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
  },
}));

vi.mock("../../../components", () => ({
  ActionButton: ({
    text,
    type,
    customClasses,
    isProcessing,
    isDisabled,
  }: {
    text: string;
    type?: "button" | "submit";
    customClasses?: string;
    isProcessing?: boolean;
    isDisabled?: boolean;
  }) => (
    <button type={type} className={customClasses} disabled={isDisabled}>
      {isProcessing ? "Processing..." : text}
    </button>
  ),

  InputGroup: ({
    label,
    name,
    type,
    autoCompleteType,
  }: {
    label?: string;
    name: string;
    type: string;
    autoCompleteType?: string;
  }) => (
    <div>
      {label && <label htmlFor={name}>{label}</label>}
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoCompleteType}
      />
    </div>
  ),

  PasswordInput: () => (
    <input aria-label="Password" name="password" type="password" />
  ),

  LinkComponent: ({ to, text }: { to: string; text: string }) => (
    <a href={to}>{text}</a>
  ),
}));

const toastErrorMock = vi.mocked(toast.error);

describe("Login", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    useActionDataMock.mockReturnValue(undefined);

    useNavigationMock.mockReturnValue({
      state: "idle",
    });
  });

  it("should render the page title", () => {
    render(<Login />);

    expect(
      screen.getByRole("heading", {
        name: "Access your account",
      })
    ).toBeInTheDocument();
  });

  it("should render the email input", () => {
    render(<Login />);

    const input = screen.getByLabelText("Email");

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("autocomplete", "email");
  });

  it("should render the password input", () => {
    render(<Login />);

    const input = screen.getByLabelText("Password");

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("name", "password");
    expect(input).toHaveAttribute("type", "password");
  });

  it("should render the login button", () => {
    render(<Login />);

    expect(
      screen.getByRole("button", {
        name: "Log in",
      })
    ).toBeInTheDocument();
  });

  it("should render the form with POST method", () => {
    render(<Login />);

    const form = document.querySelector("form");

    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute("method", "post");
  });

  it("should render the signup link", () => {
    render(<Login />);

    const link = screen.getByRole("link", {
      name: "Create one here",
    });

    expect(link).toHaveAttribute("href", "/signup");
  });

  it("should show the error toast when action data contains an error", () => {
    useActionDataMock.mockReturnValue({
      error: "Invalid email or password.",
    });

    render(<Login />);

    expect(toastErrorMock).toHaveBeenCalledTimes(1);
    expect(toastErrorMock).toHaveBeenCalledWith("Invalid email or password.");
  });

  it("should not show an error toast when there is no action error", () => {
    useActionDataMock.mockReturnValue({
      success: true,
    });

    render(<Login />);

    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  it("should show the processing state while submitting", () => {
    useNavigationMock.mockReturnValue({
      state: "submitting",
    });

    render(<Login />);

    expect(
      screen.getByRole("button", {
        name: "Processing...",
      })
    ).toBeInTheDocument();
  });

  it("should disable the login button while submitting", () => {
    useNavigationMock.mockReturnValue({
      state: "submitting",
    });

    render(<Login />);

    expect(
      screen.getByRole("button", {
        name: "Processing...",
      })
    ).toBeDisabled();
  });

  it("should keep the login button enabled when not submitting", () => {
    useNavigationMock.mockReturnValue({
      state: "idle",
    });

    render(<Login />);

    expect(
      screen.getByRole("button", {
        name: "Log in",
      })
    ).not.toBeDisabled();
  });

  it("should render the login button as a submit button", () => {
    render(<Login />);

    expect(
      screen.getByRole("button", {
        name: "Log in",
      })
    ).toHaveAttribute("type", "submit");
  });

  it("should render the expected form fields", () => {
    render(<Login />);

    expect(document.querySelector('input[name="email"]')).toBeInTheDocument();

    expect(
      document.querySelector('input[name="password"]')
    ).toBeInTheDocument();
  });
});
