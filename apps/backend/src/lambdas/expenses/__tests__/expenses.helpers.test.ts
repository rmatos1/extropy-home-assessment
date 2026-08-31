import { describe, expect, it } from "vitest";

import {
  validateAmount,
  validateCategoryId,
  validateDate,
  validateDescription,
} from "../expenses.helpers";

describe("expenses.helpers", () => {
  describe("validateAmount", () => {
    it("should accept a positive integer", () => {
      expect(() => validateAmount(100)).not.toThrow();
    });

    it("should accept a positive amount with one decimal place", () => {
      expect(() => validateAmount(100.5)).not.toThrow();
    });

    it("should accept a positive amount with two decimal places", () => {
      expect(() => validateAmount(100.55)).not.toThrow();
    });

    it("should reject zero", () => {
      expect(() => validateAmount(0)).toThrow("INVALID_AMOUNT");
    });

    it("should reject negative amounts", () => {
      expect(() => validateAmount(-10)).toThrow("INVALID_AMOUNT");
    });

    it("should reject NaN", () => {
      expect(() => validateAmount(NaN)).toThrow("INVALID_AMOUNT");
    });

    it("should reject Infinity", () => {
      expect(() => validateAmount(Infinity)).toThrow("INVALID_AMOUNT");
    });

    it("should reject negative Infinity", () => {
      expect(() => validateAmount(-Infinity)).toThrow("INVALID_AMOUNT");
    });

    it("should reject amounts with more than two decimal places", () => {
      expect(() => validateAmount(100.123)).toThrow("INVALID_AMOUNT");
    });
  });

  describe("validateDate", () => {
    it("should accept a valid ISO date", () => {
      expect(() => validateDate("2026-08-30")).not.toThrow();
    });

    it("should accept another valid ISO date", () => {
      expect(() => validateDate("2025-01-01")).not.toThrow();
    });

    it("should reject a date with the wrong format", () => {
      expect(() => validateDate("30-08-2026")).toThrow("INVALID_DATE");
    });

    it("should reject a date using slashes", () => {
      expect(() => validateDate("2026/08/30")).toThrow("INVALID_DATE");
    });

    it("should reject a date with missing leading zeros", () => {
      expect(() => validateDate("2026-8-30")).toThrow("INVALID_DATE");
    });

    it("should reject an empty date", () => {
      expect(() => validateDate("")).toThrow("INVALID_DATE");
    });

    it("should reject a date with a timestamp", () => {
      expect(() => validateDate("2026-08-30T10:00:00.000Z")).toThrow(
        "INVALID_DATE"
      );
    });
  });

  describe("validateDescription", () => {
    it("should accept a non-empty description", () => {
      expect(() =>
        validateDescription("Monthly electricity bill")
      ).not.toThrow();
    });

    it("should reject an empty description", () => {
      expect(() => validateDescription("")).toThrow("INVALID_DESCRIPTION");
    });
  });

  describe("validateCategoryId", () => {
    it("should accept a non-empty category id", () => {
      expect(() => validateCategoryId("bills")).not.toThrow();
    });

    it("should reject an empty category id", () => {
      expect(() => validateCategoryId("")).toThrow("INVALID_CATEGORY");
    });
  });
});
