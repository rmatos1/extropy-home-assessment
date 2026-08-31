import { beforeEach, describe, expect, it } from "vitest";

import type { Category } from "@extropy/shared";

import { useCategoriesStore } from "../";

describe("useCategoriesStore", () => {
  const categories: Category[] = [
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
  ];

  beforeEach(() => {
    useCategoriesStore.setState({
      categories: [],
    });
  });

  it("should initialize with an empty categories list", () => {
    expect(useCategoriesStore.getState().categories).toEqual([]);
  });

  it("should set categories sorted alphabetically", () => {
    useCategoriesStore.getState().setCategories(categories);

    expect(useCategoriesStore.getState().categories).toEqual([
      categories[2], // Bills
      categories[1], // Food
      categories[0], // Transport
    ]);
  });

  it("should sort categories alphabetically when setting categories", () => {
    useCategoriesStore.getState().setCategories(categories);

    expect(useCategoriesStore.getState().categories).toEqual([
      categories[2], // Bills
      categories[1], // Food
      categories[0], // Transport
    ]);
  });

  it("should not mutate the original categories array", () => {
    const originalCategories = [...categories];

    useCategoriesStore.getState().setCategories(categories);

    expect(categories).toEqual(originalCategories);
  });

  it("should add a category", () => {
    useCategoriesStore.getState().setCategories([
      {
        id: "food",
        name: "Food",
      },
    ]);

    const category = {
      id: "transport",
      name: "Transport",
    };

    useCategoriesStore.getState().addCategory(category);

    expect(useCategoriesStore.getState().categories).toEqual([
      {
        id: "food",
        name: "Food",
      },
      {
        id: "transport",
        name: "Transport",
      },
    ]);
  });

  it("should insert a new category in alphabetical order", () => {
    useCategoriesStore.getState().setCategories([
      {
        id: "bills",
        name: "Bills",
      },
      {
        id: "transport",
        name: "Transport",
      },
    ]);

    useCategoriesStore.getState().addCategory({
      id: "food",
      name: "Food",
    });

    expect(
      useCategoriesStore.getState().categories.map((category) => category.name)
    ).toEqual(["Bills", "Food", "Transport"]);
  });

  it("should preserve the existing categories when adding a new category", () => {
    const initialCategories = [
      {
        id: "food",
        name: "Food",
      },
    ];

    useCategoriesStore.getState().setCategories(initialCategories);

    useCategoriesStore.getState().addCategory({
      id: "transport",
      name: "Transport",
    });

    expect(useCategoriesStore.getState().categories).toEqual([
      {
        id: "food",
        name: "Food",
      },
      {
        id: "transport",
        name: "Transport",
      },
    ]);
  });

  it("should not mutate the existing store array when adding a category", () => {
    const initialCategories = [
      {
        id: "food",
        name: "Food",
      },
    ];

    useCategoriesStore.getState().setCategories(initialCategories);

    const previousState = useCategoriesStore.getState().categories;

    useCategoriesStore.getState().addCategory({
      id: "transport",
      name: "Transport",
    });

    expect(useCategoriesStore.getState().categories).not.toBe(previousState);
  });

  it("should handle an empty categories list", () => {
    useCategoriesStore.getState().setCategories([]);

    expect(useCategoriesStore.getState().categories).toEqual([]);
  });

  it("should handle adding a category to an empty list", () => {
    const category = {
      id: "food",
      name: "Food",
    };

    useCategoriesStore.getState().addCategory(category);

    expect(useCategoriesStore.getState().categories).toEqual([category]);
  });

  it("should sort categories case-insensitively according to localeCompare", () => {
    useCategoriesStore.getState().setCategories([
      {
        id: "z",
        name: "Zoo",
      },
      {
        id: "a",
        name: "Apple",
      },
      {
        id: "m",
        name: "Market",
      },
    ]);

    expect(
      useCategoriesStore.getState().categories.map((category) => category.name)
    ).toEqual(["Apple", "Market", "Zoo"]);
  });
});
