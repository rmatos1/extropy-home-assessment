import type {
  Category,
  CustomCategory,
  CustomCategoryResponse,
} from "@extropy/shared";

import {
  createCategoryRecord,
  getCategoriesByUserId,
} from "./categories.repository";
import { DEFAULT_CATEGORIES } from "./categories.constants";

function validateCategoryName(name: string): void {
  if (!name.trim()) {
    throw new Error("INVALID_CATEGORY_NAME");
  }
}

export async function createCategory(
  userId: string,
  categoryName: string
): Promise<CustomCategoryResponse> {
  const name = categoryName.trim();

  validateCategoryName(name);

  const now = new Date().toISOString();

  const category: CustomCategoryResponse = {
    id: crypto.randomUUID(),
    name,
    createdAt: now,
    updatedAt: now,
  };

  await createCategoryRecord({ ...category, userId });

  return category;
}

export async function getCategories(userId: string): Promise<Category[]> {
  const customCategories = await getCategoriesByUserId(userId);

  const categories = [...DEFAULT_CATEGORIES, ...customCategories];

  return categories.sort((a, b) => a.name.localeCompare(b.name));
}
