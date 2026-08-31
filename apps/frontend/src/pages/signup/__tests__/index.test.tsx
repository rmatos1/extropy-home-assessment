import type { FormHTMLAttributes } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@extropy/shared";

import { Signup } from "../";

const { useActionDataMock, useNavigationMock, toastErrorMock } = vi.hoisted(
  () => ({
    useActionDataMock: vi.fn(),
    useNavigationMock: vi.fn(),
    toastErrorMock: vi.fn(),
  })
);

vi.mock("react-hot-toast", () => ({
  default: {
    error: toastErrorMock,
  },
}));

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();

  return {
    ...actual,

    Form: ({ children, ...props }: FormHTMLAttributes<HTMLFormElement>) => (
      <form {...props}>{children}</form>
    ),

    useActionData: () => useActionDataMock(),
    useNavigation: () => useNavigationMock(),
  };
});

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

  PasswordInput: ({
    label = "Password",
    autoCompleteType,
  }: {
    label?: string;
    autoCompleteType?: string;
  }) => (
    <input
      aria-label={label}
      name="password"
      type="password"
      autoComplete={autoCompleteType}
    />
  ),

  LinkComponent: ({ to, text }: { to: string; text: string }) => (
    <a href={to}>{text}</a>
  ),
}));

describe("Signup", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    useActionDataMock.mockReturnValue(undefined);

    useNavigationMock.mockReturnValue({
      state: "idle",
    });
  });

  it("should render the page title", () => {
    render(<Signup />);

    expect(
      screen.getByRole("heading", {
        name: "Create your account",
      })
    ).toBeInTheDocument();
  });

  it("should render the password requirements", () => {
    render(<Signup />);

    const paragraphs = screen.getAllByText(/Enter your email and a password/);

    expect(paragraphs[0]).toHaveTextContent(
      `at least ${MIN_PASSWORD_LENGTH} and at most ${MAX_PASSWORD_LENGTH} characters`
    );
  });

  it("should render the minimum password length", () => {
    render(<Signup />);

    expect(
      screen.getByText(String(MIN_PASSWORD_LENGTH), {
        selector: "span",
      })
    ).toBeInTheDocument();
  });

  it("should render the maximum password length", () => {
    render(<Signup />);

    expect(
      screen.getByText(String(MAX_PASSWORD_LENGTH), {
        selector: "span",
      })
    ).toBeInTheDocument();
  });

  it("should render the email input", () => {
    render(<Signup />);

    const input = screen.getByLabelText("Email");

    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("autocomplete", "email");
  });

  it("should render the password input", () => {
    render(<Signup />);

    const input = screen.getByLabelText("Password");

    expect(input).toHaveAttribute("name", "password");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("autocomplete", "new-password");
  });

  it("should render the signup button", () => {
    render(<Signup />);

    const button = screen.getByRole("button", {
      name: "Sign up",
    });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "submit");
  });

  it("should render the form with POST method", () => {
    const { container } = render(<Signup />);

    const form = container.querySelector("form");

    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute("method", "post");
  });

  it("should render the login link", () => {
    render(<Signup />);

    const link = screen.getByRole("link", {
      name: "Log in here",
    });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
  });

  it("should show the error toast when action data contains an error", () => {
    useActionDataMock.mockReturnValue({
      error: "Email already registered",
    });

    render(<Signup />);

    expect(toastErrorMock).toHaveBeenCalledTimes(1);
    expect(toastErrorMock).toHaveBeenCalledWith("Email already registered");
  });

  it("should not show an error toast when there is no action error", () => {
    useActionDataMock.mockReturnValue({
      success: true,
    });

    render(<Signup />);

    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  it("should show the processing state while submitting", () => {
    useNavigationMock.mockReturnValue({
      state: "submitting",
    });

    render(<Signup />);

    expect(
      screen.getByRole("button", {
        name: "Processing...",
      })
    ).toBeInTheDocument();
  });

  it("should disable the signup button while submitting", () => {
    useNavigationMock.mockReturnValue({
      state: "submitting",
    });

    render(<Signup />);

    expect(
      screen.getByRole("button", {
        name: "Processing...",
      })
    ).toBeDisabled();
  });

  it("should keep the signup button enabled when not submitting", () => {
    render(<Signup />);

    expect(
      screen.getByRole("button", {
        name: "Sign up",
      })
    ).not.toBeDisabled();
  });

  it("should render exactly one signup form", () => {
    const { container } = render(<Signup />);

    expect(container.querySelectorAll("form")).toHaveLength(1);
  });
});
