import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@extropy/shared";

import { Profile } from "../";
import { useProfileHelper } from "../useProfileHelper.hook";

const useProfileHelperMock = vi.mocked(useProfileHelper);

vi.mock("../useProfileHelper.hook", () => ({
  useProfileHelper: vi.fn(),
}));

vi.mock("react-router", () => ({
  Form: ({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>) => (
    <form {...props}>{children}</form>
  ),
}));

vi.mock("../../components", () => ({
  InputGroup: ({
    label,
    name,
    type,
    autoCompleteType,
    defaultValue,
  }: {
    label?: string;
    name: string;
    type: string;
    autoCompleteType?: string;
    defaultValue?: string;
  }) => (
    <div>
      {label && <label htmlFor={name}>{label}</label>}

      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoCompleteType}
        defaultValue={defaultValue}
      />
    </div>
  ),

  PasswordInput: ({
    label,
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

  ActionButton: ({
    text,
    type,
    name,
    value,
    isDisabled,
    isProcessing,
  }: {
    text: string;
    type?: "button" | "submit";
    name?: string;
    value?: string;
    isDisabled?: boolean;
    isProcessing?: boolean;
  }) => (
    <button type={type} name={name} value={value} disabled={isDisabled}>
      {isProcessing ? "Processing..." : text}
    </button>
  ),
}));

describe("Profile", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    useProfileHelperMock.mockReturnValue({
      passwordFormRef: {
        current: null,
      },
      email: "john@example.com",
      isSubmitting: false,
      isUpdatingEmail: false,
      isUpdatingPassword: false,
    });
  });

  it("should render the profile instructions", () => {
    render(<Profile />);

    expect(
      screen.getByText(
        new RegExp(
          `Update your email and/or your password.*${MIN_PASSWORD_LENGTH}.*${MAX_PASSWORD_LENGTH}`,
          "i"
        )
      )
    ).toBeInTheDocument();
  });

  it("should render the email input with the current email", () => {
    render(<Profile />);

    const input = screen.getByLabelText("Email");

    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("autocomplete", "email");
    expect(input).toHaveValue("john@example.com");
  });

  it("should render the email update button", () => {
    render(<Profile />);

    const button = screen.getByRole("button", {
      name: "Update email",
    });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("name", "action");
    expect(button).toHaveAttribute("value", "email");
  });

  it("should render the new password field", () => {
    render(<Profile />);

    const input = screen.getByLabelText("New password");

    expect(input).toHaveAttribute("name", "password");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("autocomplete", "new-password");
  });

  it("should render the password update button", () => {
    render(<Profile />);

    const button = screen.getByRole("button", {
      name: "Update password",
    });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("name", "action");
    expect(button).toHaveAttribute("value", "password");
  });

  it("should render two POST forms", () => {
    const { container } = render(<Profile />);

    const forms = container.querySelectorAll("form");

    expect(forms).toHaveLength(2);

    forms.forEach((form) => {
      expect(form).toHaveAttribute("method", "post");
    });
  });

  it("should use different actions for the two forms", () => {
    render(<Profile />);

    expect(
      screen.getByRole("button", {
        name: "Update email",
      })
    ).toHaveAttribute("value", "email");

    expect(
      screen.getByRole("button", {
        name: "Update password",
      })
    ).toHaveAttribute("value", "password");
  });

  it("should disable both buttons while submitting", () => {
    useProfileHelperMock.mockReturnValue({
      passwordFormRef: {
        current: null,
      },
      email: "john@example.com",
      isSubmitting: true,
      isUpdatingEmail: false,
      isUpdatingPassword: false,
    });

    render(<Profile />);

    expect(
      screen.getByRole("button", {
        name: "Update email",
      })
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Update password",
      })
    ).toBeDisabled();
  });

  it("should show processing state for email update", () => {
    useProfileHelperMock.mockReturnValue({
      passwordFormRef: {
        current: null,
      },
      email: "john@example.com",
      isSubmitting: true,
      isUpdatingEmail: true,
      isUpdatingPassword: false,
    });

    render(<Profile />);

    expect(
      screen.getByRole("button", {
        name: "Processing...",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Update password",
      })
    ).not.toHaveTextContent("Processing...");
  });

  it("should show processing state for password update", () => {
    useProfileHelperMock.mockReturnValue({
      passwordFormRef: {
        current: null,
      },
      email: "john@example.com",
      isSubmitting: true,
      isUpdatingEmail: false,
      isUpdatingPassword: true,
    });

    render(<Profile />);

    expect(
      screen.getByRole("button", {
        name: "Processing...",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Update email",
      })
    ).toBeInTheDocument();
  });

  it("should not show processing state when nothing is submitting", () => {
    render(<Profile />);

    expect(
      screen.queryByRole("button", {
        name: "Processing...",
      })
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Update email",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Update password",
      })
    ).toBeInTheDocument();
  });

  it("should attach the password form ref to the second form", () => {
    const passwordFormRef = {
      current: null as HTMLFormElement | null,
    };

    useProfileHelperMock.mockReturnValue({
      passwordFormRef,
      email: "john@example.com",
      isSubmitting: false,
      isUpdatingEmail: false,
      isUpdatingPassword: false,
    });

    const { container } = render(<Profile />);

    const forms = container.querySelectorAll("form");

    expect(forms).toHaveLength(2);
    expect(passwordFormRef.current).toBe(forms[1]);
  });

  it("should render the current email from the helper", () => {
    useProfileHelperMock.mockReturnValue({
      passwordFormRef: {
        current: null,
      },
      email: "mary@example.com",
      isSubmitting: false,
      isUpdatingEmail: false,
      isUpdatingPassword: false,
    });

    render(<Profile />);

    expect(screen.getByLabelText("Email")).toHaveValue("mary@example.com");
  });

  it("should keep the password button enabled when only email is not submitting", () => {
    useProfileHelperMock.mockReturnValue({
      passwordFormRef: {
        current: null,
      },
      email: "john@example.com",
      isSubmitting: false,
      isUpdatingEmail: true,
      isUpdatingPassword: false,
    });

    render(<Profile />);

    expect(
      screen.getByRole("button", {
        name: "Update password",
      })
    ).not.toBeDisabled();
  });

  it("should preserve the password button configuration", () => {
    render(<Profile />);

    const button = screen.getByRole("button", {
      name: "Update password",
    });

    expect(button).toHaveAttribute("name", "action");
    expect(button).toHaveAttribute("value", "password");
    expect(button).toHaveAttribute("type", "submit");
  });
});
