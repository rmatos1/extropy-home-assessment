export function validateAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("INVALID_AMOUNT");
  }

  const decimalPlaces = amount.toString().split(".")[1]?.length ?? 0;

  if (decimalPlaces > 2) {
    throw new Error("INVALID_AMOUNT");
  }
}

export function validateDate(date: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("INVALID_DATE");
  }
}

export function validateDescription(description: string): void {
  if (!description) {
    throw new Error("INVALID_DESCRIPTION");
  }
}

export function validateCategoryId(categoryId: string): void {
  if (!categoryId) {
    throw new Error("INVALID_CATEGORY");
  }
}
