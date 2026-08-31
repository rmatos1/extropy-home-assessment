import { describe, expect, it } from "vitest";

import { buildCategoryPrompt } from "../expenses.prompts";

describe("buildCategoryPrompt", () => {
  it("should include all categories in the prompt", () => {
    const result = buildCategoryPrompt({
      description: "Uber ride from airport",
      categories: [
        {
          id: "food",
          name: "Food",
        },
        {
          id: "transport",
          name: "Transport",
        },
        {
          id: "bills",
          name: "Bills",
        },
      ],
    });

    expect(result).toContain("- food: Food");
    expect(result).toContain("- transport: Transport");
    expect(result).toContain("- bills: Bills");
  });

  it("should include the expense description", () => {
    const result = buildCategoryPrompt({
      description: "Uber ride from airport",
      categories: [],
    });

    expect(result).toContain("Expense description:\nUber ride from airport");
  });

  it("should format categories separated by new lines", () => {
    const result = buildCategoryPrompt({
      description: "Restaurant dinner",
      categories: [
        {
          id: "food",
          name: "Food",
        },
        {
          id: "entertainment",
          name: "Entertainment",
        },
      ],
    });

    expect(result).toContain("- food: Food\n- entertainment: Entertainment");
  });

  it("should return a prompt with an empty category list", () => {
    const result = buildCategoryPrompt({
      description: "Some expense",
      categories: [],
    });

    expect(result).toBe(`
Categories:


Expense description:
Some expense
`);
  });

  it("should preserve the provided category order", () => {
    const result = buildCategoryPrompt({
      description: "Bus ticket",
      categories: [
        {
          id: "transport",
          name: "Transport",
        },
        {
          id: "food",
          name: "Food",
        },
        {
          id: "bills",
          name: "Bills",
        },
      ],
    });

    const transportIndex = result.indexOf("- transport: Transport");
    const foodIndex = result.indexOf("- food: Food");
    const billsIndex = result.indexOf("- bills: Bills");

    expect(transportIndex).toBeLessThan(foodIndex);
    expect(foodIndex).toBeLessThan(billsIndex);
  });
});
