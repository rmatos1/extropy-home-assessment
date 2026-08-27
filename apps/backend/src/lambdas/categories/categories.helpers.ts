export function validateCategoryName(name: string): void {
  if (!name.trim()) {
    throw new Error("INVALID_CATEGORY_NAME");
  }
}
