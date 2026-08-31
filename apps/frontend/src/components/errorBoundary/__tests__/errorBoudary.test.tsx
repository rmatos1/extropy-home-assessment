import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ErrorBoundary } from "../";

const navigateMock = vi.fn();
const useRouteErrorMock = vi.fn();

vi.mock("react-router", () => ({
  useNavigate: () => navigateMock,
  useRouteError: () => useRouteErrorMock(),
}));

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should render the error title", () => {
    useRouteErrorMock.mockReturnValue(
      new Error("Something unexpected happened")
    );

    render(<ErrorBoundary />);

    expect(
      screen.getByRole("heading", {
        name: "Something went wrong",
      })
    ).toBeInTheDocument();
  });

  it("should render the error message when the error is an Error instance", () => {
    useRouteErrorMock.mockReturnValue(new Error("Database connection failed"));

    render(<ErrorBoundary />);

    expect(screen.getByText("Database connection failed")).toBeInTheDocument();
  });

  it("should render the default message when the route error is not an Error", () => {
    useRouteErrorMock.mockReturnValue({
      status: 500,
      statusText: "Internal Server Error",
    });

    render(<ErrorBoundary />);

    expect(
      screen.getByText("An unexpected error occurred.")
    ).toBeInTheDocument();
  });

  it("should render the Go home button", () => {
    useRouteErrorMock.mockReturnValue(new Error("Test error"));

    render(<ErrorBoundary />);

    expect(
      screen.getByRole("button", {
        name: "Go home",
      })
    ).toBeInTheDocument();
  });

  it("should navigate to the home page when Go home is clicked", async () => {
    const user = userEvent.setup();

    useRouteErrorMock.mockReturnValue(new Error("Test error"));

    render(<ErrorBoundary />);

    await user.click(
      screen.getByRole("button", {
        name: "Go home",
      })
    );

    expect(navigateMock).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/");
  });
});
