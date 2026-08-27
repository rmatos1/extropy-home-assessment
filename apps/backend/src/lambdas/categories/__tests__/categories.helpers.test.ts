import { describe, expect, it } from "vitest";

import { validateCategoryName } from "../categories.helpers";

describe("validateCategoryName", () => {
  it("should accept a valid category name", () => {
    expect(() => validateCategoryName("Food")).not.toThrow();
  });

  it("should reject an empty category name", () => {
    expect(() => validateCategoryName("")).toThrow("INVALID_CATEGORY_NAME");
  });

  it("should reject a category name containing only spaces", () => {
    expect(() => validateCategoryName("   ")).toThrow("INVALID_CATEGORY_NAME");
  });

  it("should accept a category name with surrounding spaces", () => {
    expect(() => validateCategoryName(" Food ")).not.toThrow();
  });
});
