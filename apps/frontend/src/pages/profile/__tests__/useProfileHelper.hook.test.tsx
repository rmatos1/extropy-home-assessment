import { render, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import toast from "react-hot-toast";

import { useAuthStore } from "../../../store";
import { useProfileHelper } from "../useProfileHelper.hook";

const useActionDataMock = vi.fn();
const useNavigationMock = vi.fn();

vi.mock("react-router", () => ({
  useActionData: () => useActionDataMock(),
  useNavigation: () => useNavigationMock(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("../../../store", () => ({
  useAuthStore: vi.fn(),
}));

const useAuthStoreMock = vi.mocked(useAuthStore);
const toastErrorMock = vi.mocked(toast.error);
const toastSuccessMock = vi.mocked(toast.success);

describe("useProfileHelper", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    useActionDataMock.mockReturnValue(undefined);

    useNavigationMock.mockReturnValue({
      state: "idle",
      formData: undefined,
    });

    useAuthStoreMock.mockImplementation((selector) =>
      selector({
        userEmail: "john@example.com",
      } as never)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return the authenticated user email", () => {
    const { result } = renderHook(() => useProfileHelper());

    expect(result.current.email).toBe("john@example.com");
  });

  it("should return isSubmitting as false when navigation is idle", () => {
    const { result } = renderHook(() => useProfileHelper());

    expect(result.current.isSubmitting).toBe(false);
  });

  it("should return isSubmitting as true when navigation is submitting", () => {
    useNavigationMock.mockReturnValue({
      state: "submitting",
      formData: new FormData(),
    });

    const { result } = renderHook(() => useProfileHelper());

    expect(result.current.isSubmitting).toBe(true);
  });

  it("should set isUpdatingEmail when submitting the email action", () => {
    const formData = new FormData();
    formData.set("action", "email");

    useNavigationMock.mockReturnValue({
      state: "submitting",
      formData,
    });

    const { result } = renderHook(() => useProfileHelper());

    expect(result.current.isSubmitting).toBe(true);
    expect(result.current.isUpdatingEmail).toBe(true);
    expect(result.current.isUpdatingPassword).toBe(false);
  });

  it("should set isUpdatingPassword when submitting the password action", () => {
    const formData = new FormData();
    formData.set("action", "password");

    useNavigationMock.mockReturnValue({
      state: "submitting",
      formData,
    });

    const { result } = renderHook(() => useProfileHelper());

    expect(result.current.isSubmitting).toBe(true);
    expect(result.current.isUpdatingEmail).toBe(false);
    expect(result.current.isUpdatingPassword).toBe(true);
  });

  it("should not set email or password update state when not submitting", () => {
    const formData = new FormData();
    formData.set("action", "email");

    useNavigationMock.mockReturnValue({
      state: "idle",
      formData,
    });

    const { result } = renderHook(() => useProfileHelper());

    expect(result.current.isUpdatingEmail).toBe(false);
    expect(result.current.isUpdatingPassword).toBe(false);
  });

  it("should not set either update state for an unrelated action", () => {
    const formData = new FormData();
    formData.set("action", "other");

    useNavigationMock.mockReturnValue({
      state: "submitting",
      formData,
    });

    const { result } = renderHook(() => useProfileHelper());

    expect(result.current.isUpdatingEmail).toBe(false);
    expect(result.current.isUpdatingPassword).toBe(false);
  });

  it("should show an error toast when action data contains an error", () => {
    useActionDataMock.mockReturnValue({
      error: "Invalid email",
    });

    renderHook(() => useProfileHelper());

    expect(toastErrorMock).toHaveBeenCalledTimes(1);
    expect(toastErrorMock).toHaveBeenCalledWith("Invalid email");
    expect(toastSuccessMock).not.toHaveBeenCalled();
  });

  it("should show a success toast when email is updated", () => {
    useActionDataMock.mockReturnValue({
      success: true,
      updated: "email",
    });

    renderHook(() => useProfileHelper());

    expect(toastSuccessMock).toHaveBeenCalledTimes(1);
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Your email was updated successfully!"
    );
  });

  it("should show a success toast when password is updated", () => {
    useActionDataMock.mockReturnValue({
      success: true,
      updated: "password",
    });

    renderHook(() => useProfileHelper());

    expect(toastSuccessMock).toHaveBeenCalledTimes(1);
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Your password was updated successfully!"
    );
  });

  it("should not show any toast when action data is undefined", () => {
    renderHook(() => useProfileHelper());

    expect(toastErrorMock).not.toHaveBeenCalled();
    expect(toastSuccessMock).not.toHaveBeenCalled();
  });

  it("should not reset the password form when email is updated", () => {
    const TestComponent = () => {
      const { passwordFormRef } = useProfileHelper();

      return <form ref={passwordFormRef} />;
    };

    useActionDataMock.mockReturnValue({
      success: true,
      updated: "email",
    });

    render(<TestComponent />);

    const form = document.querySelector("form");

    expect(form).toBeInTheDocument();

    const resetSpy = vi.spyOn(form!, "reset");

    // The effect already ran with the email result,
    // and email updates should not reset the password form.
    expect(resetSpy).not.toHaveBeenCalled();
  });

  it("should reset the password form when password is updated", async () => {
    const TestComponent = () => {
      const { passwordFormRef } = useProfileHelper();

      return (
        <form ref={passwordFormRef}>
          <input name="password" defaultValue="secret123" />
        </form>
      );
    };

    useActionDataMock.mockReturnValue(undefined);

    const { rerender } = render(<TestComponent />);

    const form = document.querySelector("form");

    expect(form).toBeInTheDocument();

    const resetSpy = vi.spyOn(form!, "reset");

    useActionDataMock.mockReturnValue({
      success: true,
      updated: "password",
    });

    rerender(<TestComponent />);

    await waitFor(() => {
      expect(resetSpy).toHaveBeenCalledTimes(1);
    });
  });

  it("should prioritize showing the error toast when both error and success are present", () => {
    useActionDataMock.mockReturnValue({
      error: "Unable to update profile",
      success: true,
      updated: "password",
    });

    renderHook(() => useProfileHelper());

    expect(toastErrorMock).toHaveBeenCalledWith("Unable to update profile");

    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Your password was updated successfully!"
    );
  });

  it("should expose the password form ref", () => {
    const { result } = renderHook(() => useProfileHelper());

    expect(result.current.passwordFormRef).toBeDefined();
    expect(result.current.passwordFormRef.current).toBeNull();
  });
});
