import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AuthLayout } from "../";

const useNavigationMock = vi.fn();
const OutletMock = vi.fn();

vi.mock("react-router", () => ({
  Outlet: () => OutletMock(),
  useNavigation: () => useNavigationMock(),
}));

vi.mock("../../../components", () => ({
  LoadingScreen: () => <div data-testid="loading-screen">Loading...</div>,
}));

describe("AuthLayout", () => {
  it("should render the outlet content", () => {
    useNavigationMock.mockReturnValue({
      state: "idle",
    });

    OutletMock.mockReturnValue(
      <div data-testid="outlet-content">Auth content</div>
    );

    render(<AuthLayout />);

    expect(screen.getByTestId("outlet-content")).toBeInTheDocument();
  });

  it("should render the loading screen when navigation is loading", () => {
    useNavigationMock.mockReturnValue({
      state: "loading",
    });

    OutletMock.mockReturnValue(
      <div data-testid="outlet-content">Auth content</div>
    );

    render(<AuthLayout />);

    expect(screen.getByTestId("loading-screen")).toBeInTheDocument();
  });

  it("should not render the loading screen when navigation is idle", () => {
    useNavigationMock.mockReturnValue({
      state: "idle",
    });

    OutletMock.mockReturnValue(
      <div data-testid="outlet-content">Auth content</div>
    );

    render(<AuthLayout />);

    expect(screen.queryByTestId("loading-screen")).not.toBeInTheDocument();
  });

  it("should not render the loading screen when navigation is submitting", () => {
    useNavigationMock.mockReturnValue({
      state: "submitting",
    });

    OutletMock.mockReturnValue(
      <div data-testid="outlet-content">Auth content</div>
    );

    render(<AuthLayout />);

    expect(screen.queryByTestId("loading-screen")).not.toBeInTheDocument();
  });

  it("should render the main and section containers", () => {
    useNavigationMock.mockReturnValue({
      state: "idle",
    });

    OutletMock.mockReturnValue(
      <div data-testid="outlet-content">Auth content</div>
    );

    const { container } = render(<AuthLayout />);

    const main = container.querySelector("main");
    const section = container.querySelector("section");

    expect(main).toBeInTheDocument();
    expect(section).toBeInTheDocument();
  });

  it("should render the outlet even while navigation is loading", () => {
    useNavigationMock.mockReturnValue({
      state: "loading",
    });

    OutletMock.mockReturnValue(
      <div data-testid="outlet-content">Auth content</div>
    );

    render(<AuthLayout />);

    expect(screen.getByTestId("outlet-content")).toBeInTheDocument();

    expect(screen.getByTestId("loading-screen")).toBeInTheDocument();
  });
});
