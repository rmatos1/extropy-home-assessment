import { create } from "zustand";

import type { Category } from "@extropy/shared";

type CategoriesState = {
  categories: Category[];
  setCategories: (value: Category[]) => void;
  addCategory: (value: Category) => void;
};

const sortCategories = (categories: Category[]) =>
  [...categories].sort((a, b) => a.name.localeCompare(b.name));

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],

  setCategories: (value) =>
    set({
      categories: sortCategories(value),
    }),

  addCategory: (value) =>
    set((state) => ({
      categories: sortCategories([...state.categories, value]),
    })),
}));
