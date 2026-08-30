import type { Category, CustomCategoryResponse } from "@extropy/shared";

import { api } from "../api";
import { useCategoriesStore } from "../../store";

export async function getCategories(): Promise<Category[]> {
  const { categories } = useCategoriesStore.getState();

  if (categories.length > 0) {
    return categories;
  }

  const response = await api<Category[]>("/categories", {
    method: "GET",
  });

  useCategoriesStore.getState().setCategories(response);

  return response;
}

export async function createCategory(
  categoryName: string
): Promise<CustomCategoryResponse> {
  const category = await api<CustomCategoryResponse>("/categories", {
    method: "POST",
    body: JSON.stringify({ categoryName }),
  });

  useCategoriesStore.getState().addCategory(category);

  return category;
}
