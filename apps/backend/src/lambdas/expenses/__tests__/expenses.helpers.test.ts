import { describe, expect, it } from "vitest";

import {
  validateAmount,
  validateCategoryId,
  validateDate,
  validateDescription,
} from "../expenses.helpers";

describe("validateAmount", () => {
  it("should accept a positive integer", () => {
    expect(() => validateAmount(100)).not.toThrow();
  });

  it("should reject zero", () => {
    expect(() => validateAmount(0)).toThrow("INVALID_AMOUNT");
  });

  it("should reject a negative number", () => {
    expect(() => validateAmount(-100)).toThrow("INVALID_AMOUNT");
  });

  it("should reject a decimal number", () => {
    expect(() => validateAmount(100.5)).toThrow("INVALID_AMOUNT");
  });

  it("should reject NaN", () => {
    expect(() => validateAmount(NaN)).toThrow("INVALID_AMOUNT");
  });

  it("should reject Infinity", () => {
    expect(() => validateAmount(Infinity)).toThrow("INVALID_AMOUNT");
  });
});

describe("validateDate", () => {
  it("should accept a date in YYYY-MM-DD format", () => {
    expect(() => validateDate("2026-08-26")).not.toThrow();
  });

  it("should reject a date without leading zeros", () => {
    expect(() => validateDate("2026-8-26")).toThrow("INVALID_DATE");
  });

  it("should reject a date with the wrong separator", () => {
    expect(() => validateDate("2026/08/26")).toThrow("INVALID_DATE");
  });

  it("should reject a date-time value", () => {
    expect(() => validateDate("2026-08-26T10:00:00.000Z")).toThrow(
      "INVALID_DATE"
    );
  });

  it("should reject an empty string", () => {
    expect(() => validateDate("")).toThrow("INVALID_DATE");
  });

  it("should reject arbitrary text", () => {
    expect(() => validateDate("invalid-date")).toThrow("INVALID_DATE");
  });
});

describe("validateDescription", () => {
  it("should accept a non-empty description", () => {
    expect(() => validateDescription("Lunch at restaurant")).not.toThrow();
  });

  it("should reject an empty description", () => {
    expect(() => validateDescription("")).toThrow("INVALID_DESCRIPTION");
  });

  it("should accept a description containing only spaces", () => {
    expect(() => validateDescription("   ")).not.toThrow();
  });
});

describe("validateCategoryId", () => {
  it("should accept a non-empty category id", () => {
    expect(() => validateCategoryId("food")).not.toThrow();
  });

  it("should reject an empty category id", () => {
    expect(() => validateCategoryId("")).toThrow("INVALID_CATEGORY");
  });

  it("should accept a category id containing only spaces", () => {
    expect(() => validateCategoryId("   ")).not.toThrow();
  });
});
