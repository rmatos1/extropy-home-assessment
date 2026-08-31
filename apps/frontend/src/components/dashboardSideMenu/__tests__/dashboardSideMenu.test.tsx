import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DashboardSideMenu } from "../";

describe("DashboardSideMenu", () => {
  const renderMenu = (
    props: Partial<React.ComponentProps<typeof DashboardSideMenu>> = {},
    initialEntries = ["/overview"]
  ) => {
    const defaultProps = {
      isCollapsed: false,
      onToggleCollapse: vi.fn(),
      onClickLogout: vi.fn(),
      showMobileMenu: false,
      onCloseMobileMenu: vi.fn(),
    };

    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <DashboardSideMenu {...defaultProps} {...props} />
      </MemoryRouter>
    );
  };

  it("should render all navigation items", () => {
    renderMenu();

    expect(screen.getByRole("link", { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /expenses/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /categories/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /profile/i })).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /log out/i })
    ).toBeInTheDocument();
  });

  it("should render the menu title when expanded", () => {
    renderMenu({
      isCollapsed: false,
    });

    expect(screen.getByText("Personal Expense Tracker")).toBeInTheDocument();
  });

  it("should hide the menu title when collapsed", () => {
    renderMenu({
      isCollapsed: true,
    });

    expect(
      screen.queryByText("Personal Expense Tracker")
    ).not.toBeInTheDocument();
  });

  it("should hide navigation labels when collapsed", () => {
    renderMenu({
      isCollapsed: true,
    });

    expect(
      screen.queryByRole("link", { name: /overview/i })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: /expenses/i })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: /categories/i })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: /profile/i })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /log out/i })
    ).not.toBeInTheDocument();
  });

  it("should render navigation links with their correct destinations", () => {
    renderMenu();

    expect(screen.getByRole("link", { name: /overview/i })).toHaveAttribute(
      "href",
      "/overview"
    );

    expect(screen.getByRole("link", { name: /expenses/i })).toHaveAttribute(
      "href",
      "/expenses"
    );

    expect(screen.getByRole("link", { name: /categories/i })).toHaveAttribute(
      "href",
      "/categories"
    );

    expect(screen.getByRole("link", { name: /profile/i })).toHaveAttribute(
      "href",
      "/profile"
    );
  });

  it("should highlight the active navigation item", () => {
    renderMenu({}, ["/expenses"]);

    const expensesLink = screen.getByRole("link", {
      name: /expenses/i,
    });

    expect(expensesLink.className).toContain("bg-white/20");
    expect(expensesLink.className).toContain("font-bold");

    const overviewLink = screen.getByRole("link", {
      name: /overview/i,
    });

    expect(overviewLink.className).not.toContain("bg-white/20");
  });

  it("should call onToggleCollapse when the top button is clicked", async () => {
    const user = userEvent.setup();
    const onToggleCollapse = vi.fn();

    renderMenu({
      onToggleCollapse,
      showMobileMenu: false,
    });

    const buttons = screen.getAllByRole("button");

    await user.click(buttons[0]);

    expect(onToggleCollapse).toHaveBeenCalledTimes(1);
  });

  it("should close the mobile menu instead of toggling collapse", async () => {
    const user = userEvent.setup();

    const onToggleCollapse = vi.fn();
    const onCloseMobileMenu = vi.fn();

    renderMenu({
      showMobileMenu: true,
      onToggleCollapse,
      onCloseMobileMenu,
    });

    const buttons = screen.getAllByRole("button");

    await user.click(buttons[0]);

    expect(onCloseMobileMenu).toHaveBeenCalledTimes(1);
    expect(onToggleCollapse).not.toHaveBeenCalled();
  });

  it("should call onClickLogout when logout is clicked", async () => {
    const user = userEvent.setup();
    const onClickLogout = vi.fn();

    renderMenu({
      onClickLogout,
    });

    await user.click(screen.getByRole("button", { name: /log out/i }));

    expect(onClickLogout).toHaveBeenCalledTimes(1);
  });

  it("should not call onCloseMobileMenu when the menu is not open", async () => {
    const user = userEvent.setup();

    const onCloseMobileMenu = vi.fn();

    renderMenu({
      showMobileMenu: false,
      onCloseMobileMenu,
    });

    const buttons = screen.getAllByRole("button");

    await user.click(buttons[0]);

    expect(onCloseMobileMenu).not.toHaveBeenCalled();
  });

  it("should render the mobile menu when showMobileMenu is true", () => {
    renderMenu({
      showMobileMenu: true,
    });

    const aside = screen.getByRole("complementary");

    expect(aside.className).toContain("max-lg:translate-x-0");
    expect(aside.className).not.toContain("max-lg:-translate-x-full");
  });

  it("should hide the mobile menu when showMobileMenu is false", () => {
    renderMenu({
      showMobileMenu: false,
    });

    const aside = screen.getByRole("complementary");

    expect(aside.className).toContain("max-lg:-translate-x-full");
  });

  it("should use the collapsed width class when collapsed", () => {
    renderMenu({
      isCollapsed: true,
    });

    const aside = screen.getByRole("complementary");

    expect(aside.className).toContain("min-lg:w-20");
  });

  it("should use the expanded width class when not collapsed", () => {
    renderMenu({
      isCollapsed: false,
    });

    const aside = screen.getByRole("complementary");

    expect(aside.className).toContain("min-lg:w-2xs");
  });
});
