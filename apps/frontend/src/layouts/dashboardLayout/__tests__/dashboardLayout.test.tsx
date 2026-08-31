import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardLayout } from "../";

const useMatchesMock = vi.fn();
const useFetcherMock = vi.fn();

const submitMock = vi.fn();

vi.mock("react-router", () => ({
  Outlet: () => <div data-testid="outlet">Outlet content</div>,
  useMatches: () => useMatchesMock(),
  useFetcher: () => useFetcherMock(),
}));

vi.mock("../../../components", () => ({
  DashboardSideMenu: ({
    isCollapsed,
    showMobileMenu,
    onToggleCollapse,
    onClickLogout,
    onCloseMobileMenu,
  }: {
    isCollapsed: boolean;
    showMobileMenu: boolean;
    onToggleCollapse: () => void;
    onClickLogout: () => void;
    onCloseMobileMenu: () => void;
  }) => (
    <aside data-testid="dashboard-side-menu">
      <span data-testid="menu-collapsed">{String(isCollapsed)}</span>

      <span data-testid="mobile-menu-visible">{String(showMobileMenu)}</span>

      <button type="button" onClick={onToggleCollapse}>
        Toggle collapse
      </button>

      <button type="button" onClick={onClickLogout}>
        Open logout
      </button>

      <button type="button" onClick={onCloseMobileMenu}>
        Close mobile menu
      </button>
    </aside>
  ),

  DefaultModal: ({
    title,
    description,
    onClose,
    onConfirm,
    isProcessing,
    processingText,
    confirmTextButton,
  }: {
    title: string;
    description: string;
    onClose: () => void;
    onConfirm: () => void;
    isProcessing?: boolean;
    processingText?: string;
    confirmTextButton: string;
  }) => (
    <div data-testid="default-modal">
      <h2>{title}</h2>
      <p>{description}</p>

      <button type="button" onClick={onClose}>
        Modal cancel
      </button>

      <button type="button" onClick={onConfirm}>
        {isProcessing ? processingText : confirmTextButton}
      </button>
    </div>
  ),
}));

vi.mock("../../../icons", () => ({
  MenuIcon: () => <span data-testid="menu-icon">Menu</span>,
}));

describe("DashboardLayout", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    useMatchesMock.mockReturnValue([
      {
        id: "root",
        handle: {},
      },
      {
        id: "overview",
        handle: {
          name: "Overview",
        },
      },
    ]);

    useFetcherMock.mockReturnValue({
      state: "idle",
      submit: submitMock,
    });
  });

  it("should render the current page title from the route handle", () => {
    render(<DashboardLayout />);

    expect(
      screen.getByRole("heading", { name: "Overview" })
    ).toBeInTheDocument();
  });

  it("should use an empty page title when no route handle contains a name", () => {
    useMatchesMock.mockReturnValue([
      {
        id: "root",
        handle: {},
      },
      {
        id: "expenses",
        handle: {},
      },
    ]);

    render(<DashboardLayout />);

    expect(screen.getByRole("heading")).toHaveTextContent("");
  });

  it("should render the outlet", () => {
    render(<DashboardLayout />);

    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });

  it("should render the mobile menu button", () => {
    render(<DashboardLayout />);

    expect(
      screen.getByRole("button", { name: "Open menu" })
    ).toBeInTheDocument();
  });

  it("should open the mobile menu when the menu button is clicked", async () => {
    const user = userEvent.setup();

    render(<DashboardLayout />);

    expect(screen.getByTestId("mobile-menu-visible")).toHaveTextContent(
      "false"
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByTestId("mobile-menu-visible")).toHaveTextContent("true");

    expect(screen.getByTestId("menu-collapsed")).toHaveTextContent("false");
  });

  it("should render the mobile overlay when the mobile menu is open", async () => {
    const user = userEvent.setup();

    render(<DashboardLayout />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(
      document.querySelector(".fixed.z-2.inset-0.bg-black\\/50")
    ).toBeInTheDocument();
  });

  it("should close the mobile menu when the overlay is clicked", async () => {
    const user = userEvent.setup();

    render(<DashboardLayout />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    const overlay = document.querySelector(".fixed.z-2.inset-0.bg-black\\/50");

    expect(overlay).toBeInTheDocument();

    await user.click(overlay!);

    expect(screen.getByTestId("mobile-menu-visible")).toHaveTextContent(
      "false"
    );
  });

  it("should close the mobile menu when the side menu requests it", async () => {
    const user = userEvent.setup();

    render(<DashboardLayout />);

    await user.click(
      screen.getByRole("button", {
        name: "Close mobile menu",
      })
    );

    expect(screen.getByTestId("mobile-menu-visible")).toHaveTextContent(
      "false"
    );
  });

  it("should toggle the collapsed state", async () => {
    const user = userEvent.setup();

    render(<DashboardLayout />);

    expect(screen.getByTestId("menu-collapsed")).toHaveTextContent("false");

    await user.click(
      screen.getByRole("button", {
        name: "Toggle collapse",
      })
    );

    expect(screen.getByTestId("menu-collapsed")).toHaveTextContent("true");

    await user.click(
      screen.getByRole("button", {
        name: "Toggle collapse",
      })
    );

    expect(screen.getByTestId("menu-collapsed")).toHaveTextContent("false");
  });

  it("should open the logout modal", async () => {
    const user = userEvent.setup();

    render(<DashboardLayout />);

    expect(screen.queryByTestId("default-modal")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Open logout",
      })
    );

    expect(screen.getByTestId("default-modal")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Log out" })
    ).toBeInTheDocument();

    expect(
      screen.getByText("Are you sure you want to log out?")
    ).toBeInTheDocument();
  });

  it("should close the logout modal", async () => {
    const user = userEvent.setup();

    render(<DashboardLayout />);

    await user.click(
      screen.getByRole("button", {
        name: "Open logout",
      })
    );

    expect(screen.getByTestId("default-modal")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Modal cancel",
      })
    );

    expect(screen.queryByTestId("default-modal")).not.toBeInTheDocument();
  });

  it("should submit the logout request when confirming", async () => {
    const user = userEvent.setup();

    render(<DashboardLayout />);

    await user.click(
      screen.getByRole("button", {
        name: "Open logout",
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: "Log out",
      })
    );

    expect(submitMock).toHaveBeenCalledTimes(1);
    expect(submitMock).toHaveBeenCalledWith(null, {
      method: "post",
      action: "/logout",
    });
  });

  it("should pass the logout processing state to the modal", async () => {
    const user = userEvent.setup();

    useFetcherMock.mockReturnValue({
      state: "submitting",
      submit: submitMock,
    });

    render(<DashboardLayout />);

    await user.click(
      screen.getByRole("button", {
        name: "Open logout",
      })
    );

    expect(
      screen.getByRole("button", {
        name: "Logging out...",
      })
    ).toBeInTheDocument();
  });

  it("should find the first route match containing a route name", () => {
    useMatchesMock.mockReturnValue([
      {
        id: "root",
        handle: {
          name: "Root",
        },
      },
      {
        id: "overview",
        handle: {
          name: "Overview",
        },
      },
    ]);

    render(<DashboardLayout />);

    expect(screen.getByRole("heading", { name: "Root" })).toBeInTheDocument();
  });
});
