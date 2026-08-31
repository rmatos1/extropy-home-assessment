import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { LinkComponent } from "../";

describe("LinkComponent", () => {
  const renderLink = (to = "/expenses", text = "Expenses") => {
    return render(
      <MemoryRouter>
        <LinkComponent to={to} text={text} />
      </MemoryRouter>
    );
  };

  it("should render the provided text", () => {
    renderLink();

    expect(screen.getByRole("link", { name: "Expenses" })).toBeInTheDocument();
  });

  it("should render the correct destination", () => {
    renderLink("/categories", "Categories");

    expect(screen.getByRole("link", { name: "Categories" })).toHaveAttribute(
      "href",
      "/categories"
    );
  });

  it("should render the provided text and destination together", () => {
    renderLink("/profile", "Profile");

    const link = screen.getByRole("link", {
      name: "Profile",
    });

    expect(link).toHaveTextContent("Profile");
    expect(link).toHaveAttribute("href", "/profile");
  });

  it("should render the expected classes", () => {
    renderLink();

    expect(screen.getByRole("link", { name: "Expenses" })).toHaveClass(
      "text-blue-500",
      "hover:text-blue-700",
      "font-bold"
    );
  });
});
